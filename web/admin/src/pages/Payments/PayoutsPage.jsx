import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCheckCircle, FiClock, FiUser } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import './TransactionsPage.css';

const PayoutsPage = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      // Mock payouts data - in real app would use getBoutiques and check payout requests
      const boutiquesResponse = await apiClient.getBoutiques();
      const mockPayouts = boutiquesResponse.data?.slice(0, 10).map((b, i) => ({
        _id: b._id + '-payout',
        boutiqueId: b,
        amount: Math.random() * 5000 + 500,
        status: ['pending', 'processing', 'completed'][i % 3],
        requestDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        method: 'bank_transfer',
      })) || [];
      setPayouts(mockPayouts);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayout = async (id) => {
    try {
      setPayouts(payouts.map(p => p._id === id ? { ...p, status: 'processing' } : p));
    } catch (error) {
      console.error('Error approving payout:', error);
    }
  };

  const stats = {
    total: payouts.reduce((sum, p) => sum + (p.amount || 0), 0),
    pending: payouts.filter(p => p.status === 'pending').length,
    processing: payouts.filter(p => p.status === 'processing').length,
    completed: payouts.filter(p => p.status === 'completed').length,
  };

  if (loading) {
    return <div className="transactions-page"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  }

  return (
    <div className="transactions-page payouts-page">
      <div className="page-header">
        <div>
          <h1><FiDollarSign /> Boutique Payouts</h1>
          <p>Manage payout requests from boutiques</p>
        </div>
      </div>

      <div className="transactions-stats">
        <div className="stat-card">
          <FiDollarSign className="stat-icon" />
          <div className="stat-details">
            <h3>${(stats.total / 1000).toFixed(1)}K</h3>
            <p>Total Payouts</p>
          </div>
        </div>
        <div className="stat-card">
          <FiClock className="stat-icon pending" />
          <div className="stat-details">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <FiDollarSign className="stat-icon revenue" />
          <div className="stat-details">
            <h3>{stats.processing}</h3>
            <p>Processing</p>
          </div>
        </div>
        <div className="stat-card">
          <FiCheckCircle className="stat-icon delivered" />
          <div className="stat-details">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Boutique</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map(payout => (
              <tr key={payout._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiUser />
                    {payout.boutiqueId?.name || 'N/A'}
                  </div>
                </td>
                <td className="amount">${(payout.amount || 0).toFixed(2)}</td>
                <td>{payout.method?.replace('_', ' ') || 'Bank Transfer'}</td>
                <td>
                  <span className={`status-badge ${
                    payout.status === 'completed' ? 'status-delivered' : 
                    payout.status === 'processing' ? 'status-processing' : 
                    'status-pending'
                  }`}>
                    {payout.status}
                  </span>
                </td>
                <td>{new Date(payout.requestDate).toLocaleDateString()}</td>
                <td>
                  {payout.status === 'pending' && (
                    <button 
                      className="btn-approve"
                      onClick={() => handleApprovePayout(payout._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                      }}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayoutsPage;
