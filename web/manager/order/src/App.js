import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage2 from "./pages/LoginPage2";
import Layout from "./components/Layout/Layout";
import DashboardHome from "./components/Dashboard/DashboardHome";

// Drivers Pages
import AllDrivers from "./pages/Drivers/AllDrivers";
import DriverOnboarding from "./pages/Drivers/DriverOnboarding";
import DriverPerformance from "./pages/Drivers/DriverPerformance";
import ZoneAssignment from "./pages/Drivers/ZoneAssignment";

// Deliveries Pages
import DeliveryMonitor from "./pages/Deliveries/DeliveryMonitor";
import DeliveryTracking from "./pages/Deliveries/DeliveryTracking";
import DeliveryIssues from "./pages/Deliveries/DeliveryIssues";
import PricingRules from "./pages/Deliveries/PricingRules";

// Logistics Pages
import LogisticsCoordination from "./pages/Logistics/LogisticsCoordination";
import ScheduleManagement from "./pages/Logistics/ScheduleManagement";

// Analytics Pages
import AnalyticsDashboard from "./pages/Analytics/AnalyticsDashboard";
import AnalyticsReports from "./pages/Analytics/AnalyticsReports";
import EfficiencyMetrics from "./pages/Analytics/EfficiencyMetrics";

// Financial Pages
import FinancialManagement from "./pages/Financial/FinancialManagement";

// Communication Pages
import DriverChat from "./pages/Communication/DriverChat";
import NotificationsManager from "./pages/Communication/NotificationsManager";



// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1.125rem',
        color: '#6b7280'
      }}>
        Loading...
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
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage2 />} 
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
      
      <Route 
        path="/drivers" 
        element={
          <ProtectedRoute>
            <Layout>
              <AllDrivers />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/drivers/onboarding" 
        element={
          <ProtectedRoute>
            <Layout>
              <DriverOnboarding />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/drivers/performance" 
        element={
          <ProtectedRoute>
            <Layout>
              <DriverPerformance />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/drivers/zones" 
        element={
          <ProtectedRoute>
            <Layout>
              <ZoneAssignment />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/deliveries" 
        element={
          <ProtectedRoute>
            <Layout>
              <DeliveryMonitor />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/deliveries/tracking" 
        element={
          <ProtectedRoute>
            <Layout>
              <DeliveryTracking />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/deliveries/issues" 
        element={
          <ProtectedRoute>
            <Layout>
              <DeliveryIssues />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/deliveries/pricing" 
        element={
          <ProtectedRoute>
            <Layout>
              <PricingRules />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/logistics" 
        element={
          <ProtectedRoute>
            <Layout>
              <LogisticsCoordination />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/logistics/schedule" 
        element={
          <ProtectedRoute>
            <Layout>
              <ScheduleManagement />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <Layout>
              <AnalyticsDashboard />
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
        path="/analytics/efficiency" 
        element={
          <ProtectedRoute>
            <Layout>
              <EfficiencyMetrics />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/financial" 
        element={
          <ProtectedRoute>
            <Layout>
              <FinancialManagement />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/communication" 
        element={
          <ProtectedRoute>
            <Layout>
              <DriverChat />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/communication/notifications" 
        element={
          <ProtectedRoute>
            <Layout>
              <NotificationsManager />
            </Layout>
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

