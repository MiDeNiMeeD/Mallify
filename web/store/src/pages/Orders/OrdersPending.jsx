import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Eye, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import LoadingState from '../../components/LoadingState';
import {
  extractPrimaryStoreId,
  orderAmount,
  orderCustomerEmail,
  orderCustomerName,
  orderItemsCount,
} from './storeOrderUtils';
import '../Dashboard/Dashboard.css';

function OrdersPending() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

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
        const response = await apiClient.getStoreOrders(storeId, { status: 'pending' });
        if (response.success) {
          const data = response.data;
          if (Array.isArray(data)) setOrders(data);
          else if (data?.orders && Array.isArray(data.orders)) setOrders(data.orders);
          else setOrders([]);
        } else {
          setError(response.message || 'Failed to fetch pending orders');
        }
      } catch (err) {
        console.error('Error fetching pending orders:', err);
        setError(err.message || 'Failed to load pending orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleAccept = async (orderId) => {
    try {
      await apiClient.updateStoreOrderAction(orderId, 'confirm');
      setOrders((prev) => prev.filter(o => o._id !== orderId));
    } catch (err) {
      console.error('Error accepting order:', err);
      alert('Failed to accept order');
    }
  };

  const handleReject = async (orderId) => {
    try {
      await apiClient.updateStoreOrderAction(orderId, 'reject');
      setOrders((prev) => prev.filter(o => o._id !== orderId));
    } catch (err) {
      console.error('Error rejecting order:', err);
      alert('Failed to reject order');
    }
  };

  if (loading) {
    return (
      <LoadingState
        title="Loading pending orders"
        message="Fetching orders awaiting confirmation."
        detail="Preparing pending list…"
        icon={AlertCircle}
      />
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pending Orders</h1>
          <p className="page-subtitle">Orders awaiting your acceptance</p>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} style={{ color: 'var(--warning-color)' }} />
            <h2 className="card-title">{orders.length} Pending Orders</h2>
          </div>
        </div>
        <div className="card-body">
          {orders.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td><strong>{order.orderNumber}</strong></td>
                    <td>{orderCustomerName(order)}</td>
                    <td>{orderCustomerEmail(order)}</td>
                    <td>{orderItemsCount(order)}</td>
                    <td><strong>{formatCurrency(orderAmount(order))}</strong></td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" title="View">
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Accept Order"
                          onClick={() => handleAccept(order._id)}
                          style={{ color: 'var(--success-color)' }}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Reject Order"
                          onClick={() => handleReject(order._id)}
                          style={{ color: 'var(--danger-color)' }}
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-title">No Pending Orders</div>
              <p>All orders have been processed!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersPending;
