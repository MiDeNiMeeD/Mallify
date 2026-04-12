import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { createLogger } from '@mallify/shared';

const logger = createLogger('order-controller');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

const parseCompositeProductId = (value: unknown): {
  productId: string;
  color?: string;
  size?: string;
} => {
  const raw = String(value || '').trim();
  if (!raw) {
    return { productId: '' };
  }

  const [baseProductId, color, size] = raw.split('::');
  return {
    productId: String(baseProductId || raw),
    color: color ? String(color) : undefined,
    size: size ? String(size) : undefined,
  };
};

const resolveStoreIdForCheckoutItem = async (item: any): Promise<string> => {
  const directStore = String(item?.storeId || item?.boutiqueId || '').trim();
  if (directStore && directStore !== 'unknown-store') {
    return directStore;
  }

  const parsed = parseCompositeProductId(item?.productId);
  if (!parsed.productId) {
    return 'unknown-store';
  }

  try {
    const response = await fetch(`${PRODUCT_SERVICE_URL}/api/products/${encodeURIComponent(parsed.productId)}`);
    if (!response.ok) {
      return 'unknown-store';
    }

    const payload: any = await response.json();
    const product = payload?.data?.product || payload?.product || payload;
    const resolved = String(
      product?.boutiqueId || product?.storeId || product?.boutique?._id || product?.boutique?.id || ''
    ).trim();

    return resolved || 'unknown-store';
  } catch {
    return 'unknown-store';
  }
};

const generateOrderNumber = (prefix = 'ORD'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};

const calculateOrderProgressStatus = (input: {
  totalStores: number;
  confirmedStores: number;
  rejectedStores: number;
}): {
  pendingStores: number;
  confirmationPercent: number;
  status: string;
} => {
  const totalStores = Math.max(0, Number(input.totalStores || 0));
  const confirmedStores = Math.max(0, Number(input.confirmedStores || 0));
  const rejectedStores = Math.max(0, Number(input.rejectedStores || 0));
  const pendingStores = Math.max(0, totalStores - confirmedStores - rejectedStores);
  const confirmationPercent = totalStores > 0 ? Math.round((confirmedStores / totalStores) * 100) : 0;

  let status = 'pending';
  if (rejectedStores === totalStores && totalStores > 0) {
    status = 'rejected';
  } else if (confirmedStores === totalStores && totalStores > 0) {
    status = 'confirmed';
  } else if (rejectedStores > 0) {
    status = 'partially_rejected';
  } else if (confirmedStores > 0) {
    status = 'partially_confirmed';
  }

  return { pendingStores, confirmationPercent, status };
};

const applyParentProgressFromEmbeddedStoreOrders = (parentOrder: any): void => {
  const storeOrders = Array.isArray(parentOrder.storeOrders) ? parentOrder.storeOrders : [];
  const confirmedStores = storeOrders.filter((entry: any) => String(entry.status) === 'confirmed').length;
  const rejectedStores = storeOrders.filter((entry: any) =>
    ['rejected', 'cancelled'].includes(String(entry.status))
  ).length;
  const totalStores = storeOrders.length;

  const { pendingStores, confirmationPercent, status } = calculateOrderProgressStatus({
    totalStores,
    confirmedStores,
    rejectedStores,
  });

  const payableTotal = storeOrders
    .filter((entry: any) => !['rejected', 'cancelled'].includes(String(entry.status)))
    .reduce((sum: number, entry: any) => sum + Number(entry.total || 0), 0);

  parentOrder.totalStores = totalStores;
  parentOrder.confirmedStores = confirmedStores;
  parentOrder.rejectedStores = rejectedStores;
  parentOrder.pendingStores = pendingStores;
  parentOrder.confirmationPercent = confirmationPercent;
  parentOrder.status = status;
  parentOrder.payableTotal = payableTotal;
};

export const getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20, status, userId, boutiqueId, storeId, orderType } = req.query;
    const query: any = {};
    
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (boutiqueId) query.boutiqueId = boutiqueId;
    if (storeId) query.storeId = storeId;
    query.orderType = String(orderType || (storeId ? 'store' : 'parent'));

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    let responseOrders: any[] = [];
    let total = 0;

    if (storeId) {
      const storeQuery: any = { orderType: 'parent', 'storeOrders.storeId': storeId };
      if (status) {
        storeQuery['storeOrders.status'] = status;
      }
      if (userId) {
        storeQuery.userId = userId;
      }

      const parents = await Order.find(storeQuery).sort('-createdAt').lean();
      const flattened = parents.flatMap((parent: any) => {
        const storeSegments = Array.isArray(parent.storeOrders)
          ? parent.storeOrders.filter((segment: any) => String(segment.storeId) === String(storeId))
          : [];

        return storeSegments.map((segment: any) => ({
          _id: segment._id,
          orderNumber: parent.orderNumber,
          orderType: 'store',
          parentOrderId: parent._id,
          userId: parent.userId,
          boutiqueId: segment.boutiqueId || segment.storeId,
          storeId: segment.storeId,
          items: Array.isArray(segment.items) ? segment.items : [],
          subtotal: Number(segment.subtotal || 0),
          tax: Number(segment.tax || 0),
          shippingCost: Number(segment.shippingCost || 0),
          discount: Number(segment.discount || 0),
          total: Number(segment.total || 0),
          originalTotal: Number(segment.originalTotal || segment.total || 0),
          payableTotal: Number(segment.payableTotal || segment.total || 0),
          status: String(segment.status || 'pending'),
          statusNotes: segment.statusNotes || {},
          statusHistory: Array.isArray(segment.statusHistory) ? segment.statusHistory : [],
          statusNote: segment?.statusNotes?.[String(segment.status || 'pending')] || '',
          paymentStatus: parent.paymentStatus,
          shippingAddress: parent.shippingAddress,
          createdAt: parent.createdAt,
          updatedAt: parent.updatedAt,
        }));
      });

      total = flattened.length;
      responseOrders = flattened.slice(skip, skip + limitNum);
    } else {
      const parentQuery: any = { ...query, orderType: 'parent' };
      const [orders, totalCount] = await Promise.all([
        Order.find(parentQuery).sort('-createdAt').skip(skip).limit(limitNum).lean(),
        Order.countDocuments(parentQuery),
      ]);
      responseOrders = orders;
      total = totalCount;
    }

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders: responseOrders,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
      },
    });
  } catch (error) {
    logger.error('Error retrieving orders:', error);
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (order) {
      res.json({ success: true, data: { order } });
      return;
    }

    const parentWithStoreSegment = await Order.findOne({
      orderType: 'parent',
      'storeOrders._id': req.params.id,
    }).lean();

    if (!parentWithStoreSegment) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const segment = (parentWithStoreSegment.storeOrders || []).find(
      (entry: any) => String(entry._id) === String(req.params.id)
    );

    if (!segment) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        order: {
          _id: segment._id,
          orderNumber: parentWithStoreSegment.orderNumber,
          orderType: 'store',
          parentOrderId: parentWithStoreSegment._id,
          userId: parentWithStoreSegment.userId,
          storeId: segment.storeId,
          boutiqueId: segment.boutiqueId || segment.storeId,
          items: segment.items || [],
          subtotal: segment.subtotal,
          tax: segment.tax,
          shippingCost: segment.shippingCost,
          discount: segment.discount,
          total: segment.total,
          originalTotal: segment.originalTotal,
          payableTotal: segment.payableTotal,
          status: segment.status,
          statusNotes: segment.statusNotes || {},
          statusHistory: Array.isArray(segment.statusHistory) ? segment.statusHistory : [],
          statusNote: segment?.statusNotes?.[String(segment.status || 'pending')] || '',
          paymentStatus: parentWithStoreSegment.paymentStatus,
          shippingAddress: parentWithStoreSegment.shippingAddress,
          createdAt: parentWithStoreSegment.createdAt,
          updatedAt: parentWithStoreSegment.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orderData = req.body;
    orderData.orderNumber = generateOrderNumber('ORD');
    if (!orderData.orderType) {
      orderData.orderType = 'store';
    }
    
    const order = new Order(orderData);
    await order.save();
    
    logger.info('Order created:', { orderId: order._id, orderNumber: order.orderNumber });
    res.status(201).json({ success: true, message: 'Order created successfully', data: { order } });
  } catch (error) {
    logger.error('Error creating order:', error);
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    
    res.json({ success: true, message: 'Order status updated', data: { order } });
  } catch (error) {
    next(error);
  }
};

export const createCheckoutOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      userId,
      items,
      shippingAddress = {},
      sharedShippingFee = 0,
      taxRate = 0,
      discount = 0,
      notes,
    } = req.body || {};

    if (!userId || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'userId and items are required' });
      return;
    }

    const normalizedIncomingItems = await Promise.all(
      items.map(async (item: any) => {
        const parsed = parseCompositeProductId(item?.productId || item?.id);
        const resolvedStoreId = await resolveStoreIdForCheckoutItem(item);

        return {
          ...item,
          productId: parsed.productId,
          color: String(item?.color || parsed.color || ''),
          size: String(item?.size || parsed.size || ''),
          storeId: resolvedStoreId,
          boutiqueId: String(item?.boutiqueId || resolvedStoreId || 'unknown-store'),
        };
      })
    );

    const groupedByStore = new Map<string, any[]>();
    normalizedIncomingItems.forEach((item: any) => {
      const storeId = String(item?.storeId || item?.boutiqueId || 'unknown-store').trim() || 'unknown-store';
      const bucket = groupedByStore.get(storeId) || [];
      bucket.push(item);
      groupedByStore.set(storeId, bucket);
    });

    const storeIds = Array.from(groupedByStore.keys());
    const shippingPerStore = storeIds.length > 0 ? Number(sharedShippingFee || 0) / storeIds.length : 0;

    const parentOrder = await new Order({
      orderNumber: generateOrderNumber('PARENT'),
      orderType: 'parent',
      userId: String(userId),
      items: [],
      subtotal: 0,
      tax: 0,
      shippingCost: Number(sharedShippingFee || 0),
      discount: Number(discount || 0),
      total: 0,
      originalTotal: 0,
      payableTotal: 0,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress,
      notes,
      totalStores: storeIds.length,
      confirmedStores: 0,
      rejectedStores: 0,
      pendingStores: storeIds.length,
      confirmationPercent: 0,
      storeOrderIds: [],
      storeOrders: [],
    }).save();

    const embeddedStoreOrders: any[] = [];
    let parentSubtotal = 0;
    let parentTax = 0;

    for (const currentStoreId of storeIds) {
      const rawItems = groupedByStore.get(currentStoreId) || [];
      const normalizedItems = rawItems.map((item: any) => {
        const quantity = Math.max(1, Number(item?.quantity || 1));
        const price = Number(item?.price || 0);
        const resolvedStoreId = String(item?.storeId || item?.boutiqueId || currentStoreId || 'unknown-store');
        return {
          productId: String(item?.productId || ''),
          name: String(item?.name || 'Product'),
          sku: String(item?.sku || ''),
          quantity,
          price,
          total: quantity * price,
          image: String(item?.image || ''),
          color: String(item?.color || ''),
          size: String(item?.size || ''),
          boutiqueId: String(item?.boutiqueId || resolvedStoreId),
          storeId: resolvedStoreId,
        };
      });

      const subtotal = normalizedItems.reduce((sum: number, item: any) => sum + Number(item.total || 0), 0);
      const tax = subtotal * Number(taxRate || 0);
      const total = subtotal + tax + shippingPerStore;

      parentSubtotal += subtotal;
      parentTax += tax;

      embeddedStoreOrders.push({
        storeId: currentStoreId,
        boutiqueId: currentStoreId,
        status: 'pending',
        statusNotes: {},
        statusHistory: [{ status: 'pending', changedBy: 'system', changedAt: new Date() }],
        items: normalizedItems,
        subtotal,
        tax,
        shippingCost: shippingPerStore,
        discount: 0,
        total,
        originalTotal: total,
        payableTotal: total,
      });
    }

    const parentTotal = parentSubtotal + parentTax + Number(sharedShippingFee || 0) - Number(discount || 0);

    parentOrder.subtotal = parentSubtotal;
    parentOrder.tax = parentTax;
    parentOrder.total = parentTotal;
    parentOrder.originalTotal = parentTotal;
    parentOrder.payableTotal = parentTotal;
    parentOrder.storeOrders = embeddedStoreOrders;
    parentOrder.items = embeddedStoreOrders.flatMap((entry) =>
      Array.isArray(entry.items) ? entry.items : []
    );
    parentOrder.storeOrderIds = (parentOrder.storeOrders || []).map((entry: any) => entry._id);
    applyParentProgressFromEmbeddedStoreOrders(parentOrder);
    await parentOrder.save();

    res.status(201).json({
      success: true,
      message: 'Checkout order created and split by store',
      data: {
        parentOrder,
        storeOrders: parentOrder.storeOrders,
      },
    });
  } catch (error) {
    logger.error('Error creating checkout order:', error);
    next(error);
  }
};

export const updateStoreOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, note: rawNote, actorType: rawActorType } = req.body || {};
    const normalizedAction = String(action || '').toLowerCase();
    const note = typeof rawNote === 'string' ? rawNote.trim() : '';
    const normalizedActorType = String(rawActorType || '').toLowerCase();
    const changedBy: 'client' | 'store' | 'system' =
      normalizedActorType === 'client' || normalizedActorType === 'store' || normalizedActorType === 'system'
        ? (normalizedActorType as 'client' | 'store' | 'system')
        : normalizedAction === 'cancel'
        ? 'client'
        : 'store';

    const allowedActions = new Set(['confirm', 'reject', 'cancel', 'pending']);
    if (!allowedActions.has(normalizedAction)) {
      res.status(400).json({ success: false, message: 'Invalid action. Use confirm, reject, cancel or pending.' });
      return;
    }

    const parentOrder = await Order.findOne({
      orderType: 'parent',
      'storeOrders._id': id,
    });

    if (!parentOrder || !Array.isArray(parentOrder.storeOrders)) {
      res.status(404).json({ success: false, message: 'Store order not found' });
      return;
    }

    const storeOrder = parentOrder.storeOrders.find(
      (entry: any) => String(entry._id) === String(id)
    );

    if (!storeOrder) {
      res.status(404).json({ success: false, message: 'Store order not found' });
      return;
    }

    const nextStatus =
      normalizedAction === 'confirm'
        ? 'confirmed'
        : normalizedAction === 'reject'
        ? 'rejected'
        : normalizedAction === 'pending'
        ? 'pending'
        : 'cancelled';

    storeOrder.status = nextStatus;

    if (!storeOrder.statusNotes || typeof storeOrder.statusNotes !== 'object') {
      storeOrder.statusNotes = {};
    }
    if (note) {
      storeOrder.statusNotes[nextStatus] = note;
    }

    if (!Array.isArray(storeOrder.statusHistory)) {
      storeOrder.statusHistory = [];
    }
    storeOrder.statusHistory.push({
      status: nextStatus,
      note: note || undefined,
      changedBy,
      changedAt: new Date(),
    });

    applyParentProgressFromEmbeddedStoreOrders(parentOrder);
    await parentOrder.save();

    res.json({
      success: true,
      message: 'Store order status updated',
      data: {
        order: {
          ...(storeOrder as any),
          statusNote: (storeOrder.statusNotes || {})[String(storeOrder.status || nextStatus)] || '',
        },
        parentOrderId: parentOrder._id,
        parentStatus: parentOrder.status,
        confirmationPercent: parentOrder.confirmationPercent,
        changedBy,
      },
    });
  } catch (error) {
    logger.error('Error updating store order status:', error);
    next(error);
  }
};
