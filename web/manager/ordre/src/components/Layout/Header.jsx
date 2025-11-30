import React from 'react';
import { FiBell, FiSearch, FiSettings } from 'react-icons/fi';
import './Header.css';

const Header = ({ title = 'Dashboard' }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="header-right">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search drivers, deliveries..." 
            className="search-input"
          />
        </div>

        <button className="icon-btn notification-btn">
          <FiBell />
          <span className="notification-badge">3</span>
        </button>

        <button className="icon-btn">
          <FiSettings />
        </button>
      </div>
    </header>
  );
};

export default Header;
