import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardHome from './components/Dashboard/DashboardHome';
import DriverList from './components/Drivers/DriverList';
import Deliveries from './components/Deliveries/Deliveries';
import Logistics from './components/Logistics/Logistics';
import Analytics from './components/Analytics/Analytics';
import Financial from './components/Financial/Financial';
import Communication from './components/Communication/Communication';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardHome />} />
          <Route path="drivers" element={<DriverList />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="logistics" element={<Logistics />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="financial" element={<Financial />} />
          <Route path="communication" element={<Communication />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
