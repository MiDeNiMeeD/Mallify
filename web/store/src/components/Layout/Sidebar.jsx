import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiGrid,
  FiShoppingBag,
  FiPackage,
  FiBarChart2,
  FiMessageSquare,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiShoppingCart,
  FiClock,FiHome,
  FiCheckCircle,
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiStar,
  FiTag,
  FiPercent,
  FiBell,
  FiBox,
  FiAlertCircle,
  FiCalendar,
  FiZap,
  FiEye,
  FiCreditCard
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../chat';
import './Sidebar.css';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [popupMenu, setPopupMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasManagementAccess, subscriptionAccess } = useAuth();
  const { totalUnread } = useChat();

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
      event.stopPropagation();
      setPopupMenu(popupMenu === label ? null : label);
    } else {
      toggleExpand(label);
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (popupMenu && collapsed) {
        setPopupMenu(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [popupMenu, collapsed]);

  // Close popup when sidebar is expanded
  useEffect(() => {
    if (!collapsed) {
      setPopupMenu(null);
    }
  }, [collapsed]);

  // Auto-expand parent items when a child route is active
  useEffect(() => {
    if (!hasManagementAccess) {
      setExpandedItems({});
      setPopupMenu(null);
      return;
    }

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
  }, [location.pathname, hasManagementAccess]);

  const fullMenuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { 
      icon: FiShoppingBag, 
      label: 'Boutique',
      children: [
        { path: '/boutique/preview', icon: FiEye, label: 'My Boutique' },
        { path: '/boutique/profile', icon: FiSettings, label: 'Profile & Branding' },
        { path: '/boutique/hours', icon: FiClock, label: 'Working Hours' },
        { path: '/boutique/delivery', icon: FiPackage, label: 'Delivery Options' }
      ]
    },
    { 
      icon: FiBox, 
      label: 'Products',
      children: [
        { path: '/products', icon: FiBox, label: 'All Products' },
        { path: '/products/add', icon: FiPackage, label: 'Add Product' },
        { path: '/products/inventory', icon: FiAlertCircle, label: 'Inventory & Alerts' }
      ]
    },
    { 
      icon: FiShoppingCart, 
      label: 'Orders',
      children: [
        { path: '/orders', icon: FiShoppingCart, label: 'All Orders' },
        { path: '/orders/pending', icon: FiClock, label: 'Pending' },
        { path: '/orders/processing', icon: FiPackage, label: 'Processing' },
        
      ]
    },
    { 
      icon: FiBarChart2, 
      label: 'Analytics',
      children: [
        { path: '/analytics', icon: FiTrendingUp, label: 'Sales Analytics' },
        { path: '/analytics/reports', icon: FiBarChart2, label: 'Reports' }
      ]
    },
    
    {
      icon: FiMessageSquare,
      label: 'Communication',
      badge: totalUnread,
      children: [
        { path: '/communication/customers', icon: FiUsers, label: 'Customer Messages', badge: totalUnread },
        { path: '/communication/reviews', icon: FiStar, label: 'Reviews & Ratings' }
      ]
    }
  ];

  const subscriptionMenuItem = { path: '/subscription', icon: FiCreditCard, label: 'Subscription' };
  const menuItems = hasManagementAccess
    ? [...fullMenuItems, subscriptionMenuItem]
    : [subscriptionMenuItem, ...fullMenuItems];

  const isItemLocked = (itemPath) => {
    if (hasManagementAccess) {
      return false;
    }
    return itemPath !== '/subscription';
  };

  const subscriptionEndDate = subscriptionAccess?.subscription?.currentPeriodEnd
    ? new Date(subscriptionAccess.subscription.currentPeriodEnd)
    : null;
  const subscriptionDaysLeft = subscriptionEndDate
    ? Math.max(0, Math.ceil((subscriptionEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <img src="/mallify.png" alt="Mallify" className="logo-img" />
          {!collapsed && (
            <div className="logo-text">
              <span className="logo-main">Mallify</span>
              <span className="logo-sub">BOUTIQUE</span>
            </div>
          )}
        </div>
        <button 
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <FiMenu size={20} /> : <FiX size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const hasActiveChild = item.children && item.children.some(child => location.pathname === child.path);
          const parentLocked = item.children ? !hasManagementAccess : isItemLocked(item.path);
          
          return (
            <div key={item.label} className="nav-item-wrapper">
              {item.children ? (
                // Parent item with children
                <>
                  <button
                    className={`nav-item ${expandedItems[item.label] ? 'expanded' : ''} ${hasActiveChild ? 'has-active-child' : ''} ${parentLocked ? 'disabled' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (parentLocked) {
                        return;
                      }
                      handleParentClick(item.label, e);
                    }}
                    title={collapsed ? item.label : ''}
                    disabled={parentLocked}
                  >
                    <span className="nav-icon-wrap">
                      <item.icon size={20} className="nav-icon" />
                      {item.badge > 0 && (
                        <span className="nav-badge">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </span>
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
                  {!collapsed && hasManagementAccess && expandedItems[item.label] && (
                    <div className="nav-submenu">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          end
                          onClick={(e) => {
                            if (isItemLocked(child.path)) {
                              e.preventDefault();
                            }
                          }}
                          className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''} ${isItemLocked(child.path) ? 'disabled' : ''}`}
                        >
                          <child.icon size={18} className="nav-icon" />
                          <span className="nav-label">{child.label}</span>
                          {child.badge > 0 && (
                            <span className="nav-badge nav-badge-inline">
                              {child.badge > 99 ? '99+' : child.badge}
                            </span>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  )}
                  
                  {/* Popup menu when collapsed */}
                  {collapsed && hasManagementAccess && popupMenu === item.label && (
                    <div className="nav-popup-menu" onClick={(e) => e.stopPropagation()}>
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          end
                          className={({ isActive }) => `popup-item ${isActive ? 'active' : ''} ${isItemLocked(child.path) ? 'disabled' : ''}`}
                          onClick={(e) => {
                            if (isItemLocked(child.path)) {
                              e.preventDefault();
                              return;
                            }
                            setPopupMenu(null);
                          }}
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
                  onClick={(e) => {
                    if (isItemLocked(item.path)) {
                      e.preventDefault();
                    }
                  }}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${isItemLocked(item.path) ? 'disabled' : ''}`}
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
              <div className="user-name">{user?.name || 'Boutique Owner'}</div>
              <div className="user-role">Boutique Owner</div>
              {!hasManagementAccess && (
                <div className="subscription-note">
                  {subscriptionDaysLeft !== null
                    ? `Subscription: ${subscriptionDaysLeft} day${subscriptionDaysLeft === 1 ? '' : 's'} left`
                    : 'Subscription required'}
                </div>
              )}
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
