import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage2 from "./pages/LoginPage2";
import Layout from "./components/Layout/Layout";
import DashboardOverview from "./pages/Dashboard/DashboardOverview";
import BoutiqueProfile from "./pages/Boutique/BoutiqueProfile";
import BoutiqueHours from "./pages/Boutique/BoutiqueHours";
import BoutiqueDelivery from "./pages/Boutique/BoutiqueDelivery";
import MyBoutique from "./pages/Boutique/MyBoutique";
import ProductsList from "./pages/Products/ProductsList";
import AddProduct from "./pages/Products/AddProduct";
import InventoryAlerts from "./pages/Products/InventoryAlerts";
import OrdersList from "./pages/Orders/OrdersList";
import OrdersPending from "./pages/Orders/OrdersPending";
import OrdersProcessing from "./pages/Orders/OrdersProcessing";
import OrdersReturns from "./pages/Orders/OrdersReturns";
import AnalyticsOverview from "./pages/Analytics/AnalyticsOverview";
import AnalyticsReports from "./pages/Analytics/AnalyticsReports";
import PromotionsList from "./pages/Promotions/PromotionsList";
import PromotionsDiscounts from "./pages/Promotions/PromotionsDiscounts";
import PromotionsFlashSales from "./pages/Promotions/PromotionsFlashSales";
import CustomerMessages from "./pages/Communication/CustomerMessages";
import ReviewsRatings from "./pages/Communication/ReviewsRatings";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/StoreOwner-SignIn" replace />;
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
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardOverview />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/boutique/preview"
        element={
          <ProtectedRoute>
            <Layout>
              <MyBoutique />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/boutique/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <BoutiqueProfile />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/boutique/hours"
        element={
          <ProtectedRoute>
            <Layout>
              <BoutiqueHours />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/boutique/delivery"
        element={
          <ProtectedRoute>
            <Layout>
              <BoutiqueDelivery />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Layout>
              <ProductsList />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products/add"
        element={
          <ProtectedRoute>
            <Layout>
              <AddProduct />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products/inventory"
        element={
          <ProtectedRoute>
            <Layout>
              <InventoryAlerts />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Layout>
              <OrdersList />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/pending"
        element={
          <ProtectedRoute>
            <Layout>
              <OrdersPending />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/processing"
        element={
          <ProtectedRoute>
            <Layout>
              <OrdersProcessing />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/returns"
        element={
          <ProtectedRoute>
            <Layout>
              <OrdersReturns />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <AnalyticsOverview />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <AnalyticsReports />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/promotions"
        element={
          <ProtectedRoute>
            <Layout>
              <PromotionsList />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/promotions/discounts"
        element={
          <ProtectedRoute>
            <Layout>
              <PromotionsDiscounts />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/promotions/flash-sales"
        element={
          <ProtectedRoute>
            <Layout>
              <PromotionsFlashSales />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/communication/customers"
        element={
          <ProtectedRoute>
            <Layout>
              <CustomerMessages />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/communication/reviews"
        element={
          <ProtectedRoute>
            <Layout>
              <ReviewsRatings />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
