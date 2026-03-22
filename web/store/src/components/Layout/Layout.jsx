import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { applicationInfo, applicationLoading, refreshApplicationStatus, logout } = useAuth();

  const applicationStatus = applicationInfo?.status || null;
  const isStoreBlocked = applicationStatus && applicationStatus !== 'approved';
  const isPendingStatus = applicationStatus === 'pending' || applicationStatus === 'under_review';
  const overlayTitle = isPendingStatus ? 'Store Review In Progress' : 'Store Access Restricted';
  const overlayMessage = isPendingStatus
    ? 'Your boutique application is still pending approval. You can explore the dashboard once the Mallify team completes the review.'
    : 'Your boutique application is not approved yet. Please contact support for more information or wait for an update.';
  const submittedAt = applicationInfo?.submittedAt
    ? new Date(applicationInfo.submittedAt).toLocaleString()
    : null;

  return (
    <div className={`layout ${isStoreBlocked ? 'layout--blocked' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className={`main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />
        <main className="main-content">
          {children}
        </main>
      </div>

      {isStoreBlocked && (
        <div className="layout-overlay" role="dialog" aria-live="assertive" aria-label="Boutique application status">
          <div className="pending-modal">
            <div className="pending-status-pill">
              {applicationStatus?.replace(/_/g, ' ') || 'pending'}
            </div>
            <h2>{overlayTitle}</h2>
            <p>{overlayMessage}</p>
            {submittedAt && (
              <p className="pending-meta">Submitted on {submittedAt}</p>
            )}
            <div className="pending-actions">
              <button
                type="button"
                className="pending-btn"
                onClick={refreshApplicationStatus}
                disabled={applicationLoading}
              >
                {applicationLoading ? 'Checking status…' : 'Refresh status'}
              </button>
              <button
                type="button"
                className="pending-btn pending-btn--ghost"
                onClick={logout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
