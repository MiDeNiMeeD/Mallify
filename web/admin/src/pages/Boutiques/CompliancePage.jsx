import React, { useState, useEffect } from 'react';
import { FiShield, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../Boutiques/AllBoutiques.css';

const CompliancePage = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoutiques();
  }, []);

  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBoutiques();
      setBoutiques(response.data || []);
    } catch (error) {
      console.error('Error fetching boutiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceScore = (boutique) => {
    let score = 100;
    if (!boutique.verified) score -= 20;
    if (!boutique.taxInfo) score -= 15;
    if (!boutique.businessLicense) score -= 15;
    if (boutique.violations && boutique.violations.length > 0) score -= boutique.violations.length * 10;
    return Math.max(score, 0);
  };

  const getComplianceStatus = (score) => {
    if (score >= 90) return { label: 'Excellent', class: 'status-active' };
    if (score >= 70) return { label: 'Good', class: 'status-pending' };
    return { label: 'Needs Attention', class: 'status-suspended' };
  };

  if (loading) {
    return <div className="all-boutiques-page"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  }

  const compliantCount = boutiques.filter(b => getComplianceScore(b) >= 90).length;
  const needsAttention = boutiques.filter(b => getComplianceScore(b) < 70).length;

  return (
    <div className="all-boutiques-page">
      <div className="page-header">
        <div>
          <h1><FiShield /> Compliance Monitoring</h1>
          <p>Monitor boutique compliance with platform policies</p>
        </div>
      </div>

      <div className="boutiques-stats">
        <div className="stat-card">
          <FiShield className="stat-icon" />
          <div className="stat-details">
            <h3>{boutiques.length}</h3>
            <p>Total Boutiques</p>
          </div>
        </div>
        <div className="stat-card">
          <FiCheckCircle className="stat-icon active" />
          <div className="stat-details">
            <h3>{compliantCount}</h3>
            <p>Fully Compliant</p>
          </div>
        </div>
        <div className="stat-card">
          <FiAlertTriangle className="stat-icon pending" />
          <div className="stat-details">
            <h3>{needsAttention}</h3>
            <p>Needs Attention</p>
          </div>
        </div>
      </div>

      <div className="boutiques-grid">
        {boutiques.map(boutique => {
          const score = getComplianceScore(boutique);
          const status = getComplianceStatus(score);
          return (
            <div key={boutique._id} className="boutique-card">
              <div className="boutique-content">
                <h3>{boutique.name}</h3>
                <div className="compliance-score">
                  <div className="score-circle" style={{
                    background: score >= 90 ? '#10B981' : score >= 70 ? '#EAB308' : '#EF4444'
                  }}>
                    <span>{score}%</span>
                  </div>
                  <span className={`status-badge ${status.class}`}>{status.label}</span>
                </div>
                <div className="boutique-details">
                  <div className="detail-row">
                    {boutique.verified ? <FiCheckCircle style={{color: '#10B981'}} /> : <FiAlertTriangle style={{color: '#EAB308'}} />}
                    <span>Verification: {boutique.verified ? 'Verified' : 'Pending'}</span>
                  </div>
                  <div className="detail-row">
                    {boutique.taxInfo ? <FiCheckCircle style={{color: '#10B981'}} /> : <FiAlertTriangle style={{color: '#EF4444'}} />}
                    <span>Tax Info: {boutique.taxInfo ? 'Complete' : 'Missing'}</span>
                  </div>
                  <div className="detail-row">
                    {boutique.businessLicense ? <FiCheckCircle style={{color: '#10B981'}} /> : <FiAlertTriangle style={{color: '#EF4444'}} />}
                    <span>Business License: {boutique.businessLicense ? 'Valid' : 'Missing'}</span>
                  </div>
                </div>
                <button className="btn-primary">Review Compliance</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompliancePage;
