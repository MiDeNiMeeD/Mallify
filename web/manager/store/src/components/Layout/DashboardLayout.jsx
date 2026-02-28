import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiGrid,
  FiShoppingBag,
  FiCheckCircle,
  FiBarChart2,
  FiShield,
  FiTag,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiEye,
  FiClock,
  FiUserCheck,
  FiPercent,
  FiBell,
  FiSearch,
  FiTrendingUp,
  FiFileText,
  FiAlertTriangle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { notifications } from '../../utils/mockData';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [popupMenu, setPopupMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleExpand = (label) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleParentClick = (label, event) => {
    if (sidebarCollapsed) {
      // Show popup menu when collapsed
      setPopupMenu(popupMenu === label ? null : label);
    } else {
      // Toggle expand when not collapsed
      toggleExpand(label);
    }
  };

  // Close popup when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (popupMenu && sidebarCollapsed) {
        setPopupMenu(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [popupMenu, sidebarCollapsed]);

  // Close popup when sidebar is expanded
  React.useEffect(() => {
    if (!sidebarCollapsed) {
      setPopupMenu(null);
    }
  }, [sidebarCollapsed]);

  // Auto-expand parent items when a child route is active
  React.useEffect(() => {
    const newExpandedItems = {};
    menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => location.pathname === child.path);
        if (hasActiveChild) {
          newExpandedItems[item.label] = true;
        }
      }
    });
    setExpandedItems(prev => ({ ...prev, ...newExpandedItems }));
    
    // Close popup menu when navigating
    setPopupMenu(null);
  }, [location.pathname]);

  // Close notifications dropdown when clicking outside
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

  const menuItems = [
    { path: '/dashboard', icon: FiGrid, label: 'Overview' },
    { 
      icon: FiShoppingBag, 
      label: 'Boutiques',
      children: [
        { path: '/boutiques', icon: FiShoppingBag, label: 'All Boutiques' },
        { path: '/boutiques/pending', icon: FiClock, label: 'Pending' },
        { path: '/boutiques/verified', icon: FiUserCheck, label: 'Verified' }
      ]
    },
    { path: '/approvals', icon: FiCheckCircle, label: 'Approvals' },
    { 
      icon: FiBarChart2, 
      label: 'Analytics',
      children: [
        { path: '/analytics', icon: FiBarChart2, label: 'Dashboard' },
        { path: '/analytics/reports', icon: FiFileText, label: 'Reports' },
        { path: '/analytics/insights', icon: FiTrendingUp, label: 'Insights' }
      ]
    },
    { path: '/compliance', icon: FiShield, label: 'Compliance' },
    { path: '/promotions', icon: FiTag, label: 'Promotions' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img src="/mallify.png" alt="Mallify" className="logo-img" />
            {!sidebarCollapsed &&   <div className="logo-text">
              <span className="logo-main">Mallify</span>
              <span className="logo-sub">BOUTIQUES</span>
            </div>}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const hasActiveChild = item.children && item.children.some(child => location.pathname === child.path);
            
            return (
            <div key={item.label} className="nav-item-wrapper">
              {item.children ? (
                // Parent item with children
                <>
                  <button
                    className={`nav-item ${expandedItems[item.label] ? 'expanded' : ''} ${hasActiveChild ? 'has-active-child' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleParentClick(item.label, e);
                    }}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <item.icon size={20} className="nav-icon" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="nav-label">{item.label}</span>
                        {expandedItems[item.label] ? (
                          <FiChevronDown size={16} className="nav-chevron" />
                        ) : (
                          <FiChevronRight size={16} className="nav-chevron" />
                        )}
                      </>
                    )}
                    {sidebarCollapsed && (
                      <FiChevronRight size={14} className="nav-arrow-indicator" />
                    )}
                  </button>
                  
                  {/* Sub-items (expanded inline when not collapsed) */}
                  {!sidebarCollapsed && expandedItems[item.label] && (
                    <div className="nav-submenu">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          end
                          className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
                        >
                          <child.icon size={18} className="nav-icon" />
                          <span className="nav-label">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                  
                  {/* Popup menu when collapsed */}
                  {sidebarCollapsed && popupMenu === item.label && (
                    <div className="nav-popup-menu" onClick={(e) => e.stopPropagation()}>
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          end
                          className={({ isActive }) => `popup-item ${isActive ? 'active' : ''}`}
                          onClick={() => setPopupMenu(null)}
                          title={child.label}
                        >
                          <child.icon size={20} className="nav-icon" />
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Regular item without children
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <item.icon size={20} className="nav-icon" />
                  {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                </NavLink>
              )}
            </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'M'}
            </div>
            {!sidebarCollapsed && (
              <div className="user-details">
                <div className="user-name">{user?.name || 'Manager'}</div>
                <div className="user-role">Boutiques Manager</div>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <FiLogOut size={18} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="top-header">
          {/* Search Bar */}
          <div className="search-container">
            <FiSearch className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search boutiques, analytics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Actions */}
          <div className="header-actions">
            <div className="notification-wrapper" ref={notificationRef}>
              <button
                className="icon-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="dropdown notifications-dropdown">
                  <div className="dropdown-header">
                    <h4>Notifications</h4>
                    <span className="badge badge-info">{unreadCount} new</span>
                  </div>
                  <div className="notification-list">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      >
                        <div className="notification-content">
                          <h5>{notif.title}</h5>
                          <p>{notif.message}</p>
                          <span className="notification-time">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="dropdown-footer">
                    <button className="btn btn-sm btn-secondary">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
