import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, Filter, Download, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../../components/LoadingState';
import {
  extractPrimaryStoreId,
  normalizeStoreOrderStatus,
  orderAmount,
  orderCustomerEmail,
  orderCustomerName,
  orderItemsCount,
} from './storeOrderUtils';
import '../Dashboard/Dashboard.css';

function OrdersList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      const storeId = extractPrimaryStoreId(user);
      if (!storeId) {
        setError('No boutique found for this user');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.getStoreOrders(storeId);
        
        if (response.success) {
          const ordersData = response.data;
          if (Array.isArray(ordersData)) {
            setOrders(ordersData);
          } else if (ordersData?.orders && Array.isArray(ordersData.orders)) {
            setOrders(ordersData.orders);
          } else {
            setOrders([]);
          }
        } else {
          setError(response.message || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      String(order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(orderCustomerName(order)).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(orderCustomerEmail(order)).toLowerCase().includes(searchTerm.toLowerCase());
    const normalizedStatus = normalizeStoreOrderStatus(order.status);
    const matchesStatus = filterStatus === 'all' || normalizedStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => normalizeStoreOrderStatus(o.status) === 'pending').length,
    processing: orders.filter(o => normalizeStoreOrderStatus(o.status) === 'confirmed').length,
    completed: orders.filter(o => normalizeStoreOrderStatus(o.status) === 'confirmed').length,
  };

  const handleStatusChange = async (orderId, action) => {
    try {
      await apiClient.updateStoreOrderAction(orderId, action);
      setOrders(orders.map(o => 
        o._id === orderId
          ? {
              ...o,
              status:
                action === 'confirm'
                  ? 'confirmed'
                  : action === 'reject'
                  ? 'rejected'
                  : 'cancelled',
            }
          : o
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

    const handleCancel = async (orderId) => {
      if (!window.confirm('Cancel this store order?')) return;
    try {
        await apiClient.updateStoreOrderAction(orderId, 'cancel');
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
        console.error('Error cancelling order:', err);
        alert('Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <LoadingState
        title="Loading orders"
        message="Pulling recent order activity and statuses."
        detail="Preparing the complete order list…"
        icon={Filter}
      />
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Orders</h1>
          <p className="page-subtitle">View and manage all customer orders</p>
        </div>
        <button className="btn-primary">
          <Download size={18} />
          Export Orders
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Orders</span>
            <div className="stat-icon pink"><Filter size={20} /></div>
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pending</span>
            <div className="stat-icon warning"><Filter size={20} /></div>
          </div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Processing</span>
            <div className="stat-icon info"><Filter size={20} /></div>
          </div>
          <div className="stat-value">{stats.processing}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Completed</span>
            <div className="stat-icon success"><Filter size={20} /></div>
          </div>
          <div className="stat-value">{stats.completed}</div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-body">
          <div className="filters-bar">
            <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by order ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: '180px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-body">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <Filter size={48} />
              <p>No orders found</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td><strong>{order.orderNumber}</strong></td>
                    <td>{orderCustomerName(order)}</td>
                    <td>{orderCustomerEmail(order)}</td>
                    <td>{orderItemsCount(order)}</td>
                    <td><strong>{formatCurrency(orderAmount(order))}</strong></td>
                    <td>
                      <span className={`status-badge ${normalizeStoreOrderStatus(order.status)}`}>
                        {normalizeStoreOrderStatus(order.status)}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-icon" 
                          title="View Details"
                          onClick={() => navigate(`/orders/${order._id}`)}
                        >
                          <Eye size={16} />
                        </button>
                        {normalizeStoreOrderStatus(order.status) === 'pending' && (
                          <button 
                            className="btn-icon" 
                            title="Accept"
                            onClick={() => handleStatusChange(order._id, 'confirm')}
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                          <button className="btn-icon" title="Cancel" onClick={() => handleCancel(order._id)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersList;
