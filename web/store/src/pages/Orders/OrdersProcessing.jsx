import React, { useState, useEffect } from 'react';
import { Truck, Package, Eye } from 'lucide-react';
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

function OrdersProcessing() {
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
        const response = await apiClient.getStoreOrders(storeId, { status: 'confirmed' });
        if (response.success) {
          const data = response.data;
          if (Array.isArray(data)) setOrders(data);
          else if (data?.orders && Array.isArray(data.orders)) setOrders(data.orders);
          else setOrders([]);
        } else {
          setError(response.message || 'Failed to fetch processing orders');
        }
      } catch (err) {
        console.error('Error fetching processing orders:', err);
        setError(err.message || 'Failed to load processing orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleMarkAsShipped = async (orderId) => {
    try {
      await apiClient.updateStoreOrderAction(orderId, 'cancel');
      setOrders((prev) => prev.filter(o => o._id !== orderId));
    } catch (err) {
      console.error('Error marking as shipped:', err);
      alert('Failed to update order');
    }
  };

  if (loading) {
    return (
      <LoadingState
        title="Loading processing orders"
        message="Fetching orders currently being prepared."
        detail="Preparing processing list…"
        icon={Package}
      />
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Processing Orders</h1>
          <p className="page-subtitle">Orders currently being prepared for shipment</p>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} style={{ color: 'var(--info-color)' }} />
            <h2 className="card-title">{orders.length} Orders in Progress</h2>
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
                  <th>Payment</th>
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
                    <td>{order.paymentStatus || 'N/A'}</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" title="View Details">
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Cancel this store order"
                          onClick={() => handleMarkAsShipped(order._id)}
                          style={{ color: 'var(--success-color)' }}
                        >
                          <Truck size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">No Orders Being Processed</div>
              <p>Check pending orders to start processing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersProcessing;
