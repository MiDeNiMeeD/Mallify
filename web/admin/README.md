# Mallify Admin Dashboard

Complete system administration portal for Mallify platform with enhanced purple/blue gradient theme.

## 🚀 Features

### ✅ Completed
- **Enhanced Login Page** - Modern gradient design with admin branding
- **Sidebar Navigation** - Collapsible sidebar with admin menu structure
- **Header Component** - Search bar and notification system
- **Dashboard Home** - Overview with stats, activities, and quick actions
- **Authentication** - Role-based access control (Admin role required)
- **Layout System** - Responsive layout with gradient styling
- **API Client** - Centralized API communication layer

### 📋 Menu Structure
- **Dashboard** - System overview with key metrics
- **User Management**
  - All Users
  - Customers
  - Boutiques
  - Drivers
  - Managers
- **Boutiques**
  - All Boutiques
  - Approvals
  - Compliance
  - Performance
- **Orders & Delivery**
  - All Orders
  - Tracking
  - Disputes
- **Payments**
  - Transactions
  - Payouts
  - Disputes
- **Analytics**
  - Overview
  - Revenue
  - User Stats
  - Performance
- **System**
  - Audit Logs
  - Activity Monitor
  - Maintenance
- **Notifications**
- **Settings**

## 🎨 Design Highlights

### Enhanced Styling
- **Purple/Blue Gradient Theme** - Modern, professional admin aesthetic
- **Dark Sidebar** - Deep purple gradient background (#1E1B4B to #312E81)
- **Glassmorphism Effects** - Backdrop blur and transparency
- **Smooth Animations** - Hover effects, transitions, and micro-interactions
- **Gradient Buttons** - Eye-catching call-to-action elements
- **Enhanced Icons** - Drop shadows and color gradients
- **Status Indicators** - Pulsing dots for system health

### Color Palette
- Primary Purple: #7C3AED
- Primary Dark: #5B21B6
- Primary Light: #A78BFA
- Accent Blue: #3B82F6
- Accent Cyan: #06B6D4

## 🛠 Installation

1. Navigate to the admin directory:
   ```bash
   cd web/admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. The admin dashboard will open at `http://localhost:3336`

## 🔐 Authentication

**Admin Login:**
- Email: admin@mallify.com
- Password: [Set via backend]

**Access Control:**
- Only users with `role: 'admin'` can access this dashboard
- Invalid roles are automatically rejected and logged out

## 📦 Project Structure

```
web/admin/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── mallify.png
├── src/
│   ├── api/
│   │   └── apiClient.js
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Sidebar.css
│   │   │   ├── Header.jsx
│   │   │   ├── Header.css
│   │   │   ├── Layout.jsx
│   │   │   └── Layout.css
│   │   ├── Toast.jsx
│   │   └── Toast.css
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── LoginPage.css
│   │   ├── DashboardHome.jsx
│   │   └── DashboardHome.css
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 🔗 API Integration

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:4000';
```

### Available Endpoints
- User Management: `/api/users`
- Boutique Management: `/api/boutiques`
- Order Management: `/api/orders`
- Analytics: `/api/analytics`
- Audit Logs: `/api/audit`
- Notifications: `/api/notifications`
- System Settings: `/api/settings`

## 🎯 Next Steps

1. **Implement User Management Pages**
   - All users list with filtering
   - User details and editing
   - Role management

2. **Implement Boutique Management**
   - Approval workflow
   - Compliance monitoring
   - Performance metrics

3. **Implement Order Management**
   - Order tracking and monitoring
   - Dispute resolution
   - Delivery management

4. **Implement Payment Management**
   - Transaction history
   - Payout processing
   - Dispute handling

5. **Implement Analytics**
   - Revenue charts
   - User growth metrics
   - Performance dashboards

6. **Implement System Management**
   - Audit log viewer
   - Activity monitor
   - System maintenance tools

## 🚀 Development

- Port: `3336`
- Framework: React 18
- Router: React Router v6
- Icons: React Icons (Feather Icons)
- Styling: Custom CSS with CSS Variables

## 📝 Notes

- The admin dashboard uses an enhanced purple/blue gradient theme
- All pages are protected and require admin authentication
- The sidebar is collapsible for better screen space management
- Placeholder pages show "Coming Soon" for pages not yet implemented
- All components follow the same design system and color palette

## 🎨 Comparison with Manager Dashboard

**Admin Dashboard Enhancements:**
- Deeper purple/blue gradient theme (vs orange theme)
- More sophisticated glassmorphism effects
- Enhanced security notices and badges
- System-wide administration focus
- Broader menu structure for platform management
- Professional admin portal aesthetic

---

**Status:** 🟢 Base structure complete, ready for page implementation
**Version:** 1.0.0
**Last Updated:** February 2026
