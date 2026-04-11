import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import apiClient from '../../api/apiClient';
import '../Dashboard/Dashboard.css';

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Invalid order id');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await apiClient.getOrderById(orderId);
        if (res && res.success) {
          setOrder(res.data || res);
        } else {
          setError(res?.message || 'Order not found');
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleChangeStatus = async (newStatus) => {
    if (!order) return;
    try {
      const action =
        newStatus === 'confirmed' ? 'confirm' : newStatus === 'rejected' ? 'reject' : 'cancel';
      await apiClient.updateStoreOrderAction(order._id || order.id, action);
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      console.error('Error updating status', err);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <LoadingState
        title="Loading order"
        message="Fetching order details…"
        detail="Retrieving order and customer information."
        icon={Loader2}
      />
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Order</h1>
            <p className="page-subtitle">Order details</p>
          </div>
          <div>
            <button className="btn-secondary" onClick={() => navigate('/orders')}>Back</button>
          </div>
        </div>

        <div className="content-card">
          <div className="card-body">
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span style={{ marginLeft: 8 }}>{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Order #{order.orderNumber || orderId}</h1>
          <p className="page-subtitle">Store segment details and actions for this order</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/orders')}>Back</button>
      </div>

      <div className="content-card">
        <div className="card-body">
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h3>Customer</h3>
              <p><strong>{order.userId?.name || order.customerName || 'N/A'}</strong></p>
              <p>{order.userId?.email || order.customerEmail || 'N/A'}</p>

              <h3 style={{ marginTop: '1rem' }}>Shipping</h3>
              <p>{order.shippingAddress ? `${order.shippingAddress.street || order.shippingAddress.address || ''}, ${order.shippingAddress.city || ''}` : 'No shipping info'}</p>
            </div>

            <div style={{ width: 320 }}>
              <h3>Summary</h3>
              <p><strong>Status:</strong> <span className={`status-badge ${order.status}`}>{order.status}</span></p>
              <p><strong>Total:</strong> ${(Number(order.payableTotal || order.total || order.totalAmount || 0)).toFixed(2)}</p>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {order.status !== 'confirmed' && (
                  <button className="btn-primary" onClick={() => handleChangeStatus('confirmed')}>
                    <CheckCircle size={16} /> Confirm
                  </button>
                )}
                {order.status !== 'rejected' && (
                  <button className="btn-secondary" onClick={() => handleChangeStatus('rejected')}>
                    <XCircle size={16} /> Reject
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3>Items</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((it) => (
                  <tr key={it._id || it.id || `${it.productId}-${Math.random()}`}>
                    <td>{it.productName || it.name || 'Item'}</td>
                    <td>{it.quantity || it.qty || 1}</td>
                    <td>${(it.price || it.unitPrice || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
