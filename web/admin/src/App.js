import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout/Layout";
import DashboardHome from "./pages/DashboardHome";

// User Management Pages
import AllUsers from "./pages/Users/AllUsers";
import Customers from "./pages/Users/Customers";
import BoutiquesUsers from "./pages/Users/BoutiquesUsers";
import DriversUsers from "./pages/Users/DriversUsers";
import ManagersUsers from "./pages/Users/ManagersUsers";

// Boutiques Pages
import AllBoutiquesPage from "./pages/Boutiques/AllBoutiquesPage";
import PendingBoutiquesPage from "./pages/Boutiques/PendingBoutiquesPage";
import VerifiedBoutiquesPage from "./pages/Boutiques/VerifiedBoutiquesPage";
import BoutiqueDetailPage from "./pages/Boutiques/BoutiqueDetailPage";

// Orders Pages
import AllOrdersPage from "./pages/Orders/AllOrdersPage";
import TrackingPage from "./pages/Orders/TrackingPage";
import DisputesPage from "./pages/Orders/DisputesPage";

// Products Pages
import AllProductsPage from "./pages/Products/AllProductsPage";
import CreateProductPage from "./pages/Products/CreateProductPage";
import EditProductPage from "./pages/Products/EditProductPage";
import ManageProductPage from "./pages/Products/ManageProductPage";

// Payments Pages
import TransactionsPage from "./pages/Payments/TransactionsPage";
import PayoutsPage from "./pages/Payments/PayoutsPage";
import PaymentDisputesPage from "./pages/Payments/PaymentDisputesPage";

// Promotions Pages
import PromotionsPage from "./pages/Promotions/Promotions";

// Analytics Pages
import AnalyticsOverviewPage from "./pages/Analytics/AnalyticsOverviewPage";
import RevenueAnalyticsPage from "./pages/Analytics/RevenueAnalyticsPage";
import UserStatsPage from "./pages/Analytics/UserStatsPage";
import PerformanceAnalyticsPage from "./pages/Analytics/PerformanceAnalyticsPage";

// System Pages
import AuditLogsPage from "./pages/System/AuditLogsPage";
import ActivityMonitorPage from "./pages/System/ActivityMonitorPage";
import MaintenancePage from "./pages/System/MaintenancePage";

// Notifications & Settings
import NotificationsManagerPage from "./pages/Notifications/NotificationsManagerPage";
import SettingsPage from "./pages/Settings/SettingsPage";

// Messages
import MessagesPage from "./pages/Messages/MessagesPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-spinner" aria-hidden="true" />
        <div className="app-loading-text">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Route - Login */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      
      {/* Protected Routes - Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardHome />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* User Management Routes */}
      <Route path="/users" element={<ProtectedRoute><Layout><AllUsers /></Layout></ProtectedRoute>} />
      <Route path="/users/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
      <Route path="/users/boutiques" element={<ProtectedRoute><Layout><BoutiquesUsers /></Layout></ProtectedRoute>} />
      <Route path="/users/drivers" element={<ProtectedRoute><Layout><DriversUsers /></Layout></ProtectedRoute>} />
      <Route path="/users/managers" element={<ProtectedRoute><Layout><ManagersUsers /></Layout></ProtectedRoute>} />
      
      {/* Boutiques Routes */}
      <Route path="/boutiques" element={<ProtectedRoute><Layout><AllBoutiquesPage /></Layout></ProtectedRoute>} />
      <Route path="/boutiques/pending" element={<ProtectedRoute><Layout><PendingBoutiquesPage /></Layout></ProtectedRoute>} />
      <Route path="/boutiques/verified" element={<ProtectedRoute><Layout><VerifiedBoutiquesPage /></Layout></ProtectedRoute>} />
      <Route path="/boutiques/:id" element={<ProtectedRoute><Layout><BoutiqueDetailPage /></Layout></ProtectedRoute>} />
      
      {/* Orders Routes */}
      <Route path="/orders" element={<ProtectedRoute><Layout><AllOrdersPage /></Layout></ProtectedRoute>} />
      <Route path="/orders/tracking" element={<ProtectedRoute><Layout><TrackingPage /></Layout></ProtectedRoute>} />
      <Route path="/orders/disputes" element={<ProtectedRoute><Layout><DisputesPage /></Layout></ProtectedRoute>} />

      {/* Products Routes */}
      <Route path="/products" element={<ProtectedRoute><Layout><AllProductsPage /></Layout></ProtectedRoute>} />
      <Route path="/products/add" element={<ProtectedRoute><Layout><CreateProductPage /></Layout></ProtectedRoute>} />
      <Route path="/products/edit/:id" element={<ProtectedRoute><Layout><EditProductPage /></Layout></ProtectedRoute>} />
      <Route path="/products/:id/manage" element={<ProtectedRoute><Layout><ManageProductPage /></Layout></ProtectedRoute>} />
      
      {/* Payments Routes */}
      <Route path="/payments" element={<ProtectedRoute><Layout><TransactionsPage /></Layout></ProtectedRoute>} />
      <Route path="/payments/payouts" element={<ProtectedRoute><Layout><PayoutsPage /></Layout></ProtectedRoute>} />
      <Route path="/payments/disputes" element={<ProtectedRoute><Layout><PaymentDisputesPage /></Layout></ProtectedRoute>} />

      {/* Promotions Routes */}
      <Route path="/promotions" element={<ProtectedRoute><Layout><PromotionsPage /></Layout></ProtectedRoute>} />
      
      {/* Analytics Routes */}
      <Route path="/analytics" element={<ProtectedRoute><Layout><AnalyticsOverviewPage /></Layout></ProtectedRoute>} />
      <Route path="/analytics/revenue" element={<ProtectedRoute><Layout><RevenueAnalyticsPage /></Layout></ProtectedRoute>} />
      <Route path="/analytics/users" element={<ProtectedRoute><Layout><UserStatsPage /></Layout></ProtectedRoute>} />
      <Route path="/analytics/performance" element={<ProtectedRoute><Layout><PerformanceAnalyticsPage /></Layout></ProtectedRoute>} />
      
      {/* System Routes */}
      <Route path="/system/logs" element={<ProtectedRoute><Layout><AuditLogsPage /></Layout></ProtectedRoute>} />
      <Route path="/system/activity" element={<ProtectedRoute><Layout><ActivityMonitorPage /></Layout></ProtectedRoute>} />
      <Route path="/system/maintenance" element={<ProtectedRoute><Layout><MaintenancePage /></Layout></ProtectedRoute>} />
      
      {/* Messages Route */}
      <Route path="/messages" element={<ProtectedRoute><Layout><MessagesPage /></Layout></ProtectedRoute>} />

      {/* Notifications Route */}
      <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsManagerPage /></Layout></ProtectedRoute>} />
      
      {/* Settings Route */}
      <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
