import React, { useState } from 'react';
import { FiActivity, FiServer } from 'react-icons/fi';
import './SystemPages.css';

const ActivityMonitorPage = () => {
  const [services] = useState([
    { name: 'API Gateway', status: 'online', uptime: '99.9%', responseTime: '45ms' },
    { name: 'Database', status: 'online', uptime: '99.8%', responseTime: '12ms' },
    { name: 'Payment Service', status: 'online', uptime: '99.7%', responseTime: '89ms' },
    { name: 'Notification Service', status: 'online', uptime: '99.5%', responseTime: '156ms' },
  ]);

  return (
    <div className="system-page">
      <div className="page-header">
        <div><h1><FiActivity /> System Activity</h1><p>Real-time system monitoring</p></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {services.map((service, i) => (
          <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiServer />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{service.name}</h3>
                <span style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: '600' }}>{service.status}</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><strong>Uptime:</strong> {service.uptime}</div>
              <div><strong>Response:</strong> {service.responseTime}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityMonitorPage;
