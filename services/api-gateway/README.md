# API Gateway

Unified entry point for all Mallify microservices.

## Features

- **Request Routing**: Automatically routes requests to appropriate microservices
- **Rate Limiting**: Protects services from abuse with configurable limits
- **Health Monitoring**: Aggregated health checks for all services
- **Security**: Helmet, CORS, and compression middleware
- **Logging**: Centralized request/response logging
- **Error Handling**: Graceful error responses

## API Routes

All routes are prefixed with `/api`:

### Authentication & Users
- `POST /api/auth/register` → user-service
- `POST /api/auth/login` → user-service
- `GET /api/users/*` → user-service

### Products & Boutiques
- `GET /api/products/*` → product-service
- `GET /api/boutiques/*` → boutique-service

### Orders & Payments
- `POST /api/orders/*` → order-service
- `POST /api/payments/*` → payment-service

### Delivery & Drivers
- `GET /api/deliveries/*` → delivery-service
- `GET /api/drivers/*` → driver-service

### Other Services
- `/api/notifications/*` → notification-service
- `/api/chat/*` → chat-service
- `/api/reviews/*` → review-service
- `/api/promotions/*` → promotion-service
- `/api/wishlist/*` → wishlist-service
- `/api/analytics/*` → analytics-service

## Health Checks

- `GET /health` - Gateway health
- `GET /health/services` - All services health status

## Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 attempts per 15 minutes per IP
- **Create Operations**: 10 requests per minute per IP

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with service URLs
   ```

3. Run in development:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

See `.env.example` for all configuration options.

## Testing

```bash
# Health check
curl http://localhost:3000/health

# All services health
curl http://localhost:3000/health/services

# Proxied request
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```
