// MongoDB Initialization Script for Mallify
// This script runs when the MongoDB container first starts

db = db.getSiblingDB('mallify');

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        role: {
          enum: ['client', 'boutique_owner', 'delivery_person', 'admin', 'delivery_manager', 'boutiques_manager'],
          description: 'must be a valid role'
        }
      }
    }
  }
});

db.createCollection('boutiques');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('deliveries');
db.createCollection('reviews');
db.createCollection('notifications');
db.createCollection('payments');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.boutiques.createIndex({ owner: 1 });
db.boutiques.createIndex({ status: 1 });
db.boutiques.createIndex({ name: 'text', description: 'text' });

db.products.createIndex({ boutique: 1 });
db.products.createIndex({ category: 1 });
db.products.createIndex({ status: 1 });
db.products.createIndex({ name: 'text', description: 'text' });

db.orders.createIndex({ client: 1 });
db.orders.createIndex({ boutique: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ orderDate: -1 });

db.deliveries.createIndex({ order: 1 }, { unique:true });
db.deliveries.createIndex({ deliveryPerson: 1 });
db.deliveries.createIndex({ status: 1 });

db.reviews.createIndex({ author: 1 });
db.reviews.createIndex({ targetType: 1, targetId: 1 });

db.notifications.createIndex({ recipient: 1, status: 1 });
db.notifications.createIndex({ date: -1 });

db.payments.createIndex({ order: 1 });
db.payments.createIndex({ status: 1 });

print('Mallify database initialized successfully!');
