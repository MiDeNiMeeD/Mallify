import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiClock, FiPackage } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const DeliveryIssues = () => {
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDisputes({ limit: 100 });
      setDisputes(response.disputes || []);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId) => {
    const action = prompt('Resolution action (refund/replacement/compensation/no_action):');
    if (!action) return;
    
    const description = prompt('Resolution description:');
    if (!description) return;

    try {
      await apiClient.resolveDispute(disputeId, {
        action,
        description,
        resolvedBy: 'Manager'
      });
      alert('Dispute resolved successfully');
      fetchDisputes();
    } catch (error) {
      alert('Failed to resolve dispute');
    }
  };

  const handleUpdateStatus = async (disputeId, newStatus) => {
    try {
      await apiClient.updateDisputeStatus(disputeId, newStatus);
      alert('Status updated successfully');
      fetchDisputes();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const filteredDisputes = disputes.filter(d => {
    const typeMatch = filterType === 'all' || d.type === filterType;
    const statusMatch = filterStatus === 'all' || d.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const stats = [
    { label: 'Total Issues', value: disputes.length, icon: FiAlertCircle, color: 'info' },
    { label: 'Open', value: disputes.filter(d => d.status === 'open').length, icon: FiAlertTriangle, color: 'warning' },
    { label: 'In Progress', value: disputes.filter(d => d.status === 'investigating').length, icon: FiClock, color: 'orange' },
    { label: 'Resolved', value: disputes.filter(d => d.status === 'resolved').length, icon: FiCheckCircle, color: 'success' }
  ];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'orange';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'warning';
      case 'investigating': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'secondary';
      case 'escalated': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading issues...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery Issues</h1>
          <p className="page-subtitle">Track and resolve delivery-related issues and disputes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">{stat.label}</span>
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon />
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="content-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Filter by Type</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            >
              <option value="all">All Types</option>
              <option value="delivery_issue">Delivery Issue</option>
              <option value="order_issue">Order Issue</option>
              <option value="product_quality">Product Quality</option>
              <option value="refund_request">Refund Request</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Filter by Status</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {filteredDisputes.length === 0 ? (
        <div className="content-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiPackage />
            </div>
            <div className="empty-state-title">No Issues Found</div>
            <p>There are no delivery issues or disputes at this time.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredDisputes.map((dispute) => (
            <div key={dispute._id} className="content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>{dispute.subject}</h3>
                    <span className={`badge ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority}
                    </span>
                    <span className={`badge ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                    Dispute #{dispute.disputeNumber} • {dispute.type.replace('_', ' ')}
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>{dispute.description}</p>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span><strong>Customer:</strong> {dispute.userId?.name || 'N/A'}</span>
                    <span><strong>Order:</strong> {dispute.orderId?.orderNumber || 'N/A'}</span>
                    <span><strong>Created:</strong> {new Date(dispute.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {dispute.status === 'open' && (
                    <button 
                      className="btn-secondary btn-sm"
                      onClick={() => handleUpdateStatus(dispute._id, 'investigating')}
                    >
                      Investigate
                    </button>
                  )}
                  {dispute.status === 'investigating' && (
                    <button 
                      className="btn-primary btn-sm"
                      onClick={() => handleResolve(dispute._id)}
                    >
                      Resolve
                    </button>
                  )}
                  {dispute.status === 'open' && (
                    <button 
                      className="btn-danger btn-sm"
                      onClick={() => handleUpdateStatus(dispute._id, 'escalated')}
                    >
                      Escalate
                    </button>
                  )}
                </div>
              </div>
              {dispute.resolution && (
                <div style={{ padding: '1rem', backgroundColor: 'var(--success-light)', borderRadius: '4px', marginTop: '1rem' }}>
                  <strong style={{ color: 'var(--success-color)' }}>Resolution:</strong>
                  <p style={{ margin: '0.5rem 0 0 0' }}>{dispute.resolution.description}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                    Action: {dispute.resolution.action} • Resolved by: {dispute.resolution.resolvedBy}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryIssues;
