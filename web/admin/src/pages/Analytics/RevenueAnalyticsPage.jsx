import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../Analytics/AnalyticsOverview.css';

const RevenueAnalyticsPage = () => {
  const [revenue, setRevenue] = useState({ total: 0, byBoutique: [], byMonth: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const [orders, boutiques] = await Promise.all([apiClient.getOrders(), apiClient.getBoutiques()]);
      const total = orders.data?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;
      
      const byBoutique = boutiques.data?.map(b => ({
        name: b.name,
        revenue: orders.data?.filter(o => o.boutiqueId?._id === b._id).reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0,
      })).sort((a, b) => b.revenue - a.revenue).slice(0, 10) || [];

      setRevenue({ total, byBoutique, byMonth: [4200, 5100, 4800, 6200, 7100, 6800] });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="analytics-page"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div><h1><FiDollarSign /> Revenue Analytics</h1><p>Detailed revenue breakdown and trends</p></div>
      </div>
      <div className="analytics-stats">
        <div className="stat-card">
          <FiDollarSign className="stat-icon revenue" />
          <div className="stat-details"><h3>${(revenue.total / 1000).toFixed(1)}K</h3><p>Total Revenue</p></div>
        </div>
        <div className="stat-card">
          <FiTrendingUp className="stat-icon growth" />
          <div className="stat-details"><h3>+22%</h3><p>Growth Rate</p></div>
        </div>
      </div>
      <div className="chart-card">
        <h3>Top Boutiques by Revenue</h3>
        {revenue.byBoutique.map((b, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #F3F4F6' }}>
            <span>{b.name}</span><strong>${b.revenue.toFixed(0)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueAnalyticsPage;
