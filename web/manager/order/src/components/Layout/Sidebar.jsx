import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiTruck, 
  FiPackage, 
  FiBarChart2, 
  FiDollarSign, 
  FiMessageSquare,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiUserCheck,
  FiUserPlus,
  FiAward,
  FiMap,
  FiMapPin,
  FiAlertCircle,
  FiClock,
  FiTrendingUp,
  FiFileText,
  FiBell,
  FiMessageCircle
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
    
    // Close popup menu when navigating
    setPopupMenu(null);
  }, [location.pathname]);

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { 
      icon: FiUsers, 
      label: 'Drivers',
      children: [
        { path: '/drivers', icon: FiUsers, label: 'All Drivers' },
        { path: '/drivers/onboarding', icon: FiUserPlus, label: 'Onboarding' },
        { path: '/drivers/performance', icon: FiAward, label: 'Performance' },
        { path: '/drivers/zones', icon: FiMap, label: 'Zone Assignment' }
      ]
    },
    { 
      icon: FiTruck, 
      label: 'Deliveries',
      children: [
        { path: '/deliveries', icon: FiTruck, label: 'Monitor' },
        { path: '/deliveries/tracking', icon: FiMapPin, label: 'Tracking' },
        { path: '/deliveries/issues', icon: FiAlertCircle, label: 'Issues' },
        { path: '/deliveries/pricing', icon: FiDollarSign, label: 'Pricing Rules' }
      ]
    },
    { 
      icon: FiPackage, 
      label: 'Logistics',
      children: [
        { path: '/logistics', icon: FiPackage, label: 'Coordination' },
        { path: '/logistics/schedule', icon: FiClock, label: 'Schedule' }
      ]
    },
    { 
      icon: FiBarChart2, 
      label: 'Analytics',
      children: [
        { path: '/analytics', icon: FiBarChart2, label: 'Dashboard' },
        { path: '/analytics/reports', icon: FiFileText, label: 'Reports' },
        { path: '/analytics/efficiency', icon: FiTrendingUp, label: 'Efficiency' }
      ]
    },
    { path: '/financial', icon: FiDollarSign, label: 'Financial' },
    { 
      icon: FiMessageSquare, 
      label: 'Communication',
      children: [
        { path: '/communication', icon: FiMessageCircle, label: 'Chat' },
        { path: '/communication/notifications', icon: FiBell, label: 'Notifications' }
      ]
    }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={`${process.env.PUBLIC_URL}/mallify.png`} alt="Mallify" className="logo-img" />
          {!collapsed && (
            <div className="logo-text">
              <div className="logo-main">Mallify</div>
              <div className="logo-sub">Delivery</div>
            </div>
          )}
        </div>
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FiMenu size={20} /> : <FiX size={20} />}
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
                  title={collapsed ? item.label : ''}
                >
                  <item.icon size={20} className="nav-icon" />
                  {!collapsed && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      {expandedItems[item.label] ? (
                        <FiChevronDown size={16} className="nav-chevron" />
                      ) : (
                        <FiChevronRight size={16} className="nav-chevron" />
                      )}
                    </>
                  )}
                  {collapsed && (
                    <FiChevronRight size={14} className="nav-arrow-indicator" />
                  )}
                </button>
                
                {/* Sub-items (expanded inline when not collapsed) */}
                {!collapsed && expandedItems[item.label] && (
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
                {collapsed && popupMenu === item.label && (
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
                title={collapsed ? item.label : ''}
              >
                <item.icon size={20} className="nav-icon" />
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            )}
          </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'B'}
          </div>
          {!collapsed && (
            <div className="user-details">
              <div className="user-name">{user?.name || 'Boutiques Manager'}</div>
              <div className="user-role">Boutiques Manager</div>
            </div>
          )}
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <FiLogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
