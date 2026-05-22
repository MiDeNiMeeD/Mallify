import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppChatProvider } from "./chat/AppChatProvider";
import LoginPage2 from "./pages/LoginPage2";
import Layout from "./components/Layout/Layout";
import DashboardOverview from "./pages/Dashboard/DashboardOverview";
import BoutiqueProfile from "./pages/Boutique/BoutiqueProfile";
import BoutiqueHours from "./pages/Boutique/BoutiqueHours";
import BoutiqueDelivery from "./pages/Boutique/BoutiqueDelivery";
import MyBoutique from "./pages/Boutique/MyBoutique";
import ProductsList from "./pages/Products/ProductsList";
import AddProduct from "./pages/Products/AddProduct";
import EditProduct from "./pages/Products/EditProduct";
import ViewProduct from "./pages/Products/ViewProduct";
import InventoryAlerts from "./pages/Products/InventoryAlerts";
import OrdersList from "./pages/Orders/OrdersList";
import OrdersPending from "./pages/Orders/OrdersPending";
import OrdersProcessing from "./pages/Orders/OrdersProcessing";
import OrdersReturns from "./pages/Orders/OrdersReturns";
import OrderDetails from "./pages/Orders/OrderDetails";
import AnalyticsOverview from "./pages/Analytics/AnalyticsOverview";
import AnalyticsReports from "./pages/Analytics/AnalyticsReports";
import PromotionsList from "./pages/Promotions/PromotionsList";
import PromotionsDiscounts from "./pages/Promotions/PromotionsDiscounts";
import PromotionsFlashSales from "./pages/Promotions/PromotionsFlashSales";
import CustomerMessages from "./pages/Communication/CustomerMessages";
import ReviewsRatings from "./pages/Communication/ReviewsRatings";
import SubscriptionPlans from "./pages/Subscription/SubscriptionPlans";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/StoreOwner-SignIn" replace />;
};

const ManagementRoute = ({ children }) => {
  const { isAuthenticated, loading, subscriptionLoading, hasManagementAccess } = useAuth();

  if (loading || subscriptionLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/StoreOwner-SignIn" replace />;
  }

  if (!hasManagementAccess) {
    return <Navigate to="/subscription" replace />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/StoreOwner-SignIn" replace />
        }
      />
      <Route path="/StoreOwner-SignIn" element={<LoginPage2 />} />

      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <Layout>
              <SubscriptionPlans />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ManagementRoute>
            <Layout>
              <DashboardOverview />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/boutique/preview"
        element={
          <ManagementRoute>
            <Layout>
              <MyBoutique />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/boutique/profile"
        element={
          <ManagementRoute>
            <Layout>
              <BoutiqueProfile />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/boutique/hours"
        element={
          <ManagementRoute>
            <Layout>
              <BoutiqueHours />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/boutique/delivery"
        element={
          <ManagementRoute>
            <Layout>
              <BoutiqueDelivery />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ManagementRoute>
            <Layout>
              <ProductsList />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/products/add"
        element={
          <ManagementRoute>
            <Layout>
              <AddProduct />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/products/:productId"
        element={
          <ManagementRoute>
            <Layout>
              <ViewProduct />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/products/:productId/edit"
        element={
          <ManagementRoute>
            <Layout>
              <EditProduct />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/products/inventory"
        element={
          <ManagementRoute>
            <Layout>
              <InventoryAlerts />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ManagementRoute>
            <Layout>
              <OrdersList />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/orders/pending"
        element={
          <ManagementRoute>
            <Layout>
              <OrdersPending />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/orders/processing"
        element={
          <ManagementRoute>
            <Layout>
              <OrdersProcessing />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/orders/returns"
        element={
          <ManagementRoute>
            <Layout>
              <OrdersReturns />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/orders/:orderId"
        element={
          <ManagementRoute>
            <Layout>
              <OrderDetails />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ManagementRoute>
            <Layout>
              <AnalyticsOverview />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/analytics/reports"
        element={
          <ManagementRoute>
            <Layout>
              <AnalyticsReports />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/promotions"
        element={
          <ManagementRoute>
            <Layout>
              <PromotionsList />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/promotions/discounts"
        element={
          <ManagementRoute>
            <Layout>
              <PromotionsDiscounts />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/promotions/flash-sales"
        element={
          <ManagementRoute>
            <Layout>
              <PromotionsFlashSales />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/communication/customers"
        element={
          <ManagementRoute>
            <Layout>
              <CustomerMessages />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route
        path="/communication/reviews"
        element={
          <ManagementRoute>
            <Layout>
              <ReviewsRatings />
            </Layout>
          </ManagementRoute>
        }
      />

      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/StoreOwner-SignIn'} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppChatProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </AppChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
