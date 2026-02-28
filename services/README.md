# Mallify Services - Backend Microservices

This directory contains all the microservices for the Mallify Virtual Mall platform.

## 🏗️ Architecture

Mallify uses a microservices architecture with the following services:

- **API Gateway**: Unified entry point for all client requests
- **User Service**: User authentication, authorization, and profile management
- **Product Service**: Product catalog and inventory management
- **Boutique Service**: Boutique/store management
- **Order Service**: Order processing and management
- **Payment Service**: Payment processing and transaction management
- **Delivery Service**: Delivery tracking and management
- **Driver Service**: Delivery driver management
- **Notification Service**: Push notifications, emails, and SMS
- **Chat Service**: Real-time messaging between users
- **Review Service**: Product and boutique reviews/ratings
- **Promotion Service**: Discounts, coupons, and promotions
- **Wishlist Service**: User wishlist management
- **Analytics Service**: Platform analytics and reporting
- **Audit Service**: System audit logs and compliance
- **Dispute Service**: Order disputes and returns

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Docker**: >= 20.0.0
- **Docker Compose**: >= 2.0.0

### Initial Setup

1. **Clone the repository** (if not already done)

2. **Navigate to services directory**:
   ```bash
   cd services
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create environment file**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your configuration values (MongoDB, Redis, etc.)

5. **Start infrastructure services** (MongoDB, Redis, RabbitMQ):
   ```bash
   npm run docker:up
   ```

   This will start:
   - MongoDB on `localhost:27017`
   - Redis on `localhost:6379`
   - RabbitMQ on `localhost:5672` (Management UI: `localhost:15672`)
   - Mongo Express on `localhost:8081` (Optional admin UI)

6. **Build shared utilities**:
   ```bash
   cd shared
   npm install
   npm run build
   cd ..
   ```

### Development

To run all services in development mode:
```bash
npm run dev
```

To run a specific service:
```bash
cd <service-name>
npm run dev
```

### Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run build` - Build all services
- `npm run test` - Run tests for all services
- `npm run lint` - Lint all code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View Docker container logs

## 📁 Project Structure

```
services/
├── api-gateway/          # API Gateway service
├── user-service/         # User management service
├── product-service/      # Product catalog service
├── boutique-service/     # Boutique management service
├── order-service/        # Order processing service
├── payment-service/      # Payment processing service
├── delivery-service/     # Delivery management service
├── driver-service/       # Driver management service
├── notification-service/ # Notification service
├── chat-service/         # Real-time chat service
├── review-service/       # Review and rating service
├── promotion-service/    # Promotion management service
├── wishlist-service/     # Wishlist service
├── analytics-service/    # Analytics and reporting service
├── audit-service/        # Audit logging service
├── dispute-service/      # Dispute resolution service
├── shared/               # Shared utilities and middleware
│   ├── middleware/       # Shared middleware (auth, error handling, validation)
│   ├── utils/            # Shared utilities (logger, response formatter, errors, constants)
│   └── src/              # Shared TypeScript source
├── docker-compose.yml    # Docker Compose configuration
├── .env.example          # Environment variables template
├── tsconfig.json         # TypeScript configuration
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
└── package.json          # Root package.json with workspaces
```

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose (local), Kubernetes (production)

## 🛠️ Shared Utilities

The `shared` folder contains common code used across all services:

### Middleware
- **auth**: JWT authentication and role-based authorization
- **errorHandler**: Centralized error handling
- **validate**: Request validation with Joi

### Utils
- **logger**: Winston-based logging with file and console transports
- **response**: Standardized API response formatter
- **errors**: Custom error classes for different error types
- **constants**: Shared enums and constants (roles, statuses, etc.)

### Types
- Common TypeScript interfaces and types

## 🔐 Environment Variables

Key environment variables (see `.env.example` for full list):

```env
# Database
MONGODB_URI=mongodb://localhost:27017/mallify

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Service Ports
API_GATEWAY_PORT=3000
USER_SERVICE_PORT=3001
PRODUCT_SERVICE_PORT=3002
# ... etc
```

## 📊 Service Communication

Services communicate using:
1. **REST APIs** through the API Gateway
2. **RabbitMQ** for asynchronous event-driven communication
3. **Redis** for caching and session management

## 🧪 Testing

Each service has its own test suite.

Run all tests:
```bash
npm test
```

Run tests for a specific service:
```bash
cd <service-name>
npm test
```

## 🚢 Deployment

### Development
```bash
npm run docker:up
npm run dev
```

### Production
1. Build all services: `npm run build`
2. Build Docker images for each service
3. Deploy to Kubernetes cluster or cloud platform

## 📝 API Documentation

API documentation will be available at:
- Local: `http://localhost:3000/api-docs`
- Production: `https://api.mallify.com/api-docs`

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linters: `npm run lint:fix`
4. Run tests: `npm test`
5. Commit with conventional commits
6. Create a pull request

## 📞 Support

For issues or questions, contact the development team.

---

**Status**: Phase 1 - Foundation & Infrastructure ✅ COMPLETE

Next: Phase 2 - Core Business Services
