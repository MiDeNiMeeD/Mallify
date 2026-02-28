import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiEye, FiFileText } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../Boutiques/AllBoutiques.css';

const ApprovalsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBoutiques();
      const pending = response.data?.filter(b => b.status === 'pending' || !b.verified) || [];
      setApplications(pending);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await apiClient.updateBoutiqueStatus(id, 'active');
      setApplications(applications.filter(app => app._id !== id));
    } catch (error) {
      console.error('Error approving boutique:', error);
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this application?')) {
      try {
        await apiClient.updateBoutiqueStatus(id, 'rejected');
        setApplications(applications.filter(app => app._id !== id));
      } catch (error) {
        console.error('Error rejecting boutique:', error);
      }
    }
  };

  if (loading) {
    return <div className="all-boutiques-page"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  }

  return (
    <div className="all-boutiques-page">
      <div className="page-header">
        <div>
          <h1><FiClock /> Boutique Approvals</h1>
          <p>Review and approve pending boutique applications</p>
        </div>
      </div>

      <div className="boutiques-stats">
        <div className="stat-card">
          <FiClock className="stat-icon pending" />
          <div className="stat-details">
            <h3>{applications.length}</h3>
            <p>Pending Applications</p>
          </div>
        </div>
      </div>

      <div className="boutiques-grid">
        {applications.length === 0 ? (
          <div className="no-data">No pending applications</div>
        ) : (
          applications.map(app => (
            <div key={app._id} className="boutique-card">
              <div className="boutique-image">
                {app.logo ? <img src={app.logo} alt={app.name} /> : <div className="placeholder-image"><FiFileText /></div>}
                <span className="status-badge status-pending">Pending Review</span>
              </div>
              <div className="boutique-content">
                <h3>{app.name}</h3>
                <p className="boutique-description">{app.description || 'No description'}</p>
                <div className="boutique-details">
                  <div className="detail-row"><strong>Owner:</strong> {app.ownerId?.name || 'N/A'}</div>
                  <div className="detail-row"><strong>Email:</strong> {app.contactEmail || app.ownerId?.email}</div>
                  <div className="detail-row"><strong>Phone:</strong> {app.contactPhone || 'N/A'}</div>
                  <div className="detail-row"><strong>Applied:</strong> {new Date(app.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="boutique-actions">
                  <button className="btn-approve" onClick={() => handleApprove(app._id)}>
                    <FiCheckCircle /> Approve
                  </button>
                  <button className="btn-suspend" onClick={() => handleReject(app._id)}>
                    <FiXCircle /> Reject
                  </button>
                  <button className="btn-primary" style={{gridColumn: '1 / -1'}}>
                    <FiEye /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalsPage;
