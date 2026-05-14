import React, { useState, useEffect } from 'react';
import { 
  FiSettings, 
  FiSave, 
  FiGlobe, 
  FiBell, 
  FiLock,
  FiMail,
  FiShield,
  FiSliders,
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiToggleLeft,
  FiToggleRight,
  FiSmartphone,
  FiMonitor,
  FiSun,
  FiMoon,
  FiClock,
  FiImage,
  FiAlertCircle
} from 'react-icons/fi';
import '../System/SystemPages.css';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'Mallify Admin',
    siteUrl: 'https://admin.mallify.com',
    siteDescription: 'Multi-vendor e-commerce management platform',
    supportEmail: 'support@mallify.com',
    defaultLanguage: 'English',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    maintenanceMode: false,
    emailNotifications: true,
    twoFactorAuth: false,
    autoBackup: true,
    darkMode: false,
    showNewUserAlerts: true,
    showOrderAlerts: true,
    showDisputeAlerts: true,
    showSystemAlerts: true,
    maxLoginAttempts: 5,
    sessionTimeout: 60,
    minPasswordLength: 8,
    allowRegistration: true,
    newUserVerification: true,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: FiGlobe },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'appearance', label: 'Appearance', icon: FiMonitor },
    { id: 'system', label: 'System', icon: FiSliders },
  ];

  const handleSave = () => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #F3F4F6' }}>
      <div>
        <div style={{ fontWeight: 500, color: '#111827', fontSize: '0.95rem' }}>{label}</div>
        {description && <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.15rem' }}>{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: '52px',
          height: '28px',
          borderRadius: '14px',
          background: checked ? 'linear-gradient(135deg, #7C3AED, #5B21B6)' : '#E5E7EB',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.3s ease',
          flexShrink: 0,
          marginLeft: '1rem'
        }}
      >
        <div style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: 'white',
          position: 'absolute',
          top: '3px',
          left: checked ? '27px' : '3px',
          transition: 'left 0.3s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );

  const InputField = ({ label, value, onChange, type = 'text', options }) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151', fontSize: '0.875rem' }}>{label}</label>
      {type === 'select' ? (
        <select
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '2px solid #E5E7EB',
            borderRadius: '10px',
            fontSize: '0.9rem',
            color: '#111827',
            background: '#F9FAFB',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            cursor: 'pointer'
          }}
          onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
        >
          {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '2px solid #E5E7EB',
            borderRadius: '10px',
            fontSize: '0.9rem',
            color: '#111827',
            background: '#F9FAFB',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
        />
      )}
    </div>
  );

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1><FiSettings /> Platform Settings</h1>
          <p>Configure platform settings and preferences</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Sidebar Tabs */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '0.75rem',
          boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.1)',
          width: '220px',
          flexShrink: 0
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #7C3AED20, #5B21B620)' : 'transparent',
                  color: activeTab === tab.id ? '#7C3AED' : '#6B7280',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontSize: '0.875rem',
                  marginBottom: '0.25rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = '#F9FAFB'; }}
                onMouseLeave={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '800px' }}>
          {/* General Settings */}
          {activeTab === 'general' && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1F2937' }}>
                <FiGlobe color="#7C3AED" /> General Settings
              </h3>
              <InputField label="Site Name" value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} />
              <InputField label="Site URL" value={settings.siteUrl} onChange={(e) => setSettings({...settings, siteUrl: e.target.value})} />
              <InputField label="Site Description" value={settings.siteDescription} onChange={(e) => setSettings({...settings, siteDescription: e.target.value})} />
              <InputField label="Support Email" value={settings.supportEmail} onChange={(e) => setSettings({...settings, supportEmail: e.target.value})} type="email" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <InputField label="Default Language" value={settings.defaultLanguage} onChange={(e) => setSettings({...settings, defaultLanguage: e.target.value})} type="select" options={['English', 'French', 'Spanish', 'Arabic', 'Portuguese']} />
                <InputField label="Timezone" value={settings.timezone} onChange={(e) => setSettings({...settings, timezone: e.target.value})} type="select" options={['UTC', 'EST', 'PST', 'GMT', 'CET', 'WAT']} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <InputField label="Date Format" value={settings.dateFormat} onChange={(e) => setSettings({...settings, dateFormat: e.target.value})} type="select" options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']} />
                <InputField label="Currency" value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} type="select" options={['USD', 'EUR', 'GBP', 'NGN', 'CAD']} />
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1F2937' }}>
                <FiBell color="#7C3AED" /> Notification Preferences
              </h3>
              <ToggleSwitch
                checked={settings.emailNotifications}
                onChange={(v) => setSettings({...settings, emailNotifications: v})}
                label="Email Notifications"
                description="Receive email updates about platform activity"
              />
              <ToggleSwitch
                checked={settings.showNewUserAlerts}
                onChange={(v) => setSettings({...settings, showNewUserAlerts: v})}
                label="New User Alerts"
                description="Get notified when new users register"
              />
              <ToggleSwitch
                checked={settings.showOrderAlerts}
                onChange={(v) => setSettings({...settings, showOrderAlerts: v})}
                label="Order Alerts"
                description="Notifications for new and pending orders"
              />
              <ToggleSwitch
                checked={settings.showDisputeAlerts}
                onChange={(v) => setSettings({...settings, showDisputeAlerts: v})}
                label="Dispute Alerts"
                description="Get notified about new payment disputes"
              />
              <ToggleSwitch
                checked={settings.showSystemAlerts}
                onChange={(v) => setSettings({...settings, showSystemAlerts: v})}
                label="System Alerts"
                description="Alerts for system health and maintenance"
              />
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1F2937' }}>
                <FiLock color="#7C3AED" /> Security Settings
              </h3>
              <ToggleSwitch
                checked={settings.twoFactorAuth}
                onChange={(v) => setSettings({...settings, twoFactorAuth: v})}
                label="Two-Factor Authentication"
                description="Add an extra layer of security to admin accounts"
              />
              <ToggleSwitch
                checked={settings.allowRegistration}
                onChange={(v) => setSettings({...settings, allowRegistration: v})}
                label="Allow Registration"
                description="Allow new user registrations on the platform"
              />
              <ToggleSwitch
                checked={settings.newUserVerification}
                onChange={(v) => setSettings({...settings, newUserVerification: v})}
                label="New User Verification"
                description="Require email verification for new accounts"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
                <InputField label="Max Login Attempts" value={settings.maxLoginAttempts} onChange={(e) => setSettings({...settings, maxLoginAttempts: Number(e.target.value)})} type="select" options={[3, 5, 10, 20]} />
                <InputField label="Session Timeout (min)" value={settings.sessionTimeout} onChange={(e) => setSettings({...settings, sessionTimeout: Number(e.target.value)})} type="select" options={[15, 30, 60, 120, 240]} />
              </div>
              <InputField label="Minimum Password Length" value={settings.minPasswordLength} onChange={(e) => setSettings({...settings, minPasswordLength: Number(e.target.value)})} type="select" options={[6, 8, 10, 12, 16]} />
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1F2937' }}>
                <FiMonitor color="#7C3AED" /> Appearance
              </h3>
              <ToggleSwitch
                checked={settings.darkMode}
                onChange={(v) => setSettings({...settings, darkMode: v})}
                label="Dark Mode"
                description="Switch between light and dark theme"
              />
              <InputField label="Default Language" value={settings.defaultLanguage} onChange={(e) => setSettings({...settings, defaultLanguage: e.target.value})} type="select" options={['English', 'French', 'Spanish', 'Arabic', 'Portuguese']} />
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#F9FAFB', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#374151' }}>Dashboard Layout Preferences</h4>
                <ToggleSwitch checked={true} onChange={() => {}} label="Show Stats Cards" description="Display analytics cards on dashboard" />
                <ToggleSwitch checked={true} onChange={() => {}} label="Show Charts" description="Display chart visualizations" />
                <ToggleSwitch checked={false} onChange={() => {}} label="Compact Mode" description="Reduce spacing for more content" />
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1F2937' }}>
                <FiSliders color="#7C3AED" /> System Configuration
              </h3>
              <ToggleSwitch checked={settings.maintenanceMode} onChange={(v) => setSettings({...settings, maintenanceMode: v})} label="Maintenance Mode" description="Put the platform in maintenance mode - only admins can access" />
              <ToggleSwitch checked={settings.autoBackup} onChange={(v) => setSettings({...settings, autoBackup: v})} label="Auto Backup" description="Automatically backup database daily" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
                <InputField label="Backup Frequency" value="Daily" onChange={() => {}} type="select" options={['Hourly', 'Daily', 'Weekly', 'Monthly']} />
                <InputField label="Retention Period" value="30 Days" onChange={() => {}} type="select" options={['7 Days', '14 Days', '30 Days', '60 Days', '90 Days']} />
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#FFF7ED', borderRadius: '12px', border: '1px solid #FFEDD5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <FiAlertCircle color="#F97316" size={18} />
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#92400E' }}>Danger Zone</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#9A3412', margin: '0 0 1rem 0' }}>These actions are irreversible. Proceed with caution.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button style={{ padding: '0.6rem 1.2rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Clear All Cache</button>
                  <button style={{ padding: '0.6rem 1.2rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Reset Platform</button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '1rem 2rem',
              marginTop: '1.5rem',
              background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? (
              <><FiRefreshCw className="spinning" /> Saving...</>
            ) : saved ? (
              <><FiCheckCircle /> Saved Successfully!</>
            ) : (
              <><FiSave /> Save Settings</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;