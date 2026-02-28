import React, { useState, useEffect } from 'react';
import { FiSearch, FiShoppingBag, FiTrendingUp, FiClock, FiCheckCircle, FiEye } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import './AllOrdersPage.css';

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pending', class: 'status-pending' },
      processing: { label: 'Processing', class: 'status-processing' },
      shipped: { label: 'Shipped', class: 'status-shipped' },
      delivered: { label: 'Delivered', class: 'status-delivered' },
      cancelled: { label: 'Cancelled', class: 'status-cancelled' },
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="all-orders-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-orders-page">
      <div className="page-header">
        <div>
          <h1><FiShoppingBag /> All Orders</h1>
          <p>Monitor and manage all platform orders</p>
        </div>
      </div>

      <div className="orders-stats">
        <div className="stat-card">
          <FiShoppingBag className="stat-icon" />
          <div className="stat-details">
            <h3>{stats.total}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <FiClock className="stat-icon pending" />
          <div className="stat-details">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <FiTrendingUp className="stat-icon processing" />
          <div className="stat-details">
            <h3>{stats.processing}</h3>
            <p>Processing</p>
          </div>
        </div>
        <div className="stat-card">
          <FiCheckCircle className="stat-icon delivered" />
          <div className="stat-details">
            <h3>{stats.delivered}</h3>
            <p>Delivered</p>
          </div>
        </div>
        <div className="stat-card">
          <FiTrendingUp className="stat-icon revenue" />
          <div className="stat-details">
            <h3>${(stats.revenue / 1000).toFixed(1)}K</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="orders-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Boutique</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const statusBadge = getStatusBadge(order.status);
                return (
                  <tr key={order._id}>
                    <td className="order-id">{order.orderNumber}</td>
                    <td>{order.userId?.name || 'N/A'}</td>
                    <td>{order.boutiqueId?.name || 'Multiple'}</td>
                    <td className="amount">${(order.totalAmount || 0).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-action" title="View Details">
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllOrdersPage;
