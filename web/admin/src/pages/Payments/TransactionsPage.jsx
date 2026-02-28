import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiCreditCard, FiCheckCircle, FiClock } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import './TransactionsPage.css';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getOrders();
      // Transform orders into transactions
      const txns = response.data?.filter(o => o.paymentStatus !== 'pending').map(order => ({
        ...order,
        transactionId: order.paymentId || order.orderNumber,
        amount: order.totalAmount,
        date: order.createdAt,
        status: order.paymentStatus || 'completed',
      })) || [];
      setTransactions(txns);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    count: transactions.length,
  };

  if (loading) {
    return <div className="transactions-page"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1><FiDollarSign /> Payment Transactions</h1>
          <p>Monitor all payment transactions across the platform</p>
        </div>
      </div>

      <div className="transactions-stats">
        <div className="stat-card">
          <FiDollarSign className="stat-icon" />
          <div className="stat-details">
            <h3>${(stats.total / 1000).toFixed(1)}K</h3>
            <p>Total Volume</p>
          </div>
        </div>
        <div className="stat-card">
          <FiTrendingUp className="stat-icon revenue" />
          <div className="stat-details">
            <h3>{stats.count}</h3>
            <p>Transactions</p>
          </div>
        </div>
        <div className="stat-card">
          <FiCheckCircle className="stat-icon delivered" />
          <div className="stat-details">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <FiClock className="stat-icon pending" />
          <div className="stat-details">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Customer</th>
              <th>Boutique</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(txn => (
              <tr key={txn._id}>
                <td className="txn-id">{txn.transactionId}</td>
                <td>{txn.userId?.name || 'N/A'}</td>
                <td>{txn.boutiqueId?.name || 'Multiple'}</td>
                <td className="amount">${(txn.amount || 0).toFixed(2)}</td>
                <td>
                  <div className="payment-method">
                    <FiCreditCard />
                    {txn.paymentMethod || 'Card'}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${txn.status === 'completed' ? 'status-delivered' : 'status-pending'}`}>
                    {txn.status || 'completed'}
                  </span>
                </td>
                <td>{new Date(txn.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsPage;
