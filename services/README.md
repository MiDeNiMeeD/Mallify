# Virtual Mall Platform - Microservices Architecture

A comprehensive, scalable e-commerce platform built with microservices architecture, featuring multiple user interfaces for different roles (Admin, Delivery Manager, Boutique Manager, Boutique Owner, Clients, and Drivers).

## 🏗️ Architecture Overview

This platform consists of 15 microservices, each with its own MongoDB database, communicating via RabbitMQ message broker and REST APIs through an API Gateway.

### Services

| Service              | Port | Description                                       |
| -------------------- | ---- | ------------------------------------------------- |
| API Gateway          | 3000 | Unified entry point, routing, rate limiting       |
| User Service         | 3001 | Authentication, authorization, user management    |
| Boutique Service     | 3002 | Boutique management, subscriptions                |
| Product Service      | 3003 | Product catalog, inventory, categories            |
| Order Service        | 3004 | Shopping cart, order processing                   |
| Payment Service      | 3007 | Payments, subscriptions, coupons, loyalty         |
| Delivery Service     | 3008 | Delivery management, tracking, route optimization |
| Driver Service       | 3009 | Driver onboarding, approval, earnings             |
| Notification Service | 3010 | Email, SMS, push notifications                    |
| Review Service       | 3011 | Product/boutique/driver reviews                   |
| Analytics Service    | 3012 | Business intelligence, dashboards                 |
| Chat Service         | 3013 | Real-time chat (WebSocket)                        |
| Promotion Service    | 3014 | Flash sales, marketing campaigns                  |
| Wishlist Service     | 3015 | User wishlists and favorites                      |
| Dispute Service      | 3016 | Order/delivery dispute resolution                 |
| Audit Service        | 3017 | Centralized audit logging                         |

### Infrastructure

- **Message Broker**: RabbitMQ (Port 5672, Management UI: 15672)
- **Cache/Sessions**: Redis (Port 6379)
- **Databases**: MongoDB instances per service (Ports 27017-27031)

## 🎭 User Roles

1. **Admin**: Full platform control, analytics, user/boutique management
2. **Delivery Manager**: Driver approval, delivery oversight
3. **Boutique Manager**: Multi-boutique management, analytics
4. **Boutique Owner**: Single boutique operations, products, orders
5. **Client**: Browse, shop, order, track deliveries
6. **Driver**: Delivery management, earnings tracking

## 📋 Prerequisites

- **Docker Desktop** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Node.js** (version 18+) - for local development
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd micro-services
\`\`\`

### 2. Set Up Environment Variables

Each service has an \`.env.example\` file. Copy and configure:

\`\`\`bash

# For each service directory

cp .env.example .env

# Edit .env with your configuration

\`\`\`

**Important**: Update these values in production:

- JWT_SECRET
- Database passwords
- API keys (Stripe, Twilio, Google Maps, etc.)

### 3. Start All Services

\`\`\`bash
docker-compose up -d
\`\`\`

This will start:

- All 15 microservices
- 15 MongoDB databases
- RabbitMQ message broker
- Redis cache

### 4. Verify Services

Check service health:

\`\`\`bash

# Check running containers

docker-compose ps

# Check API Gateway health

curl http://localhost:3000/health

# Check individual services

curl http://localhost:3001/health # User Service
curl http://localhost:3002/health # Boutique Service

# ... etc

\`\`\`

### 5. Access Management UIs

- **RabbitMQ Management**: http://localhost:15672 (admin/admin123)
- **API Gateway**: http://localhost:3000

## 📦 Development Setup

### Running Services Locally

To develop a single service locally:

\`\`\`bash
cd user-service
npm install
npm run dev
\`\`\`

**Note**: Ensure MongoDB, RabbitMQ, and Redis are running (via Docker Compose or locally).

### Installing Dependencies

For all services:

\`\`\`bash

# Windows PowerShell

Get-ChildItem -Directory | Where-Object { Test-Path "$_\\package.json" } | ForEach-Object { cd $_.FullName; npm install; cd .. }
\`\`\`

## 🔌 API Documentation

### Base URL

All API requests go through the API Gateway:

\`\`\`
http://localhost:3000/api
\`\`\`

### Authentication

Most endpoints require authentication. Include JWT token in headers:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### Sample API Calls

#### Register User

\`\`\`bash
curl -X POST http://localhost:3000/api/auth/register \\
-H "Content-Type: application/json" \\
-d '{
"email": "user@example.com",
"password": "password123",
"role": "client",
"profile": {
"firstName": "John",
"lastName": "Doe",
"phone": "+1234567890"
}
}'
\`\`\`

#### Login

\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \\
-H "Content-Type: application/json" \\
-d '{
"email": "user@example.com",
"password": "password123"
}'
\`\`\`

#### Get Profile

\`\`\`bash
curl http://localhost:3000/api/auth/profile \\
-H "Authorization: Bearer <your-jwt-token>"
\`\`\`

### API Endpoints by Service

<details>
<summary><b>User Service (/api/users, /api/auth)</b></summary>

- POST /api/auth/register - Register new user
- POST /api/auth/login - Login
- GET /api/auth/profile - Get current user
- PUT /api/auth/profile - Update profile
- POST /api/auth/change-password - Change password
- GET /api/users/:id - Get user by ID
- GET /api/users/role/:role - Get users by role (admin)

</details>

<details>
<summary><b>Boutique Service (/api/boutiques)</b></summary>

- POST /api/boutiques - Create boutique
- GET /api/boutiques - List boutiques
- GET /api/boutiques/:id - Get boutique details
- PUT /api/boutiques/:id - Update boutique
- DELETE /api/boutiques/:id - Delete boutique
- POST /api/boutiques/:id/subscribe - Subscribe to boutique
- GET /api/boutiques/:id/subscription - Get subscription status

</details>

<details>
<summary><b>Product Service (/api/products, /api/categories)</b></summary>

- POST /api/products - Create product
- GET /api/products - List products
- GET /api/products/:id - Get product details
- PUT /api/products/:id - Update product
- DELETE /api/products/:id - Delete product
- POST /api/products/bulk-import - Bulk import products
- GET /api/categories - List categories
- POST /api/categories - Create category

</details>

<details>
<summary><b>Order Service (/api/orders, /api/cart)</b></summary>

- POST /api/cart/add - Add to cart
- GET /api/cart - Get cart
- DELETE /api/cart/:itemId - Remove from cart
- POST /api/orders - Create order
- GET /api/orders - Get user orders
- GET /api/orders/:id - Get order details
- PUT /api/orders/:id/status - Update order status
- POST /api/orders/:id/reorder - Reorder

</details>

<details>
<summary><b>Payment Service (/api/payments, /api/subscriptions, /api/coupons)</b></summary>

- POST /api/payments - Process payment
- GET /api/payments/:id - Get payment details
- GET /api/payments/history - Payment history
- POST /api/subscriptions - Create subscription
- GET /api/subscriptions - Get subscriptions
- POST /api/coupons - Create coupon (admin)
- POST /api/coupons/validate - Validate coupon

</details>

## 🗄️ Database Schema

Each service has its own MongoDB database. Key collections:

- **user_db**: users
- **boutique_db**: boutiques, subscriptions
- **product_db**: products, categories, inventory
- **order_db**: orders, carts
- **payment_db**: payments, transactions, coupons, loyalty_points
- **delivery_db**: deliveries, routes
- **driver_db**: drivers, documents, earnings
- **notification_db**: notifications, templates
- **review_db**: reviews, ratings
- **analytics_db**: metrics, reports
- **chat_db**: conversations, messages
- **promotion_db**: promotions, flash_sales
- **wishlist_db**: wishlists, favorites
- **dispute_db**: disputes, resolutions
- **audit_db**: audit_logs

## 📡 Inter-Service Communication

### Synchronous (HTTP)

Services communicate via REST APIs through direct HTTP calls for immediate responses.

### Asynchronous (Message Broker)

RabbitMQ handles event-driven communication:

**Exchanges**:

- orders
- payments
- notifications
- analytics
- deliveries
- users
- boutiques

**Example Flow**:

1. User places order → Order Service
2. Order Service publishes `order.created` event
3. Payment Service consumes event → processes payment
4. Payment Service publishes `payment.completed` event
5. Notification Service sends confirmation email
6. Analytics Service updates metrics

## 🔒 Security Best Practices

### Implemented

- ✅ JWT-based authentication
- ✅ Role-based authorization (RBAC)
- ✅ Rate limiting on API Gateway
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Password hashing (bcrypt)
- ✅ Environment variable management

### Recommended for Production

- 🔐 HTTPS/TLS encryption
- 🔐 API key management (vault)
- 🔐 Database encryption at rest
- 🔐 Network segmentation
- 🔐 DDoS protection (Cloudflare/AWS Shield)
- 🔐 Regular security audits
- 🔐 Implement OAuth2 for third-party integrations
- 🔐 Add request signing for inter-service communication
- 🔐 Implement API versioning

## 📊 Monitoring & Logging

### Current Setup

- Winston logger in each service
- Console and file logging
- Health check endpoints

### Recommended Additions

- **Distributed Tracing**: Jaeger or Zipkin
- **Metrics**: Prometheus + Grafana
- **Log Aggregation**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **APM**: New Relic, Datadog, or Dynatrace
- **Uptime Monitoring**: Pingdom or UptimeRobot

## 🚢 Deployment

### Docker Compose (Development/Staging)

Already configured in `docker-compose.yml`.

### Kubernetes (Production)

Create Kubernetes manifests:

\`\`\`bash

# Example deployment structure

k8s/
├── api-gateway/
│ ├── deployment.yaml
│ ├── service.yaml
│ └── ingress.yaml
├── user-service/
│ ├── deployment.yaml
│ └── service.yaml
├── databases/
│ ├── mongodb-statefulset.yaml
│ └── redis-deployment.yaml
└── rabbitmq/
├── deployment.yaml
└── service.yaml
\`\`\`

### Cloud Platforms

**AWS**:

- ECS/EKS for containers
- RDS for managed databases
- ElastiCache for Redis
- Amazon MQ for RabbitMQ
- S3 for object storage

**Azure**:

- AKS for Kubernetes
- Cosmos DB for databases
- Azure Cache for Redis
- Service Bus for messaging

**Google Cloud**:

- GKE for Kubernetes
- Cloud SQL
- Memorystore for Redis
- Cloud Pub/Sub for messaging

## 🔄 CI/CD Pipeline

### Recommended Workflow

\`\`\`yaml

# Example GitHub Actions workflow

name: CI/CD Pipeline

on:
push:
branches: [main, develop]
pull_request:
branches: [main]

jobs:
test:
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v3 - name: Run tests
run: npm test

build:
needs: test
runs-on: ubuntu-latest
steps: - name: Build Docker images
run: docker-compose build

deploy:
needs: build
runs-on: ubuntu-latest
steps: - name: Deploy to production
run: kubectl apply -f k8s/
\`\`\`

### Tools

- **CI**: GitHub Actions, GitLab CI, Jenkins
- **CD**: ArgoCD, Flux, Spinnaker
- **Container Registry**: Docker Hub, AWS ECR, Google GCR

## 🧪 Testing

### Unit Tests

\`\`\`bash
cd <service-name>
npm test
\`\`\`

### Integration Tests

\`\`\`bash
npm run test:integration
\`\`\`

### Load Testing

Use tools like:

- Apache JMeter
- k6
- Gatling

## 📈 Scaling Strategy

### Horizontal Scaling

Scale individual services based on load:

\`\`\`bash
docker-compose up -d --scale user-service=3
docker-compose up -d --scale product-service=5
\`\`\`

### Database Scaling

- **Read Replicas**: For read-heavy services
- **Sharding**: For large datasets
- **Caching**: Redis for frequently accessed data

### Load Balancing

- API Gateway handles routing
- Kubernetes Ingress for K8s deployments
- AWS ALB/NLB for cloud deployments

## 🛠️ Troubleshooting

### Services won't start

\`\`\`bash

# Check logs

docker-compose logs <service-name>

# Restart specific service

docker-compose restart <service-name>

# Rebuild service

docker-compose up -d --build <service-name>
\`\`\`

### Database connection issues

\`\`\`bash

# Check MongoDB container

docker exec -it mongo-user mongosh -u admin -p admin123

# Verify connection string in .env

\`\`\`

### RabbitMQ issues

\`\`\`bash

# Access management UI

http://localhost:15672

# Check queues and exchanges

\`\`\`

## 📝 Development Guidelines

### Code Style

- Use ESLint and Prettier
- Follow Airbnb JavaScript Style Guide
- Use async/await over callbacks

### Git Workflow

- Feature branches: `feature/service-name-feature`
- Bug fixes: `fix/service-name-issue`
- Pull requests required for main branch

### Commit Messages

Follow Conventional Commits:
\`\`\`
feat(user-service): add social login
fix(order-service): resolve cart calculation bug
docs(readme): update deployment instructions
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:

- Create an issue on GitHub
- Email: support@virtualmall.com

## 🗺️ Roadmap

- [ ] Mobile apps (React Native)
- [ ] Admin web dashboard (React)
- [ ] GraphQL API Gateway option
- [ ] AI-powered recommendations
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Blockchain-based loyalty program
- [ ] AR product visualization

## 📚 Additional Resources

- [Microservices Pattern](https://microservices.io/patterns/microservices.html)
- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

**Built with ❤️ using Node.js, Express, MongoDB, and Microservices Architecture**
