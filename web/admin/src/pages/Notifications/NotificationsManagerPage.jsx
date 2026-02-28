import React, { useState } from 'react';
import { FiBell, FiCheck } from 'react-icons/fi';
import '../System/SystemPages.css';

const NotificationsManagerPage = () => {
  const [notifications] = useState([
    { id: 1, title: 'New Boutique Application', message: 'Fashion Hub has applied', type: 'info', read: false, time: new Date() },
    { id: 2, title: 'Payment Dispute', message: 'Order #12345 disputed', type: 'warning', read: false, time: new Date(Date.now() - 3600000) },
    { id: 3, title: 'System Update', message: 'Platform updated successfully', type: 'success', read: true, time: new Date(Date.now() - 7200000) },
  ]);

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div><h1><FiBell /> Notifications</h1><p>Manage system notifications</p></div>
      </div>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {notifications.map(notif => (
          <div key={notif.id} style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '16px', 
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            opacity: notif.read ? 0.6 : 1
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: notif.type === 'warning' ? '#EAB308' : notif.type === 'success' ? '#10B981' : '#3B82F6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiBell />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>{notif.title}</h4>
              <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>{notif.message}</p>
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{notif.time.toLocaleString()}</span>
            </div>
            {!notif.read && (
              <button style={{ padding: '0.5rem 1rem', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                <FiCheck /> Mark Read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsManagerPage;
