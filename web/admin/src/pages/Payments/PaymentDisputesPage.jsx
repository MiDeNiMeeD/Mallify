import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiDollarSign, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import './TransactionsPage.css';

const PaymentDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const ordersResponse = await apiClient.getOrders();
      // Mock disputes - in real app would filter for payment-related disputes
      const mockDisputes = ordersResponse.data?.slice(0, 5).map((o, i) => ({
        ...o,
        disputeType: 'payment',
        disputeReason: ['Unauthorized charge', 'Incorrect amount', 'Double charge', 'Not received'][i % 4],
        status: ['open', 'investigating', 'resolved'][i % 3],
      })) || [];
      setDisputes(mockDisputes);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, resolution) => {
    try {
      setDisputes(disputes.filter(d => d._id !== id));
    } catch (error) {
      console.error('Error resolving dispute:', error);
    }
  };

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    investigating: disputes.filter(d => d.status === 'investigating').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
  };

  if (loading) {
    return <div className="transactions-page"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  }

  return (
    <div className="transactions-page payment-disputes-page">
      <div className="page-header">
        <div>
          <h1><FiAlertTriangle /> Payment Disputes</h1>
          <p>Resolve payment-related disputes</p>
        </div>
      </div>

      <div className="transactions-stats">
        <div className="stat-card">
          <FiAlertTriangle className="stat-icon pending" />
          <div className="stat-details">
            <h3>{stats.total}</h3>
            <p>Total Disputes</p>
          </div>
        </div>
        <div className="stat-card">
          <FiAlertTriangle className="stat-icon" style={{ background: '#EF4444' }} />
          <div className="stat-details">
            <h3>{stats.open}</h3>
            <p>Open</p>
          </div>
        </div>
        <div className="stat-card">
          <FiDollarSign className="stat-icon revenue" />
          <div className="stat-details">
            <h3>{stats.investigating}</h3>
            <p>Investigating</p>
          </div>
        </div>
        <div className="stat-card">
          <FiCheckCircle className="stat-icon delivered" />
          <div className="stat-details">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>

      <div className="disputes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {disputes.map(dispute => (
          <div key={dispute._id} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: '#EF4444', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FiAlertTriangle />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Order #{dispute.orderNumber}</h3>
                <span className={`status-badge ${dispute.status === 'resolved' ? 'status-delivered' : 'status-pending'}`}>
                  {dispute.status}
                </span>
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.5rem 0', color: '#6B7280' }}>
                <strong>Customer:</strong> {dispute.userId?.name || 'N/A'}
              </div>
              <div style={{ padding: '0.5rem 0', color: '#6B7280' }}>
                <strong>Reason:</strong> {dispute.disputeReason}
              </div>
              <div style={{ padding: '0.5rem 0', color: '#6B7280' }}>
                <strong>Amount:</strong> ${(dispute.totalAmount || 0).toFixed(2)}
              </div>
              <div style={{ padding: '0.5rem 0', color: '#6B7280' }}>
                <strong>Filed:</strong> {new Date(dispute.createdAt).toLocaleDateString()}
              </div>
            </div>
            {dispute.status !== 'resolved' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button 
                  onClick={() => handleResolve(dispute._id, 'refund')}
                  style={{
                    padding: '0.75rem',
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FiCheckCircle /> Refund
                </button>
                <button 
                  onClick={() => handleResolve(dispute._id, 'reject')}
                  style={{
                    padding: '0.75rem',
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FiXCircle /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentDisputesPage;
