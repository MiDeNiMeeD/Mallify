import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-layout-main">
        <Header />
        <main className="admin-layout-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
