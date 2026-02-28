import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiMail, FiPhone, FiMapPin, FiTag, FiCalendar } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const BoutiqueApprovals = () => {
  const [pendingBoutiques, setPendingBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchPendingBoutiques();
  }, []);

  const fetchPendingBoutiques = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBoutiques({ status: 'pending' });
      setPendingBoutiques(response.data?.boutiques || []);
    } catch (error) {
      console.error('Error fetching pending boutiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (boutiqueId) => {
    try {
      setProcessing(boutiqueId);
      await apiClient.updateBoutique(boutiqueId, { status: 'active', verified: true });
      
      setPendingBoutiques(prev => prev.filter(b => b._id !== boutiqueId));
      
      alert('Boutique approved successfully!');
    } catch (error) {
      console.error('Error approving boutique:', error);
      alert('Error approving boutique. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (boutiqueId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setProcessing(boutiqueId);
      await apiClient.updateBoutique(boutiqueId, { status: 'suspended' });
      
      setPendingBoutiques(prev => prev.filter(b => b._id !== boutiqueId));
      
      alert('Boutique rejected.');
    } catch (error) {
      console.error('Error rejecting boutique:', error);
      alert('Error rejecting boutique. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading pending boutiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Boutique Approvals</h1>
          <p className="page-subtitle">Review and approve pending boutique registrations</p>
        </div>
        <div className="stat-card" style={{ minWidth: '150px', marginBottom: 0 }}>
          <div className="stat-value" style={{ fontSize: '2rem' }}>{pendingBoutiques.length}</div>
          <div className="stat-label">Pending Approvals</div>
        </div>
      </div>

      {pendingBoutiques.length === 0 ? (
        <div className="content-card">
          <div className="card-body">
            <div className="empty-state">
              <FiCheckCircle className="empty-state-icon" />
              <div className="empty-state-title">No Pending Approvals</div>
              <div className="empty-state-text">All boutique applications have been reviewed</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {pendingBoutiques.map((boutique) => (
            <div key={boutique._id} className="content-card">
              <div className="card-header" style={{ borderBottom: 'none', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {boutique.logo ? (
                    <img 
                      src={boutique.logo} 
                      alt={boutique.name} 
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '12px', 
                        objectFit: 'cover' 
                      }} 
                    />
                  ) : (
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, var(--primary-pink), var(--dark-pink))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}>
                      {boutique.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {boutique.name}
                    </h3>
                    <span className="status-badge pending">{boutique.businessType || 'Boutique'}</span>
                  </div>
                </div>
              </div>

              <div className="card-body" style={{ paddingTop: 0 }}>
                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <FiMail size={16} color="var(--text-secondary)" />
                    <span>{boutique.email}</span>
                  </div>
                  
                  {boutique.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <FiPhone size={16} color="var(--text-secondary)" />
                      <span>{boutique.phone}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <FiMapPin size={16} color="var(--text-secondary)" />
                    <span>{boutique.address?.city || 'N/A'}, {boutique.address?.country || 'N/A'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <FiTag size={16} color="var(--text-secondary)" />
                    <span>{boutique.categories?.join(', ') || 'Not specified'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <FiCalendar size={16} color="var(--text-secondary)" />
                    <span>{new Date(boutique.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {boutique.description && (
                  <div style={{ 
                    padding: '1rem', 
                    background: 'var(--bg-primary)', 
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                      Description:
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
                      {boutique.description}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleReject(boutique._id)}
                    disabled={processing === boutique._id}
                    style={{ flex: 1 }}
                  >
                    <FiXCircle size={16} />
                    {processing === boutique._id ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => handleApprove(boutique._id)}
                    disabled={processing === boutique._id}
                    style={{ flex: 1 }}
                  >
                    <FiCheckCircle size={16} />
                    {processing === boutique._id ? 'Processing...' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoutiqueApprovals;
