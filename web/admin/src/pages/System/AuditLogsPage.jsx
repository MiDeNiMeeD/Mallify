import React, { useState } from 'react';
import { FiEye } from 'react-icons/fi';
import './SystemPages.css';

const AuditLogsPage = () => {
  const [logs] = useState([
    { id: 1, action: 'User login', user: 'admin@mallify.com', timestamp: new Date(), status: 'success' },
    { id: 2, action: 'Boutique approved', user: 'admin@mallify.com', timestamp: new Date(Date.now() - 3600000), status: 'success' },
    { id: 3, action: 'Order refund', user: 'support@mallify.com', timestamp: new Date(Date.now() - 7200000), status: 'success' },
  ]);

  return (
    <div className="system-page">
      <div className="page-header">
        <div><h1><FiEye /> Audit Logs</h1><p>Track all administrative actions</p></div>
      </div>
      <div className="logs-table">
        <table style={{ width: '100%', background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
          <thead style={{ background: '#7C3AED', color: 'white' }}>
            <tr><th style={{ padding: '1rem' }}>Action</th><th>User</th><th>Time</th><th>Status</th></tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '1rem' }}>{log.action}</td>
                <td>{log.user}</td>
                <td>{log.timestamp.toLocaleString()}</td>
                <td><span style={{ padding: '0.5rem 1rem', background: '#D1FAE5', color: '#065F46', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600' }}>{log.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsPage;
