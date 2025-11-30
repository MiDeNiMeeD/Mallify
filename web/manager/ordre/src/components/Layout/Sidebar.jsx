import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiTruck,
  FiPackage,
  FiBarChart2,
  FiDollarSign,
  FiMessageSquare,
} from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { path: "/", icon: <FiHome />, label: "Dashboard" },
    { path: "/drivers", icon: <FiUsers />, label: "Drivers" },
    { path: "/deliveries", icon: <FiTruck />, label: "Deliveries" },
    { path: "/logistics", icon: <FiPackage />, label: "Logistics" },
    { path: "/analytics", icon: <FiBarChart2 />, label: "Analytics" },
    { path: "/financial", icon: <FiDollarSign />, label: "Financial" },
    {
      path: "/communication",
      icon: <FiMessageSquare />,
      label: "Communication",
    },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div
          className="sidebar-logo"
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ cursor: "pointer" }}
        >
          <img src="/mallify.png" alt="Mallify Logo" className="logo-icon" />
          {!isCollapsed && (
            <div className="logo-text-wrapper">
              <span className="logo-text">Mallify</span>
              <span className="logo-subtitle-sidebar">Delivery</span>
            </div>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">DM</div>
          {!isCollapsed && (
            <div className="user-details">
              <div className="user-name">Delivery Manager</div>
              <div className="user-role">Mideni</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
