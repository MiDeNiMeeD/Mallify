const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(compression()); // Compression
app.use(morgan("combined")); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

// Service URLs
const SERVICES = {
  USER: process.env.USER_SERVICE_URL || "http://user-service:3001",
  BOUTIQUE: process.env.BOUTIQUE_SERVICE_URL || "http://boutique-service:3002",
  PRODUCT: process.env.PRODUCT_SERVICE_URL || "http://product-service:3003",
  ORDER: process.env.ORDER_SERVICE_URL || "http://order-service:3004",
  PAYMENT: process.env.PAYMENT_SERVICE_URL || "http://payment-service:3007",
  DELIVERY: process.env.DELIVERY_SERVICE_URL || "http://delivery-service:3008",
  DRIVER: process.env.DRIVER_SERVICE_URL || "http://driver-service:3009",
  NOTIFICATION:
    process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:3010",
  REVIEW: process.env.REVIEW_SERVICE_URL || "http://review-service:3011",
  ANALYTICS:
    process.env.ANALYTICS_SERVICE_URL || "http://analytics-service:3012",
  CHAT: process.env.CHAT_SERVICE_URL || "http://chat-service:3013",
  PROMOTION:
    process.env.PROMOTION_SERVICE_URL || "http://promotion-service:3014",
  WISHLIST: process.env.WISHLIST_SERVICE_URL || "http://wishlist-service:3015",
  DISPUTE: process.env.DISPUTE_SERVICE_URL || "http://dispute-service:3016",
  AUDIT: process.env.AUDIT_SERVICE_URL || "http://audit-service:3017",
};

// Proxy configuration
const proxyOptions = {
  changeOrigin: true,
  pathRewrite: (path, req) => {
    // Remove only /api prefix, keep the rest
    return path.replace(/^\/api/, "");
  },
  onError: (err, req, res) => {
    console.error("Proxy error:", err);
    res.status(502).json({
      error: "Service temporarily unavailable",
      message: err.message,
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward user information if authenticated
    if (req.user) {
      proxyReq.setHeader("X-User-Id", req.user.userId);
      proxyReq.setHeader("X-User-Role", req.user.role);
    }

    // Log the proxied request for debugging
    console.log(`Proxying ${req.method} ${req.url} -> ${proxyReq.path}`);
  },
  logLevel: "debug",
};

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use(
  "/api/users",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.USER })
);
app.use(
  "/api/auth",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.USER })
);
app.use(
  "/api/boutiques",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.BOUTIQUE })
);
app.use(
  "/api/products",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.PRODUCT })
);
app.use(
  "/api/categories",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.PRODUCT })
);
app.use(
  "/api/orders",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.ORDER })
);
app.use(
  "/api/cart",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.ORDER })
);
app.use(
  "/api/payments",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.PAYMENT })
);
app.use(
  "/api/subscriptions",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.PAYMENT })
);
app.use(
  "/api/coupons",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.PAYMENT })
);
app.use(
  "/api/deliveries",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.DELIVERY })
);
app.use(
  "/api/drivers",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.DRIVER })
);
app.use(
  "/api/notifications",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.NOTIFICATION })
);
app.use(
  "/api/reviews",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.REVIEW })
);
app.use(
  "/api/ratings",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.REVIEW })
);
app.use(
  "/api/analytics",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.ANALYTICS })
);
app.use(
  "/api/chat",
  createProxyMiddleware({
    ...proxyOptions,
    target: SERVICES.CHAT,
    ws: true, // Enable WebSocket support
  })
);
app.use(
  "/api/promotions",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.PROMOTION })
);
app.use(
  "/api/flash-sales",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.PROMOTION })
);
app.use(
  "/api/wishlist",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.WISHLIST })
);
app.use(
  "/api/favorites",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.WISHLIST })
);
app.use(
  "/api/disputes",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.DISPUTE })
);
app.use(
  "/api/audit",
  createProxyMiddleware({ ...proxyOptions, target: SERVICES.AUDIT })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Gateway error:", err);
  res.status(err.statusCode || 500).json({
    error: err.message || "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
