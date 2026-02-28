import React, { useState, useEffect } from 'react';
import { FiBell, FiMail, FiSmartphone, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const NotificationsManager = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getNotifications({ limit: 100 });
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, status: 'read' } : n
      ));
    } catch (error) {
      alert('Failed to mark as read');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const typeMatch = filterType === 'all' || n.type === filterType;
    const statusMatch = filterStatus === 'all' || n.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const stats = [
    { label: 'Total Notifications', value: notifications.length, icon: FiBell, color: 'info' },
    { label: 'Unread', value: notifications.filter(n => n.status !== 'read').length, icon: FiAlertCircle, color: 'warning' },
    { label: 'Delivered', value: notifications.filter(n => n.status === 'delivered' || n.status === 'read').length, icon: FiCheckCircle, color: 'success' },
    { label: 'Pending', value: notifications.filter(n => n.status === 'pending').length, icon: FiClock, color: 'orange' }
  ];

  const getTypeIcon = (type) => {
    switch(type) {
      case 'email': return FiMail;
      case 'sms': return FiSmartphone;
      case 'push': return FiBell;
      case 'in_app': return FiAlertCircle;
      default: return FiBell;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'sent': return 'info';
      case 'delivered': return 'success';
      case 'read': return 'secondary';
      case 'failed': return 'danger';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Manage system notifications and alerts</p>
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
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
              <option value="in_app">In-App</option>
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
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="read">Read</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="content-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiBell />
            </div>
            <div className="empty-state-title">No Notifications Found</div>
            <p>There are no notifications matching the selected filters.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredNotifications.map((notification) => {
            const TypeIcon = getTypeIcon(notification.type);
            return (
              <div key={notification._id} className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1, display: 'flex', gap: '1rem' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '8px', 
                      backgroundColor: 'var(--light-bg)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <TypeIcon size={24} style={{ color: 'var(--primary-color)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        {notification.subject && (
                          <h3 style={{ margin: 0 }}>{notification.subject}</h3>
                        )}
                        <span className={`badge ${notification.type}`}>
                          {notification.type}
                        </span>
                        <span className={`badge ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                        <span className={`badge ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                      <p style={{ margin: '0.5rem 0', color: 'var(--text-primary)' }}>
                        {notification.message}
                      </p>
                      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <span><strong>User:</strong> {notification.userId?.name || 'N/A'}</span>
                        <span><strong>Channel:</strong> {notification.channel}</span>
                        {notification.recipientEmail && (
                          <span><strong>To:</strong> {notification.recipientEmail}</span>
                        )}
                        {notification.recipientPhone && (
                          <span><strong>To:</strong> {notification.recipientPhone}</span>
                        )}
                        <span><strong>Created:</strong> {new Date(notification.createdAt).toLocaleString()}</span>
                        {notification.sentAt && (
                          <span><strong>Sent:</strong> {new Date(notification.sentAt).toLocaleString()}</span>
                        )}
                      </div>
                      {notification.failureReason && (
                        <div style={{ 
                          marginTop: '0.75rem', 
                          padding: '0.75rem', 
                          backgroundColor: 'var(--danger-light)', 
                          borderRadius: '4px',
                          color: 'var(--danger-color)'
                        }}>
                          <strong>Failure Reason:</strong> {notification.failureReason}
                        </div>
                      )}
                    </div>
                  </div>
                  {notification.status !== 'read' && (
                    <button 
                      className="btn-secondary btn-sm"
                      onClick={() => handleMarkAsRead(notification._id)}
                      style={{ flexShrink: 0 }}
                    >
                      <FiCheckCircle size={16} />
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsManager;
