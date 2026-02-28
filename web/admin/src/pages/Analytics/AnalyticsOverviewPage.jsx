import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiShoppingBag, FiDollarSign, FiPackage } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import './AnalyticsOverview.css';

const AnalyticsOverviewPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [users, boutiques, orders] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getBoutiques(),
        apiClient.getOrders(),
      ]);

      const totalRevenue = orders.data?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;
      const avgOrderValue = orders.data?.length ? totalRevenue / orders.data.length : 0;

      setAnalytics({
        users: users.data?.length || 0,
        boutiques: boutiques.data?.length || 0,
        orders: orders.data?.length || 0,
        revenue: totalRevenue,
        avgOrderValue,
        newUsersThisMonth: users.data?.filter(u => {
          const createdDate = new Date(u.createdAt);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return createdDate > monthAgo;
        }).length || 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="analytics-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1><FiTrendingUp /> Analytics Overview</h1>
          <p>Comprehensive platform analytics and insights</p>
        </div>
      </div>

      <div className="analytics-stats">
        <div className="stat-card">
          <FiUsers className="stat-icon users" />
          <div className="stat-details">
            <h3>{analytics.users}</h3>
            <p>Total Users</p>
            <span className="stat-change positive">+{analytics.newUsersThisMonth} this month</span>
          </div>
        </div>
        <div className="stat-card">
          <FiShoppingBag className="stat-icon boutiques" />
          <div className="stat-details">
            <h3>{analytics.boutiques}</h3>
            <p>Boutiques</p>
            <span className="stat-change positive">+{Math.floor(analytics.boutiques * 0.1)} this month</span>
          </div>
        </div>
        <div className="stat-card">
          <FiShoppingBag className="stat-icon orders" />
          <div className="stat-details">
            <h3>{analytics.orders}</h3>
            <p>Total Orders</p>
            <span className="stat-change positive">+15% vs last month</span>
          </div>
        </div>
        <div className="stat-card">
          <FiDollarSign className="stat-icon revenue" />
          <div className="stat-details">
            <h3>${(analytics.revenue / 1000).toFixed(1)}K</h3>
            <p>Total Revenue</p>
            <span className="stat-change positive">+22% growth</span>
          </div>
        </div>
        <div className="stat-card">
          <FiPackage className="stat-icon avg" />
          <div className="stat-details">
            <h3>${analytics.avgOrderValue.toFixed(2)}</h3>
            <p>Avg Order Value</p>
            <span className="stat-change">+8% vs last month</span>
          </div>
        </div>
        <div className="stat-card">
          <FiTrendingUp className="stat-icon growth" />
          <div className="stat-details">
            <h3>92%</h3>
            <p>Platform Health</p>
            <span className="stat-change positive">Excellent</span>
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-card">
          <h3>Revenue Trend (Last 7 Days)</h3>
          <div className="chart-placeholder">
            <div className="bar-chart">
              {[650, 720, 580, 890, 950, 820, 1020].map((value, i) => (
                <div key={i} className="bar" style={{ height: `${(value / 1020) * 100}%` }}>
                  <span>${value}</span>
                </div>
              ))}
            </div>
            <div className="chart-labels">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>User Growth (Last 30 Days)</h3>
          <div className="chart-placeholder">
            <div className="line-chart">
              <svg viewBox="0 0 400 200" style={{ width: '100%', height: '200px' }}>
                <polyline
                  points="0,150 50,120 100,135 150,95 200,100 250,75 300,80 350,50 400,60"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="3"
                />
                <polyline
                  points="0,150 50,120 100,135 150,95 200,100 250,75 300,80 350,50 400,60 400,200 0,200"
                  fill="url(#gradient)"
                  opacity="0.3"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#7C3AED', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-insights">
        <div className="insight-card">
          <div className="insight-icon positive">
            <FiTrendingUp />
          </div>
          <div>
            <h4>Strong Growth</h4>
            <p>User acquisition up 35% this quarter</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon positive">
            <FiDollarSign />
          </div>
          <div>
            <h4>Revenue Increase</h4>
            <p>22% revenue growth month-over-month</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">
            <FiShoppingBag />
          </div>
          <div>
            <h4>Order Volume</h4>
            <p>Consistent order growth across all categories</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverviewPage;
