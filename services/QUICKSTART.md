# 🚀 Virtual Mall Platform - Quick Start Guide

## Project Overview

You now have a complete microservices architecture with 15 services:

✅ **Fully Implemented Services:**

- API Gateway (Port 3000)
- User Service (Port 3001) - Complete with authentication
- Boutique Service (Port 3002) - Complete with subscription management
- Product Service (Port 3003) - Complete with inventory
- Order Service (Port 3004) - Complete with cart & orders
- Payment Service (Port 3007) - Basic structure

⚙️ **Services with Basic Structure:**

- Delivery Service (Port 3008)
- Driver Service (Port 3009)
- Notification Service (Port 3010)
- Review Service (Port 3011)
- Analytics Service (Port 3012)
- Chat Service (Port 3013)
- Promotion Service (Port 3014)
- Wishlist Service (Port 3015)
- Dispute Service (Port 3016)
- Audit Service (Port 3017)

## 📁 Project Structure

```
micro-services/
├── api-gateway/              # API Gateway - Entry point
├── user-service/             # Authentication & Users ✅
├── boutique-service/         # Boutique Management ✅
├── product-service/          # Products & Inventory ✅
├── order-service/            # Orders & Cart ✅
├── payment-service/          # Payments & Subscriptions
├── delivery-service/         # Delivery Management
├── driver-service/           # Driver Management
├── notification-service/     # Notifications
├── review-service/           # Reviews & Ratings
├── analytics-service/        # Analytics
├── chat-service/             # Real-time Chat
├── promotion-service/        # Promotions
├── wishlist-service/         # Wishlists
├── dispute-service/          # Disputes
├── audit-service/            # Audit Logs
├── shared/                   # Shared utilities
│   ├── middleware/           # Auth, errors, rate limiting
│   └── utils/                # DB, cache, message broker
├── docker-compose.yml        # Docker orchestration
├── README.md                 # Comprehensive documentation
├── SERVICES_IMPLEMENTATION_GUIDE.md  # Implementation details
└── QUICKSTART.md            # This file
```

## 🎯 Quick Start (3 Steps)

### Step 1: Install Docker Desktop

Download and install Docker Desktop for Windows:
https://www.docker.com/products/docker-desktop

### Step 2: Start All Services

```powershell
cd "c:\Users\moham\OneDrive\Desktop\big project\micro-services"
docker-compose up -d
```

This will start:

- 15 Microservices
- 15 MongoDB databases
- RabbitMQ message broker
- Redis cache

### Step 3: Verify Everything is Running

```powershell
# Check all containers
docker-compose ps

# Check API Gateway
Invoke-RestMethod http://localhost:3000/health

# Check User Service
Invoke-RestMethod http://localhost:3001/health

# Check Product Service
Invoke-RestMethod http://localhost:3003/health
```

## 🧪 Test the Platform

### 1. Register a User

```powershell
$body = @{
  email = "john@example.com"
  password = "password123"
  role = "client"
  profile = @{
    firstName = "John"
    lastName = "Doe"
    phone = "+1234567890"
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### 2. Login

```powershell
$body = @{
  email = "john@example.com"
  password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body

# Save the token
$token = $response.token
Write-Host "Token: $token"
```

### 3. Create a Boutique (as boutique_owner)

First, register as boutique owner, then:

```powershell
$body = @{
  name = "Fashion Boutique"
  description = "Premium fashion store"
  contact = @{
    email = "info@fashion.com"
    phone = "+1234567890"
  }
} | ConvertTo-Json

$headers = @{
  Authorization = "Bearer $token"
}

$boutique = Invoke-RestMethod -Uri "http://localhost:3000/api/boutiques" `
  -Method Post `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $body

Write-Host "Boutique ID: $($boutique.data._id)"
```

### 4. Create a Product

```powershell
$body = @{
  name = "Designer T-Shirt"
  description = "Premium cotton t-shirt"
  boutique = "BOUTIQUE_ID_HERE"
  category = "CATEGORY_ID_HERE"
  price = @{
    regular = 49.99
  }
  inventory = @{
    quantity = 100
  }
} | ConvertTo-Json

$headers = @{
  Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
  -Method Post `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $body
```

## 🎨 User Interfaces to Build

### Admin Web App

**Technologies:** React + TypeScript + Tailwind CSS
**Features:**

- Dashboard with analytics
- User management
- Boutique approval/management
- Payment monitoring
- System settings

### Delivery Manager Web App

**Features:**

- Driver application review
- Delivery monitoring
- Performance dashboards
- Route optimization

### Boutique Manager Web App

**Features:**

- Multi-boutique overview
- Analytics across boutiques
- Support ticketing

### Boutique Owner Web App

**Features:**

- Product management
- Order management
- Analytics dashboard
- Subscription management

### Client Mobile App

**Technologies:** React Native / Flutter
**Features:**

- Browse boutiques
- Product search & filters
- Shopping cart
- Order tracking
- Wishlist
- Reviews
- Chat support

### Driver Mobile App

**Features:**

- Registration & onboarding
- Delivery queue
- Navigation
- Earnings dashboard
- Performance metrics

## 🔧 Development Workflow

### Run Individual Service Locally

```powershell
cd user-service
npm install
npm run dev
```

### View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
```

### Restart a Service

```powershell
docker-compose restart user-service
```

### Stop All Services

```powershell
docker-compose down
```

### Rebuild a Service

```powershell
docker-compose up -d --build user-service
```

## 📊 Management UIs

### RabbitMQ Management

**URL:** http://localhost:15672
**Username:** admin
**Password:** admin123

View:

- Message queues
- Exchanges
- Connections
- Message rates

### MongoDB (via Compass)

Download MongoDB Compass and connect to:

- User DB: `mongodb://admin:admin123@localhost:27017`
- Boutique DB: `mongodb://admin:admin123@localhost:27018`
- Product DB: `mongodb://admin:admin123@localhost:27019`
- Order DB: `mongodb://admin:admin123@localhost:27020`
- (etc.)

## 🎭 User Roles & Permissions

| Role                 | Permissions                                     |
| -------------------- | ----------------------------------------------- |
| **admin**            | Full system access, manage all resources        |
| **delivery_manager** | Approve/reject drivers, manage deliveries       |
| **boutique_manager** | Manage multiple boutiques, view analytics       |
| **boutique_owner**   | Manage own boutique, products, orders           |
| **client**           | Browse, shop, order, review                     |
| **driver**           | Accept deliveries, update status, view earnings |

## 🔐 Security Configuration

### Before Production:

1. **Change Default Passwords**

   ```
   MongoDB: admin:admin123 → strong password
   RabbitMQ: admin:admin123 → strong password
   ```

2. **Update JWT Secret**

   ```
   JWT_SECRET=your-super-secret-jwt-key → generate strong secret
   ```

3. **Add API Keys**

   ```
   STRIPE_SECRET_KEY=your-actual-key
   GOOGLE_MAPS_API_KEY=your-actual-key
   TWILIO_ACCOUNT_SID=your-actual-sid
   ```

4. **Enable HTTPS**

   - Use reverse proxy (nginx)
   - Get SSL certificates (Let's Encrypt)

5. **Configure CORS**
   - Whitelist frontend domains only

## 📦 Next Steps

### Immediate (Complete Core Features):

1. ✅ Test all implemented services
2. ⚙️ Complete Payment Service (Stripe integration)
3. ⚙️ Complete Delivery Service (tracking & optimization)
4. ⚙️ Complete Driver Service (approval workflow)
5. ⚙️ Complete Notification Service (email/SMS)

### Short-term (Enhanced Features):

1. Implement Review Service
2. Build Analytics Service
3. Create Wishlist Service
4. Build Admin dashboard (React)
5. Build Boutique Owner dashboard

### Long-term (Full Platform):

1. Build Client mobile app (React Native)
2. Build Driver mobile app
3. Implement Chat Service (WebSocket)
4. Add Promotion Service
5. Add Dispute Resolution
6. Implement comprehensive Analytics
7. Set up CI/CD pipeline
8. Deploy to production (AWS/Azure/GCP)

## 🐛 Troubleshooting

### Services won't start

```powershell
# Check Docker is running
docker version

# Remove and restart
docker-compose down
docker-compose up -d
```

### Port already in use

```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill process
taskkill /PID <process_id> /F
```

### Database connection failed

```powershell
# Check MongoDB container
docker exec -it mongo-user mongosh -u admin -p admin123

# Verify connection string in .env
```

### RabbitMQ connection failed

```powershell
# Check RabbitMQ container
docker logs rabbitmq

# Access management UI
http://localhost:15672
```

## 📚 Additional Resources

- **Main README:** `README.md` - Complete documentation
- **Implementation Guide:** `SERVICES_IMPLEMENTATION_GUIDE.md` - Service details
- **Shared Utilities:** `shared/` - Reusable code
- **Docker Compose:** `docker-compose.yml` - Infrastructure config

## 🤝 Support

For issues:

1. Check service logs: `docker-compose logs -f <service-name>`
2. Verify health endpoints: `curl http://localhost:<port>/health`
3. Check database connections in MongoDB Compass
4. Verify message broker in RabbitMQ UI

## 🎉 Success Indicators

Your platform is ready when:

- ✅ All services show "healthy" status
- ✅ You can register and login users
- ✅ You can create boutiques
- ✅ You can add products
- ✅ You can create orders
- ✅ RabbitMQ shows active exchanges
- ✅ MongoDB databases are populated

---

**🚀 Your Virtual Mall Platform is Ready!**

Start building the frontend applications and complete the remaining service implementations according to the priorities in the implementation guide.

Good luck! 🎊
