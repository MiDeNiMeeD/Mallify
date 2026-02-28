import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiStar, FiPackage, FiDollarSign, FiUsers } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../Boutiques/AllBoutiques.css';

const PerformancePage = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('revenue');

  useEffect(() => {
    fetchBoutiques();
  }, []);

  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBoutiques();
      setBoutiques(response.data || []);
    } catch (error) {
      console.error('Error fetching boutiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedBoutiques = [...boutiques].sort((a, b) => {
    if (sortBy === 'revenue') return (b.revenue || 0) - (a.revenue || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'orders') return (b.orderCount || 0) - (a.orderCount || 0);
    return 0;
  });

  const totalRevenue = boutiques.reduce((sum, b) => sum + (b.revenue || 0), 0);
  const avgRating = boutiques.reduce((sum, b) => sum + (b.rating || 0), 0) / boutiques.length || 0;

  if (loading) {
    return <div className="all-boutiques-page"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  }

  return (
    <div className="all-boutiques-page">
      <div className="page-header">
        <div>
          <h1><FiTrendingUp /> Boutique Performance</h1>
          <p>Track and analyze boutique performance metrics</p>
        </div>
      </div>

      <div className="boutiques-stats">
        <div className="stat-card">
          <FiDollarSign className="stat-icon" />
          <div className="stat-details">
            <h3>${(totalRevenue / 1000).toFixed(1)}K</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <FiStar className="stat-icon rating" />
          <div className="stat-details">
            <h3>{avgRating.toFixed(1)}</h3>
            <p>Avg Rating</p>
          </div>
        </div>
        <div className="stat-card">
          <FiPackage className="stat-icon orders" />
          <div className="stat-details">
            <h3>{boutiques.reduce((sum, b) => sum + (b.orderCount || 0), 0)}</h3>
            <p>Total Orders</p>
          </div>
        </div>
      </div>

      <div className="boutiques-filters">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="revenue">Revenue</option>
          <option value="rating">Rating</option>
          <option value="orders">Orders</option>
        </select>
      </div>

      <div className="performance-list">
        {sortedBoutiques.map((boutique, index) => (
          <div key={boutique._id} className="performance-card">
            <div className="rank-badge">{index + 1}</div>
            <div className="boutique-info">
              <h3>{boutique.name}</h3>
              <div className="performance-metrics">
                <div className="metric">
                  <FiDollarSign />
                  <span>${(boutique.revenue || 0).toFixed(0)}</span>
                </div>
                <div className="metric">
                  <FiStar />
                  <span>{boutique.rating ? boutique.rating.toFixed(1) : 'N/A'}</span>
                </div>
                <div className="metric">
                  <FiPackage />
                  <span>{boutique.orderCount || 0} orders</span>
                </div>
                <div className="metric">
                  <FiUsers />
                  <span>{boutique.customerCount || 0} customers</span>
                </div>
              </div>
            </div>
            <button className="btn-primary">View Analytics</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformancePage;
