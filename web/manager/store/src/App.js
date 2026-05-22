import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppChatProvider } from "./chat/AppChatProvider";
import LoginPage2 from "./pages/LoginPage2";
import DashboardLayout from "./components/Layout/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview/DashboardOverview";
import AllBoutiques from "./pages/AllBoutiques/AllBoutiques";
import PendingBoutiques from "./pages/Boutiques/PendingBoutiques";
import VerifiedBoutiques from "./pages/Boutiques/VerifiedBoutiques";
import BoutiqueDetail from "./pages/Boutiques/BoutiqueDetail";
import BoutiqueApprovals from "./pages/BoutiqueApprovals/BoutiqueApprovals";
import AllProducts from "./pages/Products/AllProducts";
import ManageProduct from "./pages/Products/ManageProduct";
import CreateProduct from "./pages/Products/CreateProduct";
import EditProduct from "./pages/Products/EditProduct";
import Analytics from "./pages/Analytics/Analytics";
import AnalyticsReports from "./pages/Analytics/AnalyticsReports";
import AnalyticsInsights from "./pages/Analytics/AnalyticsInsights";
import Compliance from "./pages/Compliance/Compliance";
import Promotions from "./pages/Promotions/Promotions";
import MessagesPage from "./pages/Messages/MessagesPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
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
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage2 />} 
      />
      
      {/* Protected Routes - Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardOverview />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/boutiques" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AllBoutiques />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/boutiques/pending" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PendingBoutiques />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/boutiques/verified" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <VerifiedBoutiques />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/boutiques/:id" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BoutiqueDetail />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AllProducts />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/products/add" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CreateProduct />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/products/edit/:id" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EditProduct />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/products/:id/manage" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ManageProduct />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/approvals" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BoutiqueApprovals />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/analytics/reports" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AnalyticsReports />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/analytics/insights" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AnalyticsInsights />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/compliance" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Compliance />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route
        path="/promotions"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Promotions />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MessagesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
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

