import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import LoadingState from '../../components/LoadingState';
import { extractPrimaryStoreId, orderAmount, orderCustomerName } from './storeOrderUtils';
import './Orders.css';
import '../Dashboard/Dashboard.css';

function OrdersReturns() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchReturns = async () => {
      const storeId = extractPrimaryStoreId(user);
      if (!storeId) {
        setError('No boutique found for this user');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [rejectedRes, cancelledRes] = await Promise.all([
          apiClient.getStoreOrders(storeId, { status: 'rejected' }),
          apiClient.getStoreOrders(storeId, { status: 'cancelled' }),
        ]);

        const rejected = Array.isArray(rejectedRes?.data?.orders)
          ? rejectedRes.data.orders
          : Array.isArray(rejectedRes?.data)
          ? rejectedRes.data
          : [];
        const cancelled = Array.isArray(cancelledRes?.data?.orders)
          ? cancelledRes.data.orders
          : Array.isArray(cancelledRes?.data)
          ? cancelledRes.data
          : [];

        setRequests([...rejected, ...cancelled]);
      } catch (err) {
        console.error('Error fetching returns:', err);
        setError(err.message || 'Failed to load return requests');
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [user]);

  const formatCurrency = (amount) => {
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(amount) || 0)} DT`;
  };

  const handleApprove = async (requestId) => {
    try {
      await apiClient.updateStoreOrderAction(requestId, 'confirm');
      setRequests(requests.filter(r => r._id !== requestId));
    } catch (err) {
      console.error('Error approving return:', err);
      alert('Failed to approve return');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await apiClient.updateStoreOrderAction(requestId, 'reject');
      setRequests(requests.map(r => r._id === requestId ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      console.error('Error rejecting return:', err);
      alert('Failed to reject return');
    }
  };

  if (loading) {
    return (
      <LoadingState
        title="Loading returns"
        message="Fetching customer return requests."
        detail="Preparing returns list…"
        icon={RotateCcw}
      />
    );
  }

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="dashboard-page orders-page">
      <div className="page-header">
        <div>
          <div className="orders-eyebrow">Returns Desk</div>
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
              {requests.map((request) => (
                <tr key={request._id}>
                  <td><strong>{request._id}</strong></td>
                  <td>{request.orderNumber}</td>
                  <td>{request.customer || orderCustomerName(request) || 'N/A'}</td>
                  <td>{request.product || (request.items && request.items[0]?.name) || '—'}</td>
                  <td>{request.reason || '—'}</td>
                  <td><strong>{formatCurrency(orderAmount(request))}</strong></td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
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
                          <button className="btn-icon" title="Approve" style={{ color: 'var(--success-color)' }} onClick={() => handleApprove(request._id)}>
                            <CheckCircle size={16} />
                          </button>
                          <button className="btn-icon" title="Reject" style={{ color: 'var(--danger-color)' }} onClick={() => handleReject(request._id)}>
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

export default OrdersReturns;
