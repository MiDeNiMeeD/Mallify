import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiShoppingBag, 
  FiPackage, 
  FiBarChart2, 
  FiDollarSign, 
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiShield,
  FiFileText,
  FiBell,
  FiTrendingUp,
  FiDatabase,
  FiTool,
  FiActivity,
  FiUserCheck,
  FiMapPin,
  FiTruck,
  FiCreditCard,
  FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [popupMenu, setPopupMenu] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    if (collapsed) {
      setPopupMenu(popupMenu === label ? null : label);
    } else {
      toggleExpand(label);
    }
  };

  // Close popup when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (popupMenu && collapsed) {
        setPopupMenu(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [popupMenu, collapsed]);

  // Close popup when sidebar is expanded
  React.useEffect(() => {
    if (!collapsed) {
      setPopupMenu(null);
    }
  }, [collapsed]);

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
    
    setPopupMenu(null);
  }, [location.pathname]);

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { 
      icon: FiUsers, 
      label: 'User Management',
      children: [
        { path: '/users', icon: FiUsers, label: 'All Users' },
        { path: '/users/customers', icon: FiUserCheck, label: 'Customers' },
        { path: '/users/boutiques', icon: FiShoppingBag, label: 'Boutiques' },
        { path: '/users/drivers', icon: FiTruck, label: 'Drivers' },
        { path: '/users/managers', icon: FiShield, label: 'Managers' }
      ]
    },
    { 
      icon: FiShoppingBag, 
      label: 'Boutiques',
      children: [
        { path: '/boutiques', icon: FiShoppingBag, label: 'All Boutiques' },
        { path: '/boutiques/approvals', icon: FiUserCheck, label: 'Approvals' },
        { path: '/boutiques/compliance', icon: FiShield, label: 'Compliance' },
        { path: '/boutiques/performance', icon: FiTrendingUp, label: 'Performance' }
      ]
    },
    { 
      icon: FiPackage, 
      label: 'Orders & Delivery',
      children: [
        { path: '/orders', icon: FiPackage, label: 'All Orders' },
        { path: '/orders/tracking', icon: FiMapPin, label: 'Tracking' },
        { path: '/orders/disputes', icon: FiAlertCircle, label: 'Disputes' }
      ]
    },
    { 
      icon: FiDollarSign, 
      label: 'Payments',
      children: [
        { path: '/payments', icon: FiDollarSign, label: 'Transactions' },
        { path: '/payments/payouts', icon: FiCreditCard, label: 'Payouts' },
        { path: '/payments/disputes', icon: FiAlertCircle, label: 'Disputes' }
      ]
    },
    { 
      icon: FiBarChart2, 
      label: 'Analytics',
      children: [
        { path: '/analytics', icon: FiBarChart2, label: 'Overview' },
        { path: '/analytics/revenue', icon: FiDollarSign, label: 'Revenue' },
        { path: '/analytics/users', icon: FiUsers, label: 'User Stats' },
        { path: '/analytics/performance', icon: FiTrendingUp, label: 'Performance' }
      ]
    },
    { 
      icon: FiDatabase, 
      label: 'System',
      children: [
        { path: '/system/logs', icon: FiFileText, label: 'Audit Logs' },
        { path: '/system/activity', icon: FiActivity, label: 'Activity Monitor' },
        { path: '/system/maintenance', icon: FiTool, label: 'Maintenance' }
      ]
    },
    { path: '/notifications', icon: FiBell, label: 'Notifications' },
    { path: '/settings', icon: FiSettings, label: 'Settings' }
  ];

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="admin-sidebar-header">
        <div className="admin-logo-container">
          <img src={`${process.env.PUBLIC_URL}/mallify.png`} alt="Mallify" className="admin-logo-img" />
          {!collapsed && (
            <div className="admin-logo-text">
              <div className="admin-logo-main">Mallify</div>
              <div className="admin-logo-sub">Admin</div>
            </div>
          )}
        </div>
        <button className="admin-toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FiMenu size={20} /> : <FiX size={20} />}
        </button>
      </div>

      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => {
          const hasActiveChild = item.children && item.children.some(child => location.pathname === child.path);
          
          return (
          <div key={item.label} className="admin-nav-item-wrapper">
            {item.children ? (
              <>
                <button
                  className={`admin-nav-item ${expandedItems[item.label] ? 'expanded' : ''} ${hasActiveChild ? 'has-active-child' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleParentClick(item.label, e);
                  }}
                  title={collapsed ? item.label : ''}
                >
                  <item.icon size={20} className="admin-nav-icon" />
                  {!collapsed && (
                    <>
                      <span className="admin-nav-label">{item.label}</span>
                      {expandedItems[item.label] ? (
                        <FiChevronDown size={16} className="admin-nav-chevron" />
                      ) : (
                        <FiChevronRight size={16} className="admin-nav-chevron" />
                      )}
                    </>
                  )}
                  {collapsed && (
                    <FiChevronRight size={14} className="admin-nav-arrow-indicator" />
                  )}
                </button>
                
                {!collapsed && expandedItems[item.label] && (
                  <div className="admin-nav-submenu">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        end
                        className={({ isActive }) => `admin-nav-subitem ${isActive ? 'active' : ''}`}
                      >
                        <child.icon size={18} className="admin-nav-icon" />
                        <span className="admin-nav-label">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
                
                {collapsed && popupMenu === item.label && (
                  <div className="admin-nav-popup-menu" onClick={(e) => e.stopPropagation()}>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        end
                        className={({ isActive }) => `admin-popup-item ${isActive ? 'active' : ''}`}
                        onClick={() => setPopupMenu(null)}
                        title={child.label}
                      >
                        <child.icon size={20} className="admin-nav-icon" />
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                end
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <item.icon size={20} className="admin-nav-icon" />
                {!collapsed && <span className="admin-nav-label">{item.label}</span>}
              </NavLink>
            )}
          </div>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-user-info">
          <div className="admin-user-avatar">
            {user?.name?.charAt(0) || 'A'}
          </div>
          {!collapsed && (
            <div className="admin-user-details">
              <div className="admin-user-name">{user?.name || 'Administrator'}</div>
              <div className="admin-user-role">System Admin</div>
            </div>
          )}
        </div>
        <button className="admin-logout-btn" onClick={handleLogout} title="Logout">
          <FiLogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
