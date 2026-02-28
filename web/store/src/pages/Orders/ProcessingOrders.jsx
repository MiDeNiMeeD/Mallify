import React from 'react';
import { Truck, Package, Eye } from 'lucide-react';
import { allOrders } from '../../data/mockData';
import '../Dashboard/Dashboard.css';

function ProcessingOrders() {
  const processingOrders = allOrders.filter(order => order.status === 'processing');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleMarkAsShipped = (orderId) => {
    alert(`Order ${orderId} marked as shipped!`);
  };

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
            <h2 className="card-title">{processingOrders.length} Orders in Progress</h2>
          </div>
        </div>
        <div className="card-body">
          {processingOrders.length > 0 ? (
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
                {processingOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.customer}</td>
                    <td>{order.email}</td>
                    <td>{order.items}</td>
                    <td><strong>{formatCurrency(order.total)}</strong></td>
                    <td>{order.payment}</td>
                    <td>{new Date(order.date).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" title="View Details">
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Mark as Shipped"
                          onClick={() => handleMarkAsShipped(order.id)}
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

export default ProcessingOrders;
