const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';
const DB_NAME = process.env.DB_NAME || 'mallify';

function parseArgs() {
  const args = process.argv.slice(2);
  const getValue = (flag) => {
    const index = args.indexOf(flag);
    if (index === -1 || index + 1 >= args.length) {
      return undefined;
    }
    return args[index + 1];
  };

  return {
    sourceBoutiqueId: getValue('--source') || process.env.SOURCE_BOUTIQUE_ID,
    targetBoutiqueId: getValue('--target') || process.env.TARGET_BOUTIQUE_ID,
    targetOwnerId: getValue('--owner') || process.env.TARGET_OWNER_ID,
    slugOverride: getValue('--slug') || process.env.TARGET_BOUTIQUE_SLUG,
    skipOrders: args.includes('--skipOrders'),
  };
}

function toObjectId(value, label) {
  try {
    return new ObjectId(value);
  } catch (error) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

function cloneDate(value, fallback = new Date()) {
  if (!value) {
    return new Date(fallback);
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  return new Date(value);
}

function buildBoutiqueUpdate({ sourceBoutique, targetBoutique, ownerOverride, slugOverride }) {
  const skipKeys = new Set(['_id', 'ownerId', 'email', 'phone']);
  const update = {};

  Object.entries(sourceBoutique).forEach(([key, value]) => {
    if (!skipKeys.has(key)) {
      update[key] = value;
    }
  });

  if (slugOverride) {
    update.slug = slugOverride;
  } else if (targetBoutique && targetBoutique.slug) {
    update.slug = targetBoutique.slug;
  } else if (sourceBoutique.slug) {
    update.slug = sourceBoutique.slug;
  }

  if (ownerOverride) {
    update.ownerId = ownerOverride._id;
    if (ownerOverride.email) {
      update.email = ownerOverride.email;
    }
    if (ownerOverride.phone) {
      update.phone = ownerOverride.phone;
    }
  } else if (targetBoutique && targetBoutique.ownerId) {
    update.ownerId = targetBoutique.ownerId;
    update.email = targetBoutique.email;
    update.phone = targetBoutique.phone;
  } else {
    update.ownerId = sourceBoutique.ownerId;
    update.email = sourceBoutique.email;
    update.phone = sourceBoutique.phone;
  }

  update.updatedAt = new Date();
  if (!update.createdAt) {
    update.createdAt = sourceBoutique.createdAt ? cloneDate(sourceBoutique.createdAt) : new Date();
  }

  return update;
}

async function cloneProducts({ productsCollection, reviewsCollection }, sourceBoutiqueId, targetBoutiqueId) {
  const [sourceProducts, targetProductDocs] = await Promise.all([
    productsCollection.find({ boutiqueId: sourceBoutiqueId }).toArray(),
    productsCollection.find({ boutiqueId: targetBoutiqueId }).project({ _id: 1 }).toArray(),
  ]);

  if (targetProductDocs.length) {
    const targetProductIds = targetProductDocs.map((doc) => doc._id);
    await Promise.all([
      reviewsCollection.deleteMany({ productId: { $in: targetProductIds } }),
      productsCollection.deleteMany({ _id: { $in: targetProductIds } }),
    ]);
  }

  if (!sourceProducts.length) {
    console.warn('⚠️  No source products found for this boutique.');
    return { inserted: 0, productIdMap: new Map() };
  }

  const productIdMap = new Map();
  const clonedProducts = sourceProducts.map((product, index) => {
    const { _id, boutiqueId, createdAt, updatedAt, ...rest } = product;
    const newId = new ObjectId();
    productIdMap.set(_id.toString(), newId);
    const suffix = `-${targetBoutiqueId.toHexString().slice(-4)}-${index + 1}`;
    return {
      ...rest,
      sku: rest.sku ? `${rest.sku}${suffix}` : undefined,
      barcode: rest.barcode ? `${rest.barcode}${suffix}` : undefined,
      slug: rest.slug ? `${rest.slug}${suffix}` : undefined,
      _id: newId,
      boutiqueId: targetBoutiqueId,
      createdAt: cloneDate(createdAt),
      updatedAt: new Date(),
    };
  });

  await productsCollection.insertMany(clonedProducts);

  return {
    inserted: clonedProducts.length,
    productIdMap,
  };
}

async function clonePayments(paymentsCollection, sourceOrderIds, orderIdMap) {
  if (!sourceOrderIds.length) {
    return { inserted: 0 };
  }

  const sourcePayments = await paymentsCollection
    .find({ orderId: { $in: sourceOrderIds } })
    .toArray();

  if (!sourcePayments.length) {
    return { inserted: 0 };
  }

  const clonedPayments = sourcePayments
    .map((payment, index) => {
      const mappedOrderId = orderIdMap.get(payment.orderId?.toString());
      if (!mappedOrderId) {
        return null;
      }

      const { _id, orderId, transactionId, createdAt, updatedAt, ...rest } = payment;
      return {
        ...rest,
        _id: new ObjectId(),
        orderId: mappedOrderId,
        transactionId: transactionId ? `${transactionId}-COPY-${index + 1}` : undefined,
        createdAt: cloneDate(createdAt),
        updatedAt: new Date(),
      };
    })
    .filter(Boolean);

  if (clonedPayments.length) {
    await paymentsCollection.insertMany(clonedPayments);
  }

  return { inserted: clonedPayments.length };
}

async function cloneDeliveries(deliveriesCollection, sourceOrderIds, orderIdMap) {
  if (!sourceOrderIds.length) {
    return { inserted: 0 };
  }

  const sourceDeliveries = await deliveriesCollection
    .find({ orderId: { $in: sourceOrderIds } })
    .toArray();

  if (!sourceDeliveries.length) {
    return { inserted: 0 };
  }

  const clonedDeliveries = sourceDeliveries
    .map((delivery, index) => {
      const mappedOrderId = orderIdMap.get(delivery.orderId?.toString());
      if (!mappedOrderId) {
        return null;
      }

      const { _id, orderId, order, trackingNumber, createdAt, updatedAt, ...rest } = delivery;
      return {
        ...rest,
        _id: new ObjectId(),
        orderId: mappedOrderId,
        order: mappedOrderId,
        trackingNumber: trackingNumber ? `${trackingNumber}-COPY-${index + 1}` : undefined,
        createdAt: cloneDate(createdAt),
        updatedAt: new Date(),
      };
    })
    .filter(Boolean);

  if (clonedDeliveries.length) {
    await deliveriesCollection.insertMany(clonedDeliveries);
  }

  return { inserted: clonedDeliveries.length };
}

async function cloneReviews(reviewsCollection, productIdMap, orderIdMap) {
  if (!productIdMap.size) {
    return { inserted: 0 };
  }

  const sourceProductIds = Array.from(productIdMap.keys()).map((id) => new ObjectId(id));
  const sourceReviews = await reviewsCollection
    .find({ productId: { $in: sourceProductIds } })
    .toArray();

  if (!sourceReviews.length) {
    return { inserted: 0 };
  }

  const clonedReviews = sourceReviews
    .map((review) => {
      const mappedProductId = productIdMap.get(review.productId?.toString());
      if (!mappedProductId) {
        return null;
      }

      const mappedOrderId = review.orderId ? orderIdMap.get(review.orderId.toString()) : undefined;
      const { _id, productId, orderId, createdAt, updatedAt, ...rest } = review;
      const clone = {
        ...rest,
        _id: new ObjectId(),
        productId: mappedProductId,
        createdAt: cloneDate(createdAt),
        updatedAt: new Date(),
      };

      if (mappedOrderId) {
        clone.orderId = mappedOrderId;
      }

      return clone;
    })
    .filter(Boolean);

  if (clonedReviews.length) {
    await reviewsCollection.insertMany(clonedReviews);
  }

  return { inserted: clonedReviews.length };
}

async function cloneOrdersAndRelated(collections, sourceBoutiqueId, targetBoutiqueId, productIdMap) {
  const { ordersCollection, paymentsCollection, deliveriesCollection, reviewsCollection } = collections;

  const [sourceOrders, existingTargetOrders] = await Promise.all([
    ordersCollection.find({ boutiqueId: sourceBoutiqueId }).toArray(),
    ordersCollection.find({ boutiqueId: targetBoutiqueId }).project({ _id: 1 }).toArray(),
  ]);

  if (existingTargetOrders.length) {
    const existingIds = existingTargetOrders.map((doc) => doc._id);
    await Promise.all([
      paymentsCollection.deleteMany({ orderId: { $in: existingIds } }),
      deliveriesCollection.deleteMany({ orderId: { $in: existingIds } }),
      ordersCollection.deleteMany({ _id: { $in: existingIds } }),
    ]);
  }

  if (!sourceOrders.length) {
    console.warn('⚠️  No source orders found for this boutique.');
    return {
      ordersInserted: 0,
      skippedOrders: 0,
      paymentsInserted: 0,
      deliveriesInserted: 0,
      reviewsInserted: 0,
    };
  }

  const clonedOrders = [];
  const orderIdMap = new Map();
  const sourceOrderIds = [];
  let skippedOrders = 0;

  sourceOrders.forEach((order, index) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const clonedItems = items
      .map((item) => {
        const mappedProductId = item.productId ? productIdMap.get(item.productId.toString()) : undefined;
        if (!mappedProductId) {
          return null;
        }
        return {
          ...item,
          productId: mappedProductId,
        };
      })
      .filter(Boolean);

    if (!clonedItems.length) {
      skippedOrders += 1;
      return;
    }

    const newOrderId = new ObjectId();
    orderIdMap.set(order._id.toString(), newOrderId);
    sourceOrderIds.push(order._id);

    const { _id, boutiqueId, orderNumber, createdAt, updatedAt, ...rest } = order;

    clonedOrders.push({
      ...rest,
      _id: newOrderId,
      boutiqueId: targetBoutiqueId,
      orderNumber: `${orderNumber || 'ORD'}-COPY-${index + 1}`,
      items: clonedItems,
      createdAt: cloneDate(createdAt),
      updatedAt: new Date(),
    });
  });

  if (clonedOrders.length) {
    await ordersCollection.insertMany(clonedOrders);
  }

  const paymentStats = await clonePayments(paymentsCollection, sourceOrderIds, orderIdMap);
  const deliveryStats = await cloneDeliveries(deliveriesCollection, sourceOrderIds, orderIdMap);
  const reviewStats = await cloneReviews(reviewsCollection, productIdMap, orderIdMap);

  return {
    ordersInserted: clonedOrders.length,
    skippedOrders,
    paymentsInserted: paymentStats.inserted,
    deliveriesInserted: deliveryStats.inserted,
    reviewsInserted: reviewStats.inserted,
  };
}

async function run() {
  const options = parseArgs();

  if (!options.sourceBoutiqueId || !options.targetBoutiqueId) {
    throw new Error('Both --source and --target boutique ids are required.');
  }

  if (options.sourceBoutiqueId === options.targetBoutiqueId) {
    throw new Error('Source and target boutique ids must be different.');
  }

  const sourceBoutiqueId = toObjectId(options.sourceBoutiqueId, 'source boutique id');
  const targetBoutiqueId = toObjectId(options.targetBoutiqueId, 'target boutique id');
  const ownerOverrideId = options.targetOwnerId ? toObjectId(options.targetOwnerId, 'target owner id') : null;

  console.log('🔄 Starting boutique data cloning...');

  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const collections = {
      boutiques: db.collection('boutiques'),
      products: db.collection('products'),
      orders: db.collection('orders'),
      payments: db.collection('payments'),
      deliveries: db.collection('deliveries'),
      reviews: db.collection('reviews'),
      users: db.collection('users'),
    };

    const [sourceBoutique, targetBoutique, ownerOverride] = await Promise.all([
      collections.boutiques.findOne({ _id: sourceBoutiqueId }),
      collections.boutiques.findOne({ _id: targetBoutiqueId }),
      ownerOverrideId ? collections.users.findOne({ _id: ownerOverrideId }) : Promise.resolve(null),
    ]);

    if (!sourceBoutique) {
      throw new Error('Source boutique was not found in the database.');
    }

    if (ownerOverrideId && !ownerOverride) {
      throw new Error('Target owner id was provided but no matching user was found.');
    }

    if (!targetBoutique) {
      console.log('ℹ️  Target boutique does not exist yet. It will be created.');
    }

    const boutiqueUpdate = buildBoutiqueUpdate({
      sourceBoutique,
      targetBoutique,
      ownerOverride,
      slugOverride: options.slugOverride,
    });

    await collections.boutiques.updateOne(
      { _id: targetBoutiqueId },
      { $set: boutiqueUpdate },
      { upsert: true }
    );

    console.log('✅ Boutique document updated.');

    const { inserted: productCount, productIdMap } = await cloneProducts(
      {
        productsCollection: collections.products,
        reviewsCollection: collections.reviews,
      },
      sourceBoutiqueId,
      targetBoutiqueId
    );

    console.log(`✅ Cloned ${productCount} products.`);

    if (!productCount) {
      console.warn('⚠️  No products cloned; skipping orders and reviews.');
      return;
    }

    if (options.skipOrders) {
      console.log('ℹ️  skipOrders flag detected. Orders, payments, deliveries, and reviews will not be cloned.');
      return;
    }

    const orderStats = await cloneOrdersAndRelated(
      {
        ordersCollection: collections.orders,
        paymentsCollection: collections.payments,
        deliveriesCollection: collections.deliveries,
        reviewsCollection: collections.reviews,
      },
      sourceBoutiqueId,
      targetBoutiqueId,
      productIdMap
    );

    console.log(`✅ Cloned ${orderStats.ordersInserted} orders (${orderStats.skippedOrders} skipped).`);
    console.log(`✅ Cloned ${orderStats.paymentsInserted} payments and ${orderStats.deliveriesInserted} deliveries.`);
    console.log(`✅ Cloned ${orderStats.reviewsInserted} reviews tied to the new products.`);
    console.log('🎉 Boutique cloning complete.');
  } finally {
    await client.close();
  }
}

run().catch((error) => {
  console.error('❌ Failed to clone boutique data:', error.message);
  process.exit(1);
});
