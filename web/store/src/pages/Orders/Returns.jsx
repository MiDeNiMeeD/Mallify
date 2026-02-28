import React from 'react';
import { RotateCcw, CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import '../Dashboard/Dashboard.css';

function Returns() {
  const returnRequests = [
    { id: 'RET-001', orderId: 'ORD-004', customer: 'James Wilson', product: 'Casual White Sneakers', reason: 'Wrong size', amount: 79.99, status: 'pending', date: '2026-02-13' },
    { id: 'RET-002', orderId: 'ORD-008', customer: 'David Brown', product: 'Leather Crossbody Bag', reason: 'Defective item', amount: 65.00, status: 'approved', date: '2026-02-12' },
    { id: 'RET-003', orderId: 'ORD-003', customer: 'Emily Davis', product: 'Summer Floral Dress', reason: 'Changed mind', amount: 89.99, status: 'rejected', date: '2026-02-11' },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const stats = {
    pending: returnRequests.filter(r => r.status === 'pending').length,
    approved: returnRequests.filter(r => r.status === 'approved').length,
    rejected: returnRequests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Returns & Refunds</h1>
          <p className="page-subtitle">Manage customer return requests and refunds</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pending</span>
            <div className="stat-icon warning"><AlertTriangle size={20} /></div>
          </div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Approved</span>
            <div className="stat-icon success"><CheckCircle size={20} /></div>
          </div>
          <div className="stat-value">{stats.approved}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Rejected</span>
            <div className="stat-icon pink"><XCircle size={20} /></div>
          </div>
          <div className="stat-value">{stats.rejected}</div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RotateCcw size={20} />
            <h2 className="card-title">Return Requests</h2>
          </div>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Reason</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returnRequests.map((request) => (
                <tr key={request.id}>
                  <td><strong>{request.id}</strong></td>
                  <td>{request.orderId}</td>
                  <td>{request.customer}</td>
                  <td>{request.product}</td>
                  <td>{request.reason}</td>
                  <td><strong>{formatCurrency(request.amount)}</strong></td>
                  <td>{new Date(request.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${request.status}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon" title="View">
                        <Eye size={16} />
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button className="btn-icon" title="Approve" style={{ color: 'var(--success-color)' }}>
                            <CheckCircle size={16} />
                          </button>
                          <button className="btn-icon" title="Reject" style={{ color: 'var(--danger-color)' }}>
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Returns;
