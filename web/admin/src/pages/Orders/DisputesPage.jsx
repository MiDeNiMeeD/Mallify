import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiMessageCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../Orders/AllOrdersPage.css';

const DisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      // Using getOrders as placeholder - in real app would use getDisputes
      const response = await apiClient.getOrders();
      const disputedOrders = response.data?.filter(o => o.disputed || o.status === 'disputed') || [];
      setDisputes(disputedOrders);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (id, resolution) => {
    try {
      await apiClient.updateOrderStatus(id, resolution === 'approve' ? 'delivered' : 'cancelled');
      setDisputes(disputes.filter(d => d._id !== id));
    } catch (error) {
      console.error('Error resolving dispute:', error);
    }
  };

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => !d.resolved).length,
    resolved: disputes.filter(d => d.resolved).length,
  };

  if (loading) {
    return <div className="all-orders-page"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  }

  return (
    <div className="all-orders-page disputes-page">
      <div className="page-header">
        <div>
          <h1><FiAlertTriangle /> Order Disputes</h1>
          <p>Manage and resolve customer disputes</p>
        </div>
      </div>

      <div className="orders-stats">
        <div className="stat-card">
          <FiAlertTriangle className="stat-icon pending" />
          <div className="stat-details">
            <h3>{stats.total}</h3>
            <p>Total Disputes</p>
          </div>
        </div>
        <div className="stat-card">
          <FiMessageCircle className="stat-icon processing" />
          <div className="stat-details">
            <h3>{stats.open}</h3>
            <p>Open</p>
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

      <div className="tracking-grid">
        {disputes.length === 0 ? (
          <div className="no-data">No disputes found</div>
        ) : (
          disputes.map(dispute => (
            <div key={dispute._id} className="tracking-card dispute-card">
              <div className="tracking-header">
                <div className="tracking-icon" style={{ background: '#EF4444' }}>
                  <FiAlertTriangle />
                </div>
                <div>
                  <h3>Order #{dispute.orderNumber}</h3>
                  <span className="tracking-status" style={{ color: '#EF4444' }}>
                    Disputed
                  </span>
                </div>
              </div>
              <div className="tracking-details">
                <div className="detail-row">
                  <strong>Customer:</strong> {dispute.userId?.name || 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Boutique:</strong> {dispute.boutiqueId?.name || 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Reason:</strong> {dispute.disputeReason || 'Not specified'}
                </div>
                <div className="detail-row">
                  <strong>Amount:</strong> ${(dispute.totalAmount || 0).toFixed(2)}
                </div>
                <div className="detail-row">
                  <strong>Filed:</strong> {new Date(dispute.disputeDate || dispute.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="dispute-actions">
                <button 
                  className="btn-approve"
                  onClick={() => handleResolveDispute(dispute._id, 'approve')}
                >
                  <FiCheckCircle /> Approve Refund
                </button>
                <button 
                  className="btn-suspend"
                  onClick={() => handleResolveDispute(dispute._id, 'reject')}
                >
                  <FiXCircle /> Reject
                </button>
                <button className="btn-primary" style={{gridColumn: '1 / -1'}}>
                  <FiMessageCircle /> View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DisputesPage;
