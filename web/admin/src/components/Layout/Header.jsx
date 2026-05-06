import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiSearch } from 'react-icons/fi';
import './Header.css';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notificationRef = useRef(null);

  // Mock notifications
  const notifications = [
    { id: 1, title: 'New Boutique Application', message: 'Fashion Hub submitted an application', time: '5 min ago', read: false },
    { id: 2, title: 'User Report', message: 'User reported issue with payment', time: '15 min ago', read: false },
    { id: 3, title: 'System Update', message: 'System will be updated tonight', time: '1 hour ago', read: true }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <header className="admin-header-bar">
      <div className="admin-header-content">
        {/* Search Bar */}
        <div className="admin-search-container">
          <FiSearch className="admin-search-icon" size={18} />
          <input
            type="text"
            placeholder="Search users, boutiques, orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>

        {/* Actions */}
        <div className="admin-header-actions">
          <div className="admin-notification-wrapper" ref={notificationRef}>
            <button
              className="admin-icon-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="admin-notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="admin-dropdown admin-notifications-dropdown">
                <div className="admin-dropdown-header">
                  <h4>Notifications</h4>
                  <span className="badge badge-info">{unreadCount} new</span>
                </div>
                <div className="admin-notification-list">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`admin-notification-item ${!notif.read ? 'unread' : ''}`}
                    >
                      <div className="admin-notification-content">
                        <h5>{notif.title}</h5>
                        <p>{notif.message}</p>
                        <span className="admin-notification-time">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="admin-dropdown-footer">
                  <button className="btn btn-sm btn-secondary">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
