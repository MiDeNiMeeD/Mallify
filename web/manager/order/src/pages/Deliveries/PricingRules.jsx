import React from 'react';
import { FiDollarSign } from 'react-icons/fi';
import '../../styles/Dashboard.css';

const PricingRules = () => {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pricing Rules</h1>
          <p className="page-subtitle">Configure delivery pricing and fees</p>
        </div>
      </div>

      <div className="content-card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <FiDollarSign />
          </div>
          <div className="empty-state-title">Pricing Configuration Coming Soon</div>
          <p style={{ maxWidth: '500px', textAlign: 'center', margin: '0 auto' }}>
            The Pricing Rules feature requires the Delivery Service pricing configuration API.
            This feature will allow you to create and manage dynamic pricing rules based on distance, time, and priority.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingRules;
