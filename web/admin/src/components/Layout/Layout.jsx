import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import PageLoader from '../PageLoader';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-layout-main">
        <Header />
        <main className="admin-layout-content">
          <PageLoader>{children}</PageLoader>
        </main>
      </div>
    </div>
  );
};

export default Layout;
