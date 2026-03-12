import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiMail, FiPhone, FiMapPin, FiCalendar, 
  FiCheckCircle, FiXCircle, FiFileText, FiUser, FiTag,
  FiShoppingBag, FiDollarSign, FiPackage, FiClock, FiDownload, FiX
} from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';
import '../../styles/Dashboard.css';

const BoutiqueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isApplication, setIsApplication] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentName, setDocumentName] = useState('');
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'default',
    confirmText: 'Confirm',
    onConfirm: () => {},
    showInput: false,
    inputPlaceholder: '',
    inputRequired: false
  });

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  const showConfirmModal = (options) => {
    setConfirmModal({
      show: true,
      title: options.title || 'Confirm Action',
      message: options.message || '',
      type: options.type || 'default',
      confirmText: options.confirmText || 'Confirm',
      onConfirm: options.onConfirm || (() => {}),
      showInput: options.showInput || false,
      inputPlaceholder: options.inputPlaceholder || '',
      inputRequired: options.inputRequired || false
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ ...confirmModal, show: false });
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      
      // Try to fetch as boutique first
      try {
        const response = await apiClient.getBoutiqueById(id);
        setData(response.data);
        setIsApplication(false);
      } catch (err) {
        // If not found, try as application
        const response = await apiClient.getBoutiqueApplicationById(id);
        setData(response.data);
        setIsApplication(true);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      alert('Failed to load details');
      navigate('/boutiques');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    showConfirmModal({
      title: 'Approve Application',
      message: 'Are you sure you want to approve this boutique application? This action will activate the boutique.',
      type: 'success',
      confirmText: 'Approve',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          setProcessing(true);
          
          // Step 1: Send approval email
          showToast('Sending approval email...', 'info');
          const emailResponse = await apiClient.sendApprovalEmail(
            displayData.email,
            displayData.name
          );
          
          if (!emailResponse.success) {
            throw new Error('Failed to send approval email');
          }
          
          showToast('Approval email sent successfully', 'success');
          
          // Step 2: Update application status to approved
          await apiClient.updateBoutiqueApplicationStatus(id, 'approved');
          
          showToast('Application approved successfully!', 'success');
          setTimeout(() => navigate('/boutiques'), 2000);
        } catch (error) {
          console.error('Error approving application:', error);
          showToast(error.message || 'Error approving application. Please try again.', 'error');
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  const handleReject = async () => {
    showConfirmModal({
      title: 'Reject Application',
      message: 'Please provide a reason for rejecting this boutique application:',
      type: 'danger',
      confirmText: 'Reject',
      showInput: true,
      inputPlaceholder: 'Enter rejection reason...',
      inputRequired: true,
      onConfirm: async (reason) => {
        closeConfirmModal();
        try {
          setProcessing(true);
          
          // Step 1: Send rejection email
          showToast('Sending rejection email...', 'info');
          const emailResponse = await apiClient.sendRejectionEmail(
            displayData.email,
            displayData.name,
            reason
          );
          
          if (!emailResponse.success) {
            throw new Error('Failed to send rejection email');
          }
          
          showToast('Rejection email sent successfully', 'success');
          
          // Step 2: Delete the application and related data
          await apiClient.deleteBoutiqueApplication(id);
          
          showToast('Application and related data deleted successfully', 'success');
          setTimeout(() => navigate('/boutiques'), 2000);
        } catch (error) {
          console.error('Error rejecting application:', error);
          showToast(error.message || 'Error rejecting application. Please try again.', 'error');
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  const handleStatusChange = async (newStatus) => {
    const statusMessages = {
      active: {
        title: 'Activate Boutique',
        message: 'Are you sure you want to activate this boutique?',
        type: 'success',
        confirmText: 'Activate'
      },
      suspended: {
        title: 'Suspend Boutique',
        message: 'Are you sure you want to suspend this boutique? It will no longer be visible to customers.',
        type: 'danger',
        confirmText: 'Suspend'
      },
      inactive: {
        title: 'Deactivate Boutique',
        message: 'Are you sure you want to deactivate this boutique?',
        type: 'danger',
        confirmText: 'Deactivate'
      }
    };

    const config = statusMessages[newStatus] || {
      title: 'Change Status',
      message: `Are you sure you want to change status to ${newStatus}?`,
      type: 'default',
      confirmText: 'Confirm'
    };

    showConfirmModal({
      ...config,
      onConfirm: async () => {
        closeConfirmModal();
        try {
          setProcessing(true);
          await apiClient.updateBoutique(id, { status: newStatus });
          setData({ ...data, status: newStatus });
          showToast('Status updated successfully!', 'success');
        } catch (error) {
          console.error('Error updating status:', error);
          showToast('Error updating status. Please try again.', 'error');
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleViewDocument = (filename) => {
    const url = `http://localhost:3003/uploads/applications/${filename}`;
    setDocumentUrl(url);
    setDocumentName(filename);
    setShowDocumentModal(true);
  };

  const handleDownloadDocument = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImageFile = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const isPdfFile = (filename) => {
    return filename.toLowerCase().endsWith('.pdf');
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <FiXCircle className="empty-state-icon" />
          <div className="empty-state-title">Not Found</div>
          <div className="empty-state-text">The boutique or application you're looking for doesn't exist</div>
          <button className="btn btn-primary" onClick={() => navigate('/boutiques')}>
            Back to Boutiques
          </button>
        </div>
      </div>
    );
  }

  // Normalize data structure for both boutiques and applications
  const displayData = isApplication ? {
    name: data.boutiqueName,
    email: data.email,
    phone: data.phone,
    ownerName: data.ownerName,
    address: data.address,
    city: data.city,
    description: data.description,
    category: data.category,
    status: data.status,
    createdAt: data.submittedAt || data.createdAt,
    cinDocument: data.cinDocument,
    emailVerified: data.emailVerified,
    // Add default stats for approved applications
    productCount: 0,
    totalSales: 0,
    totalOrders: 0,
    rating: 0,
    reviewCount: 0
  } : {
    name: data.name,
    email: data.email,
    phone: data.phone,
    ownerName: data.ownerName,
    address: typeof data.address === 'object' ? `${data.address.street}, ${data.address.city}, ${data.address.state}, ${data.address.country}` : data.address,
    city: typeof data.address === 'object' ? data.address.city : data.city,
    description: data.description,
    category: data.businessType || data.category,
    status: data.status,
    createdAt: data.createdAt,
    logo: data.logo,
    productCount: data.productCount || 0,
    totalSales: data.totalSales || 0,
    totalOrders: data.totalOrders || 0,
    rating: data.rating,
    reviewCount: data.reviewCount
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/boutiques')}
            style={{ padding: '0.5rem 0.75rem' }}
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">{displayData.name}</h1>
            <p className="page-subtitle">
              {isApplication ? 'Application Details' : 'Boutique Details'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`status-badge ${displayData.status}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
            {displayData.status}
          </span>
         
        </div>
      </div>

      <div className="grid-3">
        {/* Left Column - Main Info */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">Basic Information</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FiShoppingBag size={18} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Boutique Name
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{displayData.name}</div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FiUser size={18} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Owner Name
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{displayData.ownerName || 'N/A'}</div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FiMail size={18} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Email
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    wordBreak: 'break-all',
                    overflowWrap: 'break-word',
                    lineHeight: '1.4'
                  }}>{displayData.email}</div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FiPhone size={18} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Phone
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{displayData.phone || 'N/A'}</div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FiMapPin size={18} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      City
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{displayData.city || 'N/A'}</div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FiTag size={18} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Category
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{displayData.category || 'N/A'}</div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FiCalendar size={18} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {isApplication ? 'Submitted' : 'Created'}
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {new Date(displayData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {isApplication && displayData.emailVerified !== undefined && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FiCheckCircle size={18} color="var(--text-secondary)" />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Email Verified
                      </span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: displayData.emailVerified ? 'var(--success-color)' : 'var(--danger-color)' }}>
                      {displayData.emailVerified ? 'Yes' : 'No'}
                    </div>
                  </div>
                )}
              </div>

              {displayData.address && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FiMapPin size={18} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Full Address
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{displayData.address}</div>
                </div>
              )}

              {displayData.description && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FiFileText size={18} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Description
                    </span>
                  </div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {displayData.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents (for applications) */}
          {isApplication && displayData.cinDocument && (
            <div className="content-card" style={{ marginTop: '1.5rem' }}>
              <div className="card-header">
                <h3 className="card-title">Documents</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <FiFileText size={32} color="#6B7280" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>CIN Document</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {displayData.cinDocument}
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleViewDocument(displayData.cinDocument)}
                  >
                    View Document
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Stats & Actions */}
        <div>
          {/* Statistics (for active boutiques and approved applications) */}
          {((!isApplication && displayData.status !== 'pending') || (isApplication && displayData.status === 'approved')) && (
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">Statistics</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FiPackage size={16} color="#6B7280" />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Products</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{displayData.productCount}</div>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FiDollarSign size={16} color="var(--success-color)" />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Sales</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-color)' }}>
                      {formatCurrency(displayData.totalSales)}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FiShoppingBag size={16} color="#6B7280" />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Orders</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{displayData.totalOrders}</div>
                  </div>

                  {displayData.rating !== undefined && (
                    <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FiCheckCircle size={16} color="var(--warning-color)" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Rating</span>
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {displayData.rating > 0 ? `${displayData.rating.toFixed(1)} ★` : 'New'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {displayData.reviewCount > 0 ? `${displayData.reviewCount} reviews` : 'No reviews yet'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="content-card" style={{ 
            marginTop: ((!isApplication && displayData.status !== 'pending') || (isApplication && displayData.status === 'approved')) ? '1.5rem' : '0' 
          }}>
            <div className="card-header">
              <h3 className="card-title">Actions</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {/* Approved Application Message */}
                {isApplication && displayData.status === 'approved' && (
                  <div style={{
                    padding: '1.25rem',
                    background: '#D1FAE5',
                    border: '1px solid #10B981',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <FiCheckCircle size={32} color="#10B981" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 600, color: '#065F46', marginBottom: '0.5rem' }}>
                      Application Approved
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#047857' }}>
                      This boutique application has been approved and the owner has been notified.
                    </div>
                  </div>
                )}

                {/* Rejected Application Message */}
                {isApplication && displayData.status === 'rejected' && (
                  <div style={{
                    padding: '1.25rem',
                    background: '#FEE2E2',
                    border: '1px solid #DC2626',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <FiXCircle size={32} color="#DC2626" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 600, color: '#991B1B', marginBottom: '0.5rem' }}>
                      Application Rejected
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#B91C1C' }}>
                      This application was rejected and the applicant has been notified.
                    </div>
                  </div>
                )}

                {/* Pending Application Actions */}
                {isApplication && displayData.status === 'pending' && (
                  <>
                    <button 
                      onClick={handleApprove}
                      disabled={processing}
                      style={{ 
                        width: '100%',
                        padding: '0.875rem 1.25rem',
                        background: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: processing ? 'not-allowed' : 'pointer',
                        opacity: processing ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        if (!processing) {
                          e.currentTarget.style.background = '#059669';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.2)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!processing) {
                          e.currentTarget.style.background = '#10B981';
                          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <FiCheckCircle size={18} />
                      {processing ? 'Processing...' : 'Approve Application'}
                    </button>
                    <button 
                      onClick={handleReject}
                      disabled={processing}
                      style={{ 
                        width: '100%',
                        padding: '0.875rem 1.25rem',
                        background: 'white',
                        color: '#DC2626',
                        border: '1.5px solid #DC2626',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: processing ? 'not-allowed' : 'pointer',
                        opacity: processing ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        if (!processing) {
                          e.currentTarget.style.background = '#FEF2F2';
                          e.currentTarget.style.borderColor = '#B91C1C';
                          e.currentTarget.style.color = '#B91C1C';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!processing) {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.borderColor = '#DC2626';
                          e.currentTarget.style.color = '#DC2626';
                        }
                      }}
                    >
                      <FiXCircle size={18} />
                      Reject Application
                    </button>
                  </>
                )}

                {!isApplication && (
                  <>
                    {displayData.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusChange('active')}
                        disabled={processing}
                        style={{ 
                          width: '100%',
                          padding: '0.875rem 1.25rem',
                          background: '#10B981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: processing ? 'not-allowed' : 'pointer',
                          opacity: processing ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          if (!processing) {
                            e.currentTarget.style.background = '#059669';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.2)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!processing) {
                            e.currentTarget.style.background = '#10B981';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <FiCheckCircle size={18} />
                        Activate Boutique
                      </button>
                    )}
                    {displayData.status === 'active' && (
                      <button 
                        onClick={() => handleStatusChange('suspended')}
                        disabled={processing}
                        style={{ 
                          width: '100%',
                          padding: '0.875rem 1.25rem',
                          background: '#F59E0B',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: processing ? 'not-allowed' : 'pointer',
                          opacity: processing ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          if (!processing) {
                            e.currentTarget.style.background = '#D97706';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(245, 158, 11, 0.2)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!processing) {
                            e.currentTarget.style.background = '#F59E0B';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <FiClock size={18} />
                        Suspend Boutique
                      </button>
                    )}
                    {displayData.status === 'suspended' && (
                      <button 
                        onClick={() => handleStatusChange('active')}
                        disabled={processing}
                        style={{ 
                          width: '100%',
                          padding: '0.875rem 1.25rem',
                          background: '#10B981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: processing ? 'not-allowed' : 'pointer',
                          opacity: processing ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          if (!processing) {
                            e.currentTarget.style.background = '#059669';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.2)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!processing) {
                            e.currentTarget.style.background = '#10B981';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <FiCheckCircle size={18} />
                        Reactivate Boutique
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Modal */}
      {showDocumentModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem'
          }}
          onClick={() => setShowDocumentModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>CIN Document</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {documentName}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={handleDownloadDocument}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  <FiDownload size={18} />
                  Download
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowDocumentModal(false)}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5'
            }}>
              {isImageFile(documentName) ? (
                <img 
                  src={documentUrl} 
                  alt="CIN Document" 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
              ) : isPdfFile(documentName) ? (
                <iframe 
                  src={documentUrl}
                  title="CIN Document"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '8px',
                    minHeight: '600px'
                  }}
                />
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem'
                }}>
                  <FiFileText size={64} color="var(--text-secondary)" />
                  <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                    Preview not available for this file type
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleDownloadDocument}
                    style={{ marginTop: '1rem' }}
                  >
                    <FiDownload size={18} />
                    Download to View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal 
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText="Cancel"
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
        showInput={confirmModal.showInput}
        inputPlaceholder={confirmModal.inputPlaceholder}
        inputRequired={confirmModal.inputRequired}
      />

      {/* Toast Notification */}
      <Toast 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
        duration={4000}
      />
    </div>
  );
};

export default BoutiqueDetail;
