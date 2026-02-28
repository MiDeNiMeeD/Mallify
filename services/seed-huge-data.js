const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_MALLIFY = 'mallify';
const DB_USERS = 'mallify_users';

// Sample data arrays
const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Skyler', 'Dakota', 'Cameron', 'Finley', 'Reese', 'Drew', 'Sage', 'Phoenix', 'River', 'Kai', 'Logan', 'Harper', 'Brooklyn', 'Madison', 'Olivia', 'Emma', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Evelyn', 'Noah', 'Liam', 'William', 'James', 'Oliver', 'Benjamin', 'Elijah', 'Lucas', 'Mason', 'Logan'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King'];

const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington'];

const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'WA', 'CO', 'NC', 'IN'];

const boutiqueTypes = ['Fashion & Apparel', 'Electronics & Gadgets', 'Home & Living', 'Beauty & Cosmetics', 'Sports & Outdoors', 'Books & Media', 'Toys & Games', 'Food & Beverages', 'Health & Wellness', 'Jewelry & Accessories'];

const categories = ['Clothing', 'Shoes', 'Bags', 'Accessories', 'Electronics', 'Computers', 'Phones', 'Home Decor', 'Furniture', 'Kitchen', 'Beauty', 'Skincare', 'Makeup', 'Sports', 'Fitness', 'Outdoor', 'Books', 'Music', 'Movies', 'Toys', 'Games', 'Food', 'Beverages', 'Health', 'Supplements'];

const productPrefixes = ['Premium', 'Deluxe', 'Professional', 'Elite', 'Ultimate', 'Pro', 'Advanced', 'Classic', 'Modern', 'Vintage', 'Luxury', 'Essential', 'Smart', 'Eco-Friendly', 'Handmade', 'Organic', 'Digital', 'Wireless', 'Bluetooth', 'HD'];

const productNames = ['T-Shirt', 'Jeans', 'Dress', 'Jacket', 'Sneakers', 'Boots', 'Handbag', 'Wallet', 'Watch', 'Sunglasses', 'Laptop', 'Tablet', 'Smartphone', 'Headphones', 'Speaker', 'Camera', 'TV', 'Sofa', 'Table', 'Lamp', 'Blender', 'Microwave', 'Coffee Maker', 'Yoga Mat', 'Dumbbell', 'Tent', 'Backpack', 'Novel', 'Album', 'Game Console', 'Board Game', 'Protein Powder', 'Vitamins'];

const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Park Blvd', 'Washington St', 'Lake View Rd', 'Highland Ave', 'Sunset Blvd', 'Broadway', 'First St', 'Second Ave', 'Third St', 'Market St', 'Center St', 'Church St', 'Spring St', 'River Rd', 'Hill St', 'Valley Dr', 'Forest Ln'];

const promotionCodes = ['SAVE10', 'WELCOME20', 'NEWYEAR', 'SUMMER25', 'FLASH30', 'WEEKEND15', 'MEGA50', 'FIRST10', 'VIP20', 'SPECIAL25'];

const reviewTitles = {
  5: ['Amazing!', 'Perfect!', 'Love it!', 'Excellent quality', 'Best purchase ever', 'Highly recommend', 'Outstanding', 'Fantastic product'],
  4: ['Great product', 'Very satisfied', 'Good value', 'Happy with purchase', 'Works well', 'Pretty good', 'Nice quality'],
  3: ['It\'s okay', 'Average product', 'Decent', 'Fair quality', 'Could be better', 'Not bad'],
  2: ['Disappointed', 'Not as expected', 'Below average', 'Poor quality', 'Not satisfied'],
  1: ['Terrible', 'Waste of money', 'Do not buy', 'Very disappointed', 'Awful quality']
};

const reviewComments = {
  5: ['This product exceeded all my expectations! The quality is outstanding and delivery was fast.', 'Absolutely love it! Will definitely buy again.', 'Perfect in every way. Great value for money.', 'The best purchase I\'ve made in a long time!'],
  4: ['Really good product. Minor issues but overall satisfied.', 'Works great! Just wish it came in more colors.', 'Good quality for the price. Would recommend.', 'Very happy with this purchase. Fast shipping too!'],
  3: ['It\'s okay. Does the job but nothing special.', 'Average product. Works as described.', 'Not bad but could be better. Decent for the price.'],
  2: ['Not what I expected. Quality is lacking.', 'Disappointed with the quality. Probably won\'t buy again.', 'Doesn\'t work as well as advertised.'],
  1: ['Complete waste of money. Very poor quality.', 'Terrible product. Returned immediately.', 'Do not recommend at all. Save your money.']
};

// Utility functions
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmail(firstName, lastName, domain = 'example') {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}.com`;
}

function generatePhone() {
  return `+1${randomInt(200, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}`;
}

function generateSKU() {
  return `SKU-${randomInt(10000, 99999)}-${randomInt(100, 999)}`;
}

function generateOrderNumber() {
  return `ORD-${Date.now()}-${randomInt(1000, 9999)}`;
}

function generateTrackingNumber() {
  return `TRK-${randomInt(100000000, 999999999)}`;
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Main seed function
async function seedDatabase() {
  console.log('🚀 Starting massive data seeding...\n');
  
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const mallifyDb = client.db(DB_MALLIFY);
    const usersDb = client.db(DB_USERS);
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await usersDb.collection('users').deleteMany({ email: { $ne: 'admin@mallify.com' } });
    await mallifyDb.collection('boutiques').deleteMany({});
    await mallifyDb.collection('products').deleteMany({});
    await mallifyDb.collection('orders').deleteMany({});
    await mallifyDb.collection('payments').deleteMany({});
    await mallifyDb.collection('deliveries').deleteMany({});
    await mallifyDb.collection('reviews').deleteMany({});
    await mallifyDb.collection('promotions').deleteMany({});
    await mallifyDb.collection('wishlists').deleteMany({});
    await mallifyDb.collection('messages').deleteMany({});
    await mallifyDb.collection('notifications').deleteMany({});
    await mallifyDb.collection('analytics').deleteMany({});
    await mallifyDb.collection('disputes').deleteMany({});
    await mallifyDb.collection('auditlogs').deleteMany({});
    console.log('✅ Cleared existing data\n');
    
    // ==================== USERS ====================
    console.log('👥 Creating users...');
    const users = [];
    const password = await hashPassword('password123');
    
    // Create 50 clients
    for (let i = 0; i < 50; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      users.push({
        _id: new ObjectId(),
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, `client${i}`),
        password,
        phone: generatePhone(),
        role: 'client',
        addresses: [{
          _id: new ObjectId(),
          street: `${randomInt(1, 9999)} ${randomElement(streets)}`,
          city: randomElement(cities),
          state: randomElement(states),
          zipCode: `${randomInt(10000, 99999)}`,
          country: 'USA',
          isDefault: true
        }],
        isEmailVerified: true,
        isActive: true,
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
        updatedAt: new Date()
      });
    }
    
    // Create 20 boutique owners
    for (let i = 0; i < 20; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      users.push({
        _id: new ObjectId(),
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, `boutique${i}`),
        password,
        phone: generatePhone(),
        role: 'boutique_owner',
        addresses: [{
          _id: new ObjectId(),
          street: `${randomInt(1, 9999)} ${randomElement(streets)}`,
          city: randomElement(cities),
          state: randomElement(states),
          zipCode: `${randomInt(10000, 99999)}`,
          country: 'USA',
          isDefault: true
        }],
        isEmailVerified: true,
        isActive: true,
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
        updatedAt: new Date()
      });
    }
    
    // Create 15 drivers
    for (let i = 0; i < 15; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      users.push({
        _id: new ObjectId(),
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, `driver${i}`),
        password,
        phone: generatePhone(),
        role: 'delivery_person',
        addresses: [{
          _id: new ObjectId(),
          street: `${randomInt(1, 9999)} ${randomElement(streets)}`,
          city: randomElement(cities),
          state: randomElement(states),
          zipCode: `${randomInt(10000, 99999)}`,
          country: 'USA',
          isDefault: true
        }],
        isEmailVerified: true,
        isActive: true,
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
        updatedAt: new Date()
      });
    }
    
    // Create 5 delivery managers
    for (let i = 0; i < 5; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      users.push({
        _id: new ObjectId(),
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, `manager${i}`),
        password,
        phone: generatePhone(),
        role: 'delivery_manager',
        addresses: [],
        isEmailVerified: true,
        isActive: true,
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
        updatedAt: new Date()
      });
    }
    
    await usersDb.collection('users').insertMany(users);
    console.log(`✅ Created ${users.length} users\n`);
    
    const clients = users.filter(u => u.role === 'client');
    const boutiqueOwners = users.filter(u => u.role === 'boutique_owner');
    const drivers = users.filter(u => u.role === 'delivery_person');
    
    // ==================== BOUTIQUES ====================
    console.log('🏪 Creating boutiques...');
    const boutiques = [];
    
    for (let i = 0; i < boutiqueOwners.length; i++) {
      const owner = boutiqueOwners[i];
      const type = randomElement(boutiqueTypes);
      const name = `${randomElement(['The', 'Best', 'Premium', 'Elite', 'Luxury'])} ${type.split(' ')[0]} ${randomElement(['Store', 'Shop', 'Boutique', 'Market', 'Emporium'])}`;
      
      boutiques.push({
        _id: new ObjectId(),
        name,
        description: `Welcome to ${name}! We offer the finest ${type.toLowerCase()} products with exceptional quality and service. Shop with confidence and enjoy our curated selection.`,
        ownerId: owner._id,
        email: owner.email,
        phone: owner.phone,
        website: `www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
        address: {
          street: `${randomInt(1, 999)} ${randomElement(streets)}`,
          city: randomElement(cities),
          state: randomElement(states),
          country: 'USA',
          postalCode: `${randomInt(10000, 99999)}`,
          coordinates: {
            latitude: randomFloat(25, 48),
            longitude: randomFloat(-125, -70)
          }
        },
        businessType: randomElement(['retail', 'wholesale', 'both']),
        categories: [type, ...categories.slice(0, randomInt(2, 4))],
        tags: ['quality', 'fast-shipping', 'authentic', 'verified'],
        logo: `https://picsum.photos/seed/${i}/200/200`,
        banner: `https://picsum.photos/seed/${i + 1000}/1200/400`,
        images: [
          `https://picsum.photos/seed/${i + 2000}/800/600`,
          `https://picsum.photos/seed/${i + 3000}/800/600`,
          `https://picsum.photos/seed/${i + 4000}/800/600`
        ],
        hours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '20:00', closed: false },
          saturday: { open: '10:00', close: '20:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: false }
        },
        currency: 'USD',
        timezone: 'America/New_York',
        language: 'en',
        status: 'active',
        verified: randomInt(0, 10) > 2,
        featured: randomInt(0, 10) > 7,
        rating: randomFloat(3.5, 5.0, 1),
        reviewCount: randomInt(10, 500),
        totalSales: randomInt(1000, 100000),
        totalOrders: randomInt(50, 5000),
        slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
        metaTitle: name,
        metaDescription: `Shop at ${name} for the best ${type.toLowerCase()} products`,
        createdAt: randomDate(new Date(2023, 0, 1), new Date(2025, 0, 1)),
        updatedAt: new Date()
      });
    }
    
    await mallifyDb.collection('boutiques').insertMany(boutiques);
    console.log(`✅ Created ${boutiques.length} boutiques\n`);
    
    // ==================== PRODUCTS ====================
    console.log('📦 Creating products...');
    const products = [];
    let productCounter = 0;
    
    // Create 10-30 products per boutique
    for (const boutique of boutiques) {
      const numProducts = randomInt(10, 30);
      
      for (let i = 0; i < numProducts; i++) {
        const prefix = randomElement(productPrefixes);
        const name = randomElement(productNames);
        const fullName = `${prefix} ${name}`;
        const price = randomFloat(9.99, 999.99);
        const compareAtPrice = Math.random() > 0.7 ? randomFloat(price * 1.1, price * 2) : undefined;
        
        products.push({
          _id: new ObjectId(),
          name: fullName,
          description: `${fullName} - Premium quality product from ${boutique.name}. This ${name.toLowerCase()} features excellent craftsmanship and attention to detail. Perfect for everyday use or special occasions. Comes with warranty and satisfaction guarantee.`,
          price,
          compareAtPrice,
          cost: randomFloat(price * 0.4, price * 0.7),
          sku: generateSKU(),
          barcode: `${randomInt(100000000000, 999999999999)}`,
          quantity: randomInt(0, 200),
          lowStockThreshold: 10,
          boutiqueId: boutique._id,
          images: [
            `https://picsum.photos/seed/${productCounter}/800/800`,
            `https://picsum.photos/seed/${productCounter + 10000}/800/800`,
            `https://picsum.photos/seed/${productCounter + 20000}/800/800`
          ],
          thumbnail: `https://picsum.photos/seed/${productCounter}/200/200`,
          weight: randomFloat(0.1, 50),
          dimensions: {
            length: randomFloat(5, 100),
            width: randomFloat(5, 100),
            height: randomFloat(5, 100),
            unit: 'cm'
          },
          hasVariants: false,
          attributes: {
            color: randomElement(['Black', 'White', 'Blue', 'Red', 'Green', 'Gray']),
            material: randomElement(['Cotton', 'Polyester', 'Leather', 'Metal', 'Plastic', 'Wood']),
            brand: randomElement(['BrandA', 'BrandB', 'BrandC', 'BrandD', 'BrandE'])
          },
          tags: [randomElement(categories), randomElement(['new', 'sale', 'trending', 'popular'])],
          status: randomElement(['active', 'active', 'active', 'draft']),
          featured: Math.random() > 0.8,
          metaTitle: fullName,
          metaDescription: `Buy ${fullName} online`,
          slug: `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${productCounter}`,
          viewCount: randomInt(0, 1000),
          salesCount: randomInt(0, 500),
          rating: randomFloat(3, 5, 1),
          reviewCount: randomInt(0, 100),
          createdAt: randomDate(new Date(2023, 6, 1), new Date()),
          updatedAt: new Date()
        });
        productCounter++;
      }
    }
    
    await mallifyDb.collection('products').insertMany(products);
    console.log(`✅ Created ${products.length} products\n`);
    
    // ==================== ORDERS ====================
    console.log('🛒 Creating orders...');
    const orders = [];
    const payments = [];
    const deliveries = [];
    let orderCounter = 0;
    
    // Create 3-10 orders per client
    for (const client of clients) {
      const numOrders = randomInt(3, 10);
      
      for (let i = 0; i < numOrders; i++) {
        const boutique = randomElement(boutiques);
        const numItems = randomInt(1, 5);
        const items = [];
        let subtotal = 0;
        
        // Select random products from this boutique
        const boutiqueProducts = products.filter(p => p.boutiqueId.equals(boutique._id) && p.status === 'active');
        
        for (let j = 0; j < numItems; j++) {
          const product = randomElement(boutiqueProducts);
          const quantity = randomInt(1, 3);
          const itemTotal = product.price * quantity;
          
          items.push({
            productId: product._id,
            name: product.name,
            sku: product.sku,
            quantity,
            price: product.price,
            total: itemTotal
          });
          
          subtotal += itemTotal;
        }
        
        const tax = subtotal * 0.08;
        const shippingCost = randomFloat(5, 15);
        const discount = Math.random() > 0.7 ? randomFloat(5, 20) : 0;
        const total = subtotal + tax + shippingCost - discount;
        
        const orderStatuses = ['delivered', 'delivered', 'delivered', 'shipped', 'processing', 'pending'];
        const status = randomElement(orderStatuses);
        const orderDate = randomDate(new Date(2024, 0, 1), new Date());
        
        const orderId = new ObjectId();
        const orderNumber = `ORD-${Date.now()}-${randomInt(1000, 9999)}-${orderCounter++}`;
        
        orders.push({
          _id: orderId,
          orderNumber,
          userId: client._id,
          boutiqueId: boutique._id,
          items,
          subtotal,
          tax,
          shippingCost,
          discount,
          total,
          status,
          paymentStatus: status === 'cancelled' ? 'failed' : status === 'delivered' ? 'paid' : 'pending',
          shippingAddress: {
            name: client.name,
            street: client.addresses[0].street,
            city: client.addresses[0].city,
            state: client.addresses[0].state,
            country: client.addresses[0].country,
            postalCode: client.addresses[0].zipCode,
            phone: client.phone
          },
          notes: Math.random() > 0.8 ? 'Please handle with care' : undefined,
          createdAt: orderDate,
          updatedAt: new Date()
        });
        
        // Create payment
        const paymentMethod = randomElement(['card', 'paypal', 'bank_transfer', 'cash_on_delivery']);
        const paymentStatus = status === 'cancelled' ? 'failed' : status === 'delivered' ? 'completed' : status === 'pending' ? 'pending' : 'processing';
        
        payments.push({
          _id: new ObjectId(),
          orderId,
          userId: client._id,
          amount: total,
          currency: 'USD',
          paymentMethod,
          paymentStatus,
          transactionId: `TXN-${randomInt(100000000, 999999999)}-${Date.now()}-${i}`,
          paymentGateway: paymentMethod === 'card' ? 'stripe' : paymentMethod === 'paypal' ? 'paypal' : undefined,
          paymentDetails: paymentMethod === 'card' ? {
            cardLast4: `${randomInt(1000, 9999)}`,
            cardBrand: randomElement(['Visa', 'Mastercard', 'Amex'])
          } : undefined,
          paidAt: paymentStatus === 'completed' ? orderDate : undefined,
          createdAt: orderDate,
          updatedAt: new Date()
        });
        
        // Create delivery
        const deliveryStatus = status === 'delivered' ? 'delivered' : status === 'shipped' ? randomElement(['in_transit', 'out_for_delivery']) : status === 'processing' ? 'assigned' : 'pending';
        const driver = deliveryStatus !== 'pending' ? randomElement(drivers) : null;
        
        const trackingHistory = [];
        if (deliveryStatus !== 'pending') {
          trackingHistory.push({
            status: 'pending',
            location: boutique.address.city,
            description: 'Order placed and confirmed',
            timestamp: orderDate
          });
          trackingHistory.push({
            status: 'assigned',
            location: boutique.address.city,
            description: 'Package picked up by driver',
            timestamp: new Date(orderDate.getTime() + 3600000)
          });
        }
        if (deliveryStatus === 'in_transit' || deliveryStatus === 'out_for_delivery' || deliveryStatus === 'delivered') {
          trackingHistory.push({
            status: 'in_transit',
            location: randomElement(cities),
            description: 'Package in transit',
            timestamp: new Date(orderDate.getTime() + 86400000)
          });
        }
        if (deliveryStatus === 'out_for_delivery' || deliveryStatus === 'delivered') {
          trackingHistory.push({
            status: 'out_for_delivery',
            location: client.addresses[0].city,
            description: 'Out for delivery',
            timestamp: new Date(orderDate.getTime() + 172800000)
          });
        }
        if (deliveryStatus === 'delivered') {
          trackingHistory.push({
            status: 'delivered',
            location: client.addresses[0].city,
            description: 'Package delivered successfully',
            timestamp: new Date(orderDate.getTime() + 259200000)
          });
        }
        
        deliveries.push({
          _id: new ObjectId(),
          orderId,
          userId: client._id,
          driverId: driver ? driver._id : undefined,
          trackingNumber: generateTrackingNumber(),
          carrier: 'Mallify Express',
          deliveryMethod: randomElement(['standard', 'express', 'same_day']),
          status: deliveryStatus,
          pickupAddress: {
            street: boutique.address.street,
            city: boutique.address.city,
            state: boutique.address.state,
            country: boutique.address.country,
            postalCode: boutique.address.postalCode,
            coordinates: {
              lat: boutique.address.coordinates.latitude,
              lng: boutique.address.coordinates.longitude
            }
          },
          deliveryAddress: {
            street: client.addresses[0].street,
            city: client.addresses[0].city,
            state: client.addresses[0].state,
            country: client.addresses[0].country,
            postalCode: client.addresses[0].zipCode,
            coordinates: {
              lat: randomFloat(25, 48),
              lng: randomFloat(-125, -70)
            }
          },
          estimatedDeliveryDate: new Date(orderDate.getTime() + 259200000),
          actualDeliveryDate: deliveryStatus === 'delivered' ? new Date(orderDate.getTime() + 259200000) : undefined,
          deliveryAttempts: deliveryStatus === 'delivered' ? 1 : 0,
          trackingHistory,
          recipientName: client.name,
          recipientPhone: client.phone,
          signatureRequired: false,
          createdAt: orderDate,
          updatedAt: new Date()
        });
      }
    }
    
    await mallifyDb.collection('orders').insertMany(orders);
    console.log(`✅ Created ${orders.length} orders`);
    
    await mallifyDb.collection('payments').insertMany(payments);
    console.log(`✅ Created ${payments.length} payments`);
    
    await mallifyDb.collection('deliveries').insertMany(deliveries);
    console.log(`✅ Created ${deliveries.length} deliveries\n`);
    
    // ==================== REVIEWS ====================
    console.log('⭐ Creating reviews...');
    const reviews = [];
    const reviewedProducts = new Set(); // Track product-user combinations
    
    // Create reviews for delivered orders
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    
    for (const order of deliveredOrders) {
      // 70% chance of reviewing
      if (Math.random() > 0.3) {
        // Review some items from the order
        for (const item of order.items) {
          const reviewKey = `${item.productId.toString()}-${order.userId.toString()}`;
          
          // Only review if not already reviewed
          if (!reviewedProducts.has(reviewKey) && Math.random() > 0.5) {
            reviewedProducts.add(reviewKey);
            
            const rating = Math.random() > 0.2 ? randomInt(4, 5) : randomInt(1, 3);
            
            reviews.push({
              _id: new ObjectId(),
              productId: item.productId,
              userId: order.userId,
              orderId: order._id,
              rating,
              title: randomElement(reviewTitles[rating]),
              comment: randomElement(reviewComments[rating]),
              images: Math.random() > 0.7 ? [
                `https://picsum.photos/seed/${reviews.length}/600/600`
              ] : [],
              verified: true,
              helpful: randomInt(0, 50),
              createdAt: new Date(order.createdAt.getTime() + randomInt(86400000, 604800000)),
              updatedAt: new Date()
            });
          }
        }
      }
    }
    
    await mallifyDb.collection('reviews').insertMany(reviews);
    console.log(`✅ Created ${reviews.length} reviews\n`);
    
    // ==================== PROMOTIONS ====================
    console.log('🎁 Creating promotions...');
    const promotions = [];
    const now = new Date();
    
    for (let i = 0; i < 15; i++) {
      const startDate = randomDate(new Date(2024, 0, 1), now);
      const endDate = randomDate(startDate, new Date(now.getTime() + 30 * 86400000));
      const isActive = startDate <= now && endDate >= now;
      
      promotions.push({
        _id: new ObjectId(),
        code: i < promotionCodes.length ? promotionCodes[i] : `CODE${randomInt(100, 999)}`,
        name: `${randomElement(['Special', 'Limited', 'Exclusive', 'Flash', 'Weekend'])} ${randomElement(['Discount', 'Sale', 'Offer', 'Deal'])}`,
        description: 'Get amazing discounts on your purchase!',
        type: randomElement(['percentage', 'fixed_amount', 'free_shipping']),
        discountValue: randomFloat(5, 50),
        minimumPurchase: Math.random() > 0.5 ? randomFloat(20, 100) : undefined,
        maximumDiscount: Math.random() > 0.5 ? randomFloat(20, 100) : undefined,
        applicableTo: randomElement(['all', 'specific_products', 'specific_categories']),
        applicableProducts: Math.random() > 0.7 ? [randomElement(products)._id] : undefined,
        applicableCategories: Math.random() > 0.7 ? [randomElement(categories)] : undefined,
        startDate,
        endDate,
        usageLimit: randomInt(100, 1000),
        usageCount: randomInt(0, 50),
        usagePerUser: randomInt(1, 5),
        status: isActive ? 'active' : startDate > now ? 'scheduled' : 'expired',
        conditions: {
          firstOrderOnly: Math.random() > 0.8,
          minItems: Math.random() > 0.7 ? randomInt(2, 5) : undefined
        },
        createdAt: randomDate(new Date(2023, 6, 1), startDate),
        updatedAt: new Date()
      });
    }
    
    await mallifyDb.collection('promotions').insertMany(promotions);
    console.log(`✅ Created ${promotions.length} promotions\n`);
    
    // ==================== WISHLISTS ====================
    console.log('❤️  Creating wishlists...');
    const wishlists = [];
    
    for (const client of clients) {
      // 60% chance of having a wishlist
      if (Math.random() > 0.4) {
        const numItems = randomInt(3, 15);
        const items = [];
        
        for (let j = 0; j < numItems; j++) {
          const product = randomElement(products);
          items.push({
            productId: product._id,
            addedAt: randomDate(new Date(2024, 0, 1), new Date())
          });
        }
        
        wishlists.push({
          _id: new ObjectId(),
          userId: client._id,
          items,
          createdAt: randomDate(new Date(2024, 0, 1), new Date()),
          updatedAt: new Date()
        });
      }
    }
    
    if (wishlists.length > 0) {
      await mallifyDb.collection('wishlists').insertMany(wishlists);
    }
    console.log(`✅ Created ${wishlists.length} wishlists\n`);
    
    // ==================== NOTIFICATIONS ====================
    console.log('🔔 Creating notifications...');
    const notifications = [];
    
    for (const user of [...clients, ...boutiqueOwners]) {
      const numNotifications = randomInt(5, 15);
      
      for (let i = 0; i < numNotifications; i++) {
        const types = user.role === 'client' 
          ? ['order_confirmed', 'order_shipped', 'order_delivered', 'promotion', 'review_reminder']
          : ['new_order', 'low_stock', 'new_review', 'payout_processed'];
        
        notifications.push({
          _id: new ObjectId(),
          userId: user._id,
          type: randomElement(types),
          title: randomElement(['New Order', 'Order Update', 'Special Offer', 'Important Notice']),
          message: 'You have a new notification. Click to view details.',
          read: Math.random() > 0.4,
          metadata: {},
          createdAt: randomDate(new Date(2024, 0, 1), new Date()),
          updatedAt: new Date()
        });
      }
    }
    
    await mallifyDb.collection('notifications').insertMany(notifications);
    console.log(`✅ Created ${notifications.length} notifications\n`);
    
    // ==================== MESSAGES (Chat) ====================
    console.log('💬 Creating messages...');
    const messages = [];
    
    // Create conversations between clients and boutiques
    for (let i = 0; i < 30; i++) {
      const client = randomElement(clients);
      const boutique = randomElement(boutiques);
      const owner = boutiqueOwners.find(o => o._id.equals(boutique.ownerId));
      const numMessages = randomInt(3, 10);
      const conversationStart = randomDate(new Date(2024, 0, 1), new Date());
      
      for (let j = 0; j < numMessages; j++) {
        const isClientMessage = j % 2 === 0;
        
        messages.push({
          _id: new ObjectId(),
          senderId: isClientMessage ? client._id : owner._id,
          receiverId: isClientMessage ? owner._id : client._id,
          boutiqueId: boutique._id,
          content: randomElement([
            'Hello, I have a question about this product.',
            'Is this item in stock?',
            'When will this be delivered?',
            'Can I get a discount on bulk orders?',
            'Thank you for your help!',
            'Yes, we have it in stock.',
            'It will be delivered in 3-5 business days.',
            'Please check our promotions page.',
            'You\'re welcome! Let us know if you need anything else.'
          ]),
          read: Math.random() > 0.3,
          createdAt: new Date(conversationStart.getTime() + j * 3600000),
          updatedAt: new Date()
        });
      }
    }
    
    await mallifyDb.collection('messages').insertMany(messages);
    console.log(`✅ Created ${messages.length} messages\n`);
    
    // ==================== ANALYTICS ====================
    console.log('📊 Creating analytics data...');
    const analytics = [];
    
    for (let i = 0; i < 90; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      analytics.push({
        _id: new ObjectId(),
        date,
        metrics: {
          totalOrders: randomInt(10, 100),
          totalRevenue: randomFloat(1000, 10000),
          newUsers: randomInt(5, 50),
          activeUsers: randomInt(50, 500),
          bounceRate: randomFloat(20, 60),
          conversionRate: randomFloat(1, 10),
          averageOrderValue: randomFloat(50, 200),
          pageViews: randomInt(1000, 10000),
          uniqueVisitors: randomInt(500, 5000)
        },
        topProducts: products.slice(0, 10).map(p => ({
          productId: p._id,
          views: randomInt(100, 1000),
          sales: randomInt(10, 100)
        })),
        topBoutiques: boutiques.slice(0, 5).map(b => ({
          boutiqueId: b._id,
          revenue: randomFloat(1000, 10000),
          orders: randomInt(10, 100)
        })),
        createdAt: date,
        updatedAt: new Date()
      });
    }
    
    await mallifyDb.collection('analytics').insertMany(analytics);
    console.log(`✅ Created ${analytics.length} analytics records\n`);
    
    // ==================== DISPUTES ====================
    console.log('⚠️  Creating disputes...');
    const disputes = [];
    
    for (let i = 0; i < 10; i++) {
      const order = randomElement(deliveredOrders);
      
      disputes.push({
        _id: new ObjectId(),
        disputeNumber: `DSP-${Date.now()}-${randomInt(1000, 9999)}-${i}`,
        orderId: order._id,
        userId: order.userId,
        boutiqueId: order.boutiqueId,
        type: randomElement(['order_issue', 'product_quality', 'delivery_issue', 'refund_request']),
        status: randomElement(['open', 'investigating', 'resolved', 'closed']),
        priority: randomElement(['low', 'medium', 'high']),
        subject: randomElement(['Product not as described', 'Item damaged during shipping', 'Wrong item received', 'Quality issues']),
        description: 'The product I received was not as described in the listing. Please help resolve this issue.',
        evidence: [{
          type: 'image',
          url: `https://picsum.photos/seed/${i}/600/600`,
          description: 'Photo of the issue'
        }],
        messages: [],
        resolution: Math.random() > 0.5 ? {
          action: randomElement(['refund', 'replacement', 'compensation']),
          amount: randomFloat(10, 100),
          description: 'Refund processed',
          resolvedBy: new ObjectId(),
          resolvedAt: new Date()
        } : undefined,
        createdAt: new Date(order.createdAt.getTime() + randomInt(259200000, 604800000)),
        updatedAt: new Date()
      });
    }
    
    await mallifyDb.collection('disputes').insertMany(disputes);
    console.log(`✅ Created ${disputes.length} disputes\n`);
    
    // ==================== AUDIT LOGS ====================
    console.log('📝 Creating audit logs...');
    const auditLogs = [];
    const actions = ['create', 'update', 'delete', 'login', 'logout', 'order_placed', 'payment_processed', 'product_updated', 'user_registered'];
    
    for (let i = 0; i < 200; i++) {
      const user = randomElement(users);
      
      auditLogs.push({
        _id: new ObjectId(),
        userId: user._id,
        action: randomElement(actions),
        resource: randomElement(['user', 'order', 'product', 'boutique', 'payment']),
        resourceId: new ObjectId(),
        metadata: {
          ip: `192.168.${randomInt(0, 255)}.${randomInt(0, 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        createdAt: randomDate(new Date(2024, 0, 1), new Date())
      });
    }
    
    await mallifyDb.collection('auditlogs').insertMany(auditLogs);
    console.log(`✅ Created ${auditLogs.length} audit logs\n`);
    
    // ==================== SUMMARY ====================
    console.log('\n🎉 DATABASE SEEDING COMPLETED!\n');
    console.log('═══════════════════════════════════════');
    console.log('📊 SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log(`👥 Users:          ${users.length}`);
    console.log(`   - Clients:      ${clients.length}`);
    console.log(`   - Owners:       ${boutiqueOwners.length}`);
    console.log(`   - Drivers:      ${drivers.length}`);
    console.log(`🏪 Boutiques:      ${boutiques.length}`);
    console.log(`📦 Products:       ${products.length}`);
    console.log(`🛒 Orders:         ${orders.length}`);
    console.log(`💳 Payments:       ${payments.length}`);
    console.log(`🚚 Deliveries:     ${deliveries.length}`);
    console.log(`⭐ Reviews:        ${reviews.length}`);
    console.log(`🎁 Promotions:     ${promotions.length}`);
    console.log(`❤️  Wishlists:      ${wishlists.length}`);
    console.log(`💬 Messages:       ${messages.length}`);
    console.log(`🔔 Notifications:  ${notifications.length}`);
    console.log(`📊 Analytics:      ${analytics.length}`);
    console.log(`⚠️  Disputes:       ${disputes.length}`);
    console.log(`📝 Audit Logs:     ${auditLogs.length}`);
    console.log('═══════════════════════════════════════');
    console.log(`\n✅ Total Records:  ${users.length + boutiques.length + products.length + orders.length + payments.length + deliveries.length + reviews.length + promotions.length + wishlists.length + messages.length + notifications.length + analytics.length + disputes.length + auditLogs.length}\n`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
    console.log('👋 Connection closed\n');
  }
}

// Run the seeder
seedDatabase();
