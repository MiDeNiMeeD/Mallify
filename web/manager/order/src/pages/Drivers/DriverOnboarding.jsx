import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiCheckCircle, FiXCircle, FiClock, FiUser, FiPhone, FiMail, FiFileText } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const DriverOnboarding = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDriverApplications({ limit: 100 });
      setApplications(response || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    if (!window.confirm('Are you sure you want to approve this application?')) return;
    
    try {
      await apiClient.updateApplicationStatus(applicationId, 'approved');
      alert('Application approved successfully');
      fetchApplications();
    } catch (error) {
      alert('Failed to approve application');
    }
  };

  const handleReject = async (applicationId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    
    try {
      await apiClient.updateApplicationStatus(applicationId, 'rejected');
      alert('Application rejected');
      fetchApplications();
    } catch (error) {
      alert('Failed to reject application');
    }
  };

  const filteredApplications = filterStatus === 'all' 
    ? applications 
    : applications.filter(a => a.status === filterStatus);

  const stats = [
    { label: 'Total Applications', value: applications.length, icon: FiFileText, color: 'info' },
    { label: 'Pending Review', value: applications.filter(a => a.status === 'pending').length, icon: FiClock, color: 'warning' },
    { label: 'Approved', value: applications.filter(a => a.status === 'approved').length, icon: FiCheckCircle, color: 'success' },
    { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, icon: FiXCircle, color: 'danger' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'under_review': return 'info';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Driver Onboarding</h1>
          <p className="page-subtitle">Review and approve new driver applications</p>
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
      <div className="tabs">
        <div className={`tab ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
          All Applications
        </div>
        <div className={`tab ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>
          Pending
        </div>
        <div className={`tab ${filterStatus === 'approved' ? 'active' : ''}`} onClick={() => setFilterStatus('approved')}>
          Approved
        </div>
        <div className={`tab ${filterStatus === 'rejected' ? 'active' : ''}`} onClick={() => setFilterStatus('rejected')}>
          Rejected
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="content-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiUserPlus />
            </div>
            <div className="empty-state-title">No Applications Found</div>
            <p>There are no driver applications matching the selected filter.</p>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {filteredApplications.map((application) => (
            <div key={application._id} className="content-card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h3 className="card-title">{application.fullName || 'N/A'}</h3>
                  <span className={`badge ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiPhone size={16} style={{ color: 'var(--text-secondary)' }} />
                    <span>{application.phone || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiMail size={16} style={{ color: 'var(--text-secondary)' }} />
                    <span>{application.email || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiUser size={16} style={{ color: 'var(--text-secondary)' }} />
                    <span>CIN: {application.cinNumber || 'N/A'}</span>
                  </div>
                  {application.licenseNumber && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiFileText size={16} style={{ color: 'var(--text-secondary)' }} />
                      <span>License: {application.licenseNumber}</span>
                    </div>
                  )}
                  {application.vehicleType && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--light-bg)', borderRadius: '4px' }}>
                      <strong>Vehicle:</strong> {application.vehicleType}
                      {application.vehicleModel && ` - ${application.vehicleModel}`}
                      {application.vehicleYear && ` (${application.vehicleYear})`}
                    </div>
                  )}
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Applied: {new Date(application.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {application.status === 'pending' && (
                <div className="card-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn-danger btn-sm"
                    onClick={() => handleReject(application._id)}
                  >
                    <FiXCircle size={16} />
                    Reject
                  </button>
                  <button 
                    className="btn-success btn-sm"
                    onClick={() => handleApprove(application._id)}
                  >
                    <FiCheckCircle size={16} />
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverOnboarding;
