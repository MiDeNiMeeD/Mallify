import React from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const containerStyle = {
  minHeight: '70vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const cardStyle = {
  width: '100%',
  maxWidth: '420px',
  padding: '2.5rem',
  borderRadius: '20px',
  background: 'linear-gradient(135deg, rgba(110,59,255,0.12), rgba(17,153,250,0.12))',
  border: '1px solid rgba(255,255,255,0.15)',
  boxShadow: '0 25px 60px rgba(15, 23, 42, 0.15)',
  textAlign: 'center'
};

const iconWrapperStyle = {
  marginBottom: '1.25rem',
  display: 'flex',
  justifyContent: 'center'
};

const detailStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)'
};

function LoadingState({ title, message, detail, icon: Icon = Loader2, accentColor = 'var(--primary-color)' }) {
  return (
    <div className="dashboard-page" style={containerStyle}>
      <div style={cardStyle}>
        <div style={iconWrapperStyle}>
          <Icon size={42} style={{ color: accentColor, opacity: 0.85 }} />
        </div>
        <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
        <h2 style={{ marginBottom: '0.5rem' }}>{title}</h2>
        {message && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{message}</p>
        )}
        {detail && <p style={detailStyle}>{detail}</p>}
      </div>
    </div>
  );
}

LoadingState.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  detail: PropTypes.string,
  icon: PropTypes.elementType,
  accentColor: PropTypes.string
};

export default LoadingState;
