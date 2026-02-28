import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { allOrders } from '../../data/mockData';
import '../Dashboard/Dashboard.css';

function OrdersPending() {
  const pendingOrders = allOrders.filter(order => order.status === 'pending');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleAccept = (orderId) => {
    alert(`Order ${orderId} accepted!`);
  };

  const handleReject = (orderId) => {
    alert(`Order ${orderId} rejected!`);
  };

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
            <h2 className="card-title">{pendingOrders.length} Pending Orders</h2>
          </div>
        </div>
        <div className="card-body">
          {pendingOrders.length > 0 ? (
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
                {pendingOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.customer}</td>
                    <td>{order.email}</td>
                    <td>{order.items}</td>
                    <td><strong>{formatCurrency(order.total)}</strong></td>
                    <td>{new Date(order.date).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" title="View">
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Accept Order"
                          onClick={() => handleAccept(order.id)}
                          style={{ color: 'var(--success-color)' }}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Reject Order"
                          onClick={() => handleReject(order.id)}
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
