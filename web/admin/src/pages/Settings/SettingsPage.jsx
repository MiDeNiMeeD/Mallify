import React, { useState } from 'react';
import { FiSettings, FiSave, FiGlobe, FiBell, FiLock } from 'react-icons/fi';
import '../System/SystemPages.css';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'Mallify Admin',
    siteUrl: 'https://admin.mallify.com',
    maintenanceMode: false,
    emailNotifications: true,
    twoFactorAuth: false,
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div><h1><FiSettings /> Platform Settings</h1><p>Configure platform settings</p></div>
      </div>
      <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '800px' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiGlobe /> General Settings
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Site Name</label>
              <input 
                type="text" 
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #E5E7EB', borderRadius: '10px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Site URL</label>
              <input 
                type="text" 
                value={settings.siteUrl}
                onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #E5E7EB', borderRadius: '10px' }}
              />
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiBell /> Notifications
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
            <span>Email Notifications</span>
            <input 
              type="checkbox" 
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiLock /> Security
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
            <span>Two-Factor Authentication</span>
            <input 
              type="checkbox" 
              checked={settings.twoFactorAuth}
              onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderTop: '1px solid #F3F4F6' }}>
            <span>Maintenance Mode</span>
            <input 
              type="checkbox" 
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          style={{ 
            padding: '1rem 2rem', 
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            fontWeight: '600',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <FiSave /> Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
