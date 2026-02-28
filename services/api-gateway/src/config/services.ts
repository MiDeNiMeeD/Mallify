export interface ServiceConfig {
  name: string;
  url: string;
  healthPath: string;
  timeout: number;
}

export const services: Record<string, ServiceConfig> = {
  user: {
    name: 'user-service',
    url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    healthPath: '/health',
    timeout: 30000,
  },
  product: {
    name: 'product-service',
    url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
    healthPath: '/health',
    timeout: 30000,
  },
  boutique: {
    name: 'boutique-service',
    url: process.env.BOUTIQUE_SERVICE_URL || 'http://localhost:3003',
    healthPath: '/health',
    timeout: 30000,
  },
  order: {
    name: 'order-service',
    url: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
    healthPath: '/health',
    timeout: 30000,
  },
  payment: {
    name: 'payment-service',
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
    healthPath: '/health',
    timeout: 30000,
  },
  delivery: {
    name: 'delivery-service',
    url: process.env.DELIVERY_SERVICE_URL || 'http://localhost:3006',
    healthPath: '/health',
    timeout: 30000,
  },
  driver: {
    name: 'driver-service',
    url: process.env.DRIVER_SERVICE_URL || 'http://localhost:3007',
    healthPath: '/health',
    timeout: 30000,
  },
  notification: {
    name: 'notification-service',
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008',
    healthPath: '/health',
    timeout: 30000,
  },
  chat: {
    name: 'chat-service',
    url: process.env.CHAT_SERVICE_URL || 'http://localhost:3009',
    healthPath: '/health',
    timeout: 30000,
  },
  review: {
    name: 'review-service',
    url: process.env.REVIEW_SERVICE_URL || 'http://localhost:3010',
    healthPath: '/health',
    timeout: 30000,
  },
  promotion: {
    name: 'promotion-service',
    url: process.env.PROMOTION_SERVICE_URL || 'http://localhost:3011',
    healthPath: '/health',
    timeout: 30000,
  },
  wishlist: {
    name: 'wishlist-service',
    url: process.env.WISHLIST_SERVICE_URL || 'http://localhost:3012',
    healthPath: '/health',
    timeout: 30000,
  },
  analytics: {
    name: 'analytics-service',
    url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3013',
    healthPath: '/health',
    timeout: 30000,
  },
  audit: {
    name: 'audit-service',
    url: process.env.AUDIT_SERVICE_URL || 'http://localhost:3014',
    healthPath: '/health',
    timeout: 30000,
  },
  dispute: {
    name: 'dispute-service',
    url: process.env.DISPUTE_SERVICE_URL || 'http://localhost:3015',
    healthPath: '/health',
    timeout: 30000,
  },
};

// Route mappings: API Gateway path prefix -> Service
export const routeMap: Record<string, string> = {
  '/api/auth': 'user',
  '/api/users': 'user',
  '/api/products': 'product',
  '/api/boutiques': 'boutique',
  '/api/orders': 'order',
  '/api/payments': 'payment',
  '/api/deliveries': 'delivery',
  '/api/drivers': 'driver',
  '/api/notifications': 'notification',
  '/api/chat': 'chat',
  '/api/reviews': 'review',
  '/api/promotions': 'promotion',
  '/api/wishlist': 'wishlist',
  '/api/analytics': 'analytics',
  '/api/audit': 'audit',
  '/api/disputes': 'dispute',
};
