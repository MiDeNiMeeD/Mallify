Your project is a Virtual Mall Platform - a comprehensive e-commerce ecosystem built with microservices architecture. Here's the concept:

🛍️ Core Idea
A multi-vendor online marketplace platform (like Amazon or Alibaba) where multiple boutiques/stores can operate under one unified platform, with integrated delivery services similar to Amazon Flex.

🎯 Key Features
Multi-Stakeholder Platform:

Boutiques/Vendors can register and sell their products
Customers can browse, shop from multiple stores in one order
Delivery Drivers can pick up and deliver orders (Amazon Flex-style)
Admins oversee the entire platform
Managers handle boutique operations or delivery logistics
Architecture:

15 microservices handling different business functions (users, products, orders, payments, delivery, chat, reviews, analytics, etc.)
Event-driven communication via RabbitMQ
Each service has its own MongoDB database
API Gateway as unified entry point
Real-time features (chat, tracking)
Three Main Apps:

Client App (React Native) - For customers to shop
Driver App (React Native) - For delivery drivers to manage deliveries and earnings
Web Portals - Admin, boutique manager, and store owner dashboards
Advanced Capabilities:

Subscription tiers for boutiques (Basic, Premium, Enterprise)
Driver onboarding and earnings tracking
Real-time delivery tracking
Promotions, flash sales, coupons
Reviews and ratings
Dispute resolution
Analytics and business intelligence
Multi-payment options
Audit logging
Essentially, you're building a complete virtual shopping mall ecosystem where vendors, customers, and delivery drivers all interact seamlessly through different interfaces!