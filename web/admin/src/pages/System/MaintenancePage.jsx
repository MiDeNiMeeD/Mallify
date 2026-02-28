import React from 'react';
import { FiTool, FiRefreshCw, FiDatabase } from 'react-icons/fi';
import './SystemPages.css';

const MaintenancePage = () => {
  return (
    <div className="system-page">
      <div className="page-header">
        <div><h1><FiTool /> System Maintenance</h1><p>Manage system maintenance tasks</p></div>
      </div>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <FiRefreshCw style={{ fontSize: '2rem', color: '#7C3AED' }} />
            <div>
              <h3 style={{ margin: 0 }}>Cache Management</h3>
              <p style={{ margin: 0, color: '#6B7280' }}>Clear application cache</p>
            </div>
          </div>
          <button style={{ padding: '0.75rem 1.5rem', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
            Clear Cache
          </button>
        </div>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <FiDatabase style={{ fontSize: '2rem', color: '#10B981' }} />
            <div>
              <h3 style={{ margin: 0 }}>Database Backup</h3>
              <p style={{ margin: 0, color: '#6B7280' }}>Create database backup</p>
            </div>
          </div>
          <button style={{ padding: '0.75rem 1.5rem', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
            Backup Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
