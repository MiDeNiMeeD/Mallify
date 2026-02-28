import React, { useState, useEffect, useRef } from 'react';
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
  FiEye
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [popupMenu, setPopupMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
        { path: '/orders/returns', icon: FiAlertCircle, label: 'Returns & Refunds' }
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
      icon: FiTag, 
      label: 'Promotions',
      children: [
        { path: '/promotions', icon: FiTag, label: 'All Promotions' },
        { path: '/promotions/discounts', icon: FiPercent, label: 'Discounts & Coupons' },
        { path: '/promotions/flash-sales', icon: FiZap, label: 'Flash Sales' }
      ]
    },
    { 
      icon: FiMessageSquare, 
      label: 'Communication',
      children: [
        { path: '/communication/customers', icon: FiUsers, label: 'Customer Messages' },
        { path: '/communication/reviews', icon: FiStar, label: 'Reviews & Ratings' }
      ]
    }
  ];

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
              <div className="user-name">{user?.name || 'Boutique Owner'}</div>
              <div className="user-role">Store Manager</div>
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
