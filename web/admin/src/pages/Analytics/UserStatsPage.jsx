import React, { useState, useEffect } from 'react';
import { FiUsers } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../Analytics/AnalyticsOverview.css';

const UserStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const users = await apiClient.getUsers();
      const total = users.data?.length || 0;
      const byRole = {
        customers: users.data?.filter(u => u.role === 'customer').length || 0,
        boutiques: users.data?.filter(u => u.role === 'boutique_owner').length || 0,
        drivers: users.data?.filter(u => u.role === 'driver').length || 0,
      };
      setStats({ total, byRole });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return <div className="analytics-page"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div><h1><FiUsers /> User Statistics</h1><p>User demographics and growth metrics</p></div>
      </div>
      <div className="analytics-stats">
        <div className="stat-card">
          <FiUsers className="stat-icon users" />
          <div className="stat-details"><h3>{stats.total}</h3><p>Total Users</p></div>
        </div>
        <div className="stat-card">
          <FiUsers className="stat-icon users" />
          <div className="stat-details"><h3>{stats.byRole.customers}</h3><p>Customers</p></div>
        </div>
        <div className="stat-card">
          <FiUsers className="stat-icon boutiques" />
          <div className="stat-details"><h3>{stats.byRole.boutiques}</h3><p>Boutiques</p></div>
        </div>
        <div className="stat-card">
          <FiUsers className="stat-icon orders" />
          <div className="stat-details"><h3>{stats.byRole.drivers}</h3><p>Drivers</p></div>
        </div>
      </div>
    </div>
  );
};

export default UserStatsPage;
