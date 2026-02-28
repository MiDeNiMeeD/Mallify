import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage2 from "./pages/LoginPage2";
import DashboardLayout from "./components/Layout/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview/DashboardOverview";
import AllBoutiques from "./pages/AllBoutiques/AllBoutiques";
import PendingBoutiques from "./pages/Boutiques/PendingBoutiques";
import VerifiedBoutiques from "./pages/Boutiques/VerifiedBoutiques";
import BoutiqueApprovals from "./pages/BoutiqueApprovals/BoutiqueApprovals";
import Analytics from "./pages/Analytics/Analytics";
import AnalyticsReports from "./pages/Analytics/AnalyticsReports";
import AnalyticsInsights from "./pages/Analytics/AnalyticsInsights";
import Compliance from "./pages/Compliance/Compliance";
import Promotions from "./pages/Promotions/Promotions";

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

      {/* Catch all - redirect to dashboard */}
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

