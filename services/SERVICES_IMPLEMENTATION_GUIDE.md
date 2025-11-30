# Remaining Services Implementation Guide

This document provides the structure and key files for the remaining microservices. Each service follows the same architectural pattern.

## Services to Implement

### 1. Payment Service (Port 3007)

**Features:**

- Payment processing (Stripe integration)
- Subscription management for boutiques
- Coupon and discount management
- Loyalty points system
- Payment history and refunds

**Key Models:**

- Payment: transactionId, amount, method, status, orderId, customerId
- Subscription: boutiqueId, plan, status, billingCycle, amount
- Coupon: code, discount, type, validFrom, validTo, usageLimit
- LoyaltyPoints: customerId, points, transactions

**Environment Variables:**

```
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

---

### 2. Delivery Service (Port 3008)

**Features:**

- Delivery assignment and tracking
- Route optimization
- Delivery status updates
- Real-time location tracking
- Delivery history

**Key Models:**

- Delivery: orderId, driverId, status, pickupLocation, deliveryLocation, estimatedTime
- Route: deliveryIds, optimizedPath, totalDistance, estimatedDuration
- DeliveryTracking: deliveryId, currentLocation, updates

**Environment Variables:**

```
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

---

### 3. Driver Service (Port 3009)

**Features:**

- Driver registration and onboarding
- Document verification
- Approval workflow (by delivery manager)
- Earnings calculation
- Performance metrics
- Driver ratings

**Key Models:**

- Driver: userId, vehicleInfo, licenseNumber, status (pending/approved/rejected)
- Document: driverId, type, fileUrl, verificationStatus
- Earnings: driverId, deliveryId, amount, date, status (pending/paid)
- DriverStats: totalDeliveries, rating, completionRate

**Approval States:** pending → under_review → approved/rejected

---

### 4. Notification Service (Port 3010)

**Features:**

- Email notifications (nodemailer)
- SMS notifications (Twilio)
- Push notifications (FCM)
- Notification templates
- Notification preferences
- Delivery status

**Key Models:**

- Notification: userId, type, channel, title, body, status, sentAt
- NotificationTemplate: name, subject, body, variables
- NotificationPreference: userId, email, sms, push preferences

**Environment Variables:**

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=your-phone
FCM_SERVER_KEY=your-fcm-key
```

**Event Listeners:**

- order.created → Send confirmation
- order.status_updated → Send status update
- payment.completed → Send receipt
- driver.approved → Send approval notification

---

### 5. Review Service (Port 3011)

**Features:**

- Product reviews and ratings
- Boutique reviews
- Driver reviews
- Media upload support (images/videos)
- Review moderation
- Review responses

**Key Models:**

- Review: userId, targetType (product/boutique/driver), targetId, rating, comment, media, status
- ReviewResponse: reviewId, responderId, response
- ReviewStats: targetId, averageRating, totalReviews, distribution

---

### 6. Analytics Service (Port 3012)

**Features:**

- Sales analytics
- Customer insights
- Boutique performance
- Driver performance
- Revenue reports
- Real-time dashboards

**Key Models:**

- SalesMetric: boutiqueId, date, revenue, orders, averageOrderValue
- CustomerMetric: signups, activeUsers, retention
- ProductMetric: productId, views, sales, revenue
- DriverMetric: driverId, deliveries, earnings, rating

**Event Listeners:**

- order.created → Update sales metrics
- payment.completed → Update revenue
- product.viewed → Update views

---

### 7. Chat Service (Port 3013)

**Features:**

- Real-time chat (Socket.io/WebSocket)
- Client-to-Boutique chat
- Client-to-Driver chat
- Chat history
- Unread message counts
- File sharing

**Key Models:**

- Conversation: participants[], type, lastMessage, unreadCount
- Message: conversationId, senderId, content, type, media, timestamp, isRead

**Dependencies:**

```
socket.io
```

---

### 8. Promotion Service (Port 3014)

**Features:**

- Flash sales
- Promotional campaigns
- Discount management
- Time-limited offers
- Banner management

**Key Models:**

- Promotion: title, type, discount, startDate, endDate, products, boutiques, conditions
- FlashSale: productId, originalPrice, salePrice, startTime, endTime, quantity
- Campaign: name, description, banners, targetAudience, schedule

---

### 9. Wishlist Service (Port 3015)

**Features:**

- User wishlists
- Favorite products
- Favorite boutiques
- Price drop alerts
- Stock alerts

**Key Models:**

- Wishlist: userId, products[], createdAt
- Favorite: userId, targetType (product/boutique), targetId
- PriceAlert: userId, productId, targetPrice, isActive

---

### 10. Dispute Service (Port 3016)

**Features:**

- Order disputes
- Delivery disputes
- Dispute resolution workflow
- Evidence upload
- Admin mediation

**Key Models:**

- Dispute: orderId/deliveryId, customerId, type, reason, description, evidence, status
- DisputeMessage: disputeId, senderId, message, attachments
- Resolution: disputeId, resolvedBy, decision, compensaion

**Status Flow:** open → under_review → resolved/rejected

---

### 11. Audit Service (Port 3017)

**Features:**

- Centralized audit logging
- Activity tracking
- Compliance reporting
- Security events
- Data access logs

**Key Models:**

- AuditLog: userId, action, resource, changes, ipAddress, timestamp, service
- SecurityEvent: type, severity, userId, details
- DataAccessLog: userId, resource, operation, timestamp

**Event Listeners:**

- Listen to ALL service events for comprehensive logging

---

## Service Template Structure

Each service should have:

```
service-name/
├── Dockerfile
├── package.json
├── .env.example
├── src/
│   ├── index.js (main server file)
│   ├── models/ (Mongoose schemas)
│   ├── controllers/ (business logic)
│   ├── routes/ (API endpoints)
│   ├── middlewares/ (custom middleware)
│   └── utils/ (helper functions)
├── logs/
└── tests/
```

## Common Patterns

### 1. Index.js Template

```javascript
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const routes = require("./routes");
const messageBroker = require("../../shared/utils/messageBroker");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

messageBroker.connect().catch(console.error);

// Subscribe to events
messageBroker.subscribe(
  "exchange-name",
  "event.pattern",
  "queue-name",
  async (data) => {
    // Handle event
  }
);

app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "service-name" });
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`Service on port ${PORT}`));
```

### 2. Model Template

```javascript
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    // Define fields
  },
  {
    timestamps: true,
  }
);

schema.index({ field: 1 }); // Add indexes for performance

module.exports = mongoose.model("ModelName", schema);
```

### 3. Controller Template

```javascript
const Model = require("../models/Model");

exports.create = async (req, res) => {
  try {
    const item = new Model(req.body);
    await item.save();
    res.status(201).json({ message: "Created successfully", item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const items = await Model.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Model.countDocuments();

    res.json({
      items,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 4. Route Template

```javascript
const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");
const { authenticate, authorize } = require("../../../shared/middleware/auth");

router.post("/", authenticate, controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.put("/:id", authenticate, controller.update);
router.delete("/:id", authenticate, authorize("admin"), controller.delete);

module.exports = router;
```

## Implementation Priority

1. **High Priority (Core functionality):**

   - Payment Service
   - Delivery Service
   - Driver Service
   - Notification Service

2. **Medium Priority (Enhanced features):**

   - Review Service
   - Analytics Service
   - Wishlist Service

3. **Low Priority (Additional features):**
   - Chat Service
   - Promotion Service
   - Dispute Service
   - Audit Service

## Testing Each Service

```bash
# Start all services
docker-compose up -d

# Test service health
curl http://localhost:3000/health

# View logs
docker-compose logs -f service-name

# Restart service
docker-compose restart service-name
```

## Next Steps

1. Implement high-priority services first
2. Test inter-service communication
3. Set up monitoring and logging
4. Implement frontend applications
5. Set up CI/CD pipeline
6. Deploy to production environment

---

**Note:** All services follow the same patterns established in User, Boutique, Product, and Order services. Copy and adapt the existing code structure for consistency.
