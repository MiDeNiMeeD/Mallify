import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiCreditCard, 
  FiCheckCircle, 
  FiClock,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiSearch,
  FiFilter,
  FiXCircle,
  FiUsers,
  FiShoppingBag,
  FiActivity
} from 'react-icons/fi';
import './TransactionsPage.css';

const TransactionsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const dateRanges = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Last Year' }
  ];

  const paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Stripe', 'Mobile Money', 'Bank Transfer'];
  const statuses = ['completed', 'pending', 'failed', 'refunded'];
  const customers = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emma Davis', 'Alex Brown', 'Lisa Anderson', 'Tom Harris', 'Jane Doe', 'Chris Lee', 'Anna White'];
  const boutiques = ['Fashion Hub', 'Tech Store', 'Home & Living', 'Sports Center', 'Beauty World', 'Book Haven', 'Electronic Zone', 'Garden Supplies'];

  const generateTransactions = (days) => {
    const txns = [];
    for (let i = 0; i < 85; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * days));
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));
      
      const amount = Math.floor(Math.random() * 5000 + 50) + Math.random();
      txns.push({
        id: `TXN${String(100000 + i).slice(0, 6)}`,
        customer: customers[Math.floor(Math.random() * customers.length)],
        boutique: boutiques[Math.floor(Math.random() * boutiques.length)],
        amount: parseFloat(amount.toFixed(2)),
        method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        date,
        fee: parseFloat((amount * 0.029 + 0.30).toFixed(2))
      });
    }
    txns.sort((a, b) => b.date - a.date);
    return txns;
  };

  const generateAnalytics = (txns) => {
    const totalVolume = txns.reduce((s, t) => s + t.amount, 0);
    const totalFees = txns.reduce((s, t) => s + t.fee, 0);
    const completed = txns.filter(t => t.status === 'completed').length;
    const pending = txns.filter(t => t.status === 'pending').length;
    const failed = txns.filter(t => t.status === 'failed').length;
    const refunded = txns.filter(t => t.status === 'refunded').length;
    const avgAmount = txns.length > 0 ? totalVolume / txns.length : 0;
    const successRate = txns.length > 0 ? ((completed / txns.length) * 100).toFixed(1) : 0;

    return { totalVolume, totalFees, completed, pending, failed, refunded, avgAmount, successRate, count: txns.length };
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      const days = parseInt(dateRange);
      const txns = generateTransactions(days);
      setTransactions(txns);
      setAnalytics(generateAnalytics(txns));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => fetchData(true);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const dataStr = JSON.stringify({ generatedAt: new Date().toISOString(), analytics, transactions }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 1000);
  };

  // Filter & Pagination
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) || t.customer.toLowerCase().includes(searchTerm.toLowerCase()) || t.boutique.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTxns = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, dateRange]);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'completed': return { bg: '#D1FAE5', text: '#065F46' };
      case 'pending': return { bg: '#FEF3C7', text: '#92400E' };
      case 'failed': return { bg: '#FEE2E2', text: '#991B1B' };
      case 'refunded': return { bg: '#FFEDD5', text: '#9A3412' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  if (loading || !analytics) {
    return <div className="transactions-page"><div className="loading-spinner"><div className="spinner"></div><p>Loading transactions...</p></div></div>;
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1><FiDollarSign /> Payment Transactions</h1>
          <p>Monitor all payment transactions across the platform</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="date-range-selector">
            <FiCalendar /><select value={dateRange} onChange={(e) => setDateRange(e.target.value)} disabled={refreshing}
              style={{ border: "none", outline: "none", boxShadow: "none", background: "transparent", appearance: "none" }}>
              {dateRanges.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <button className="btn-action-header" onClick={handleRefresh} disabled={refreshing}>
            <FiRefreshCw className={refreshing ? 'spinning' : ''} /><span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button className="btn-action-header btn-export" onClick={handleExport} disabled={exporting}>
            <FiDownload /><span>{exporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card highlight" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
          <div className="admin-stat-header">
            <span className="admin-stat-title" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Volume</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}><FiDollarSign size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value" style={{ color: 'white' }}>${(analytics.totalVolume / 1000).toFixed(1)}K</div>
            <div className="admin-stat-change positive" style={{ color: 'rgba(255,255,255,0.85)' }}><FiArrowUp size={14} /> {analytics.successRate}% success rate</div>
            <div className="admin-stat-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>{analytics.count} transactions</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Completed</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}><FiCheckCircle size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.completed}</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> {analytics.completed > 0 ? `${((analytics.completed / analytics.count) * 100).toFixed(0)}%` : '0%'}</div>
            <div className="admin-stat-sub">Successful payments</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Pending</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}><FiClock size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.pending}</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Awaiting confirmation</div>
            <div className="admin-stat-sub">In progress</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Failed</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#DC2626' }}><FiXCircle size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.failed}</div>
            <div className="admin-stat-change negative"><FiArrowDown size={14} /> Needs review</div>
            <div className="admin-stat-sub">Failed payments</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Refunded</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(251, 146, 60, 0.15)', color: '#F97316' }}><FiDollarSign size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.refunded}</div>
            <div className="admin-stat-change negative"><FiArrowDown size={14} /> Refunded orders</div>
            <div className="admin-stat-sub">Total refunds</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Avg Amount</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}><FiTrendingUp size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">${analytics.avgAmount.toFixed(2)}</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Per transaction</div>
            <div className="admin-stat-sub">Average order value</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Total Fees</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}><FiActivity size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">${(analytics.totalFees / 1000).toFixed(1)}K</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Processing fees</div>
            <div className="admin-stat-sub">2.9% + $0.30 per txn</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Success Rate</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}><FiTrendingUp size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.successRate}%</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Above target</div>
            <div className="admin-stat-sub">Payment success rate</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '2px solid #E5E7EB', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.08)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F9FAFB', padding: '0.5rem 1rem', borderRadius: '10px', border: '2px solid #E5E7EB' }}>
            <FiSearch color="#9CA3AF" />
            <input type="text" placeholder="Search by ID, customer, boutique..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: '0.875rem', color: '#374151' }} />
          </div>
          <div className="date-range-selector">
            <FiFilter />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              style={{ border: "none", outline: "none", boxShadow: "none", background: "transparent", appearance: "none" }}>
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="transactions-table-container">
        <div style={{ padding: '1rem 1.5rem', background: 'linear-gradient(135deg, #F9FAFB, #F3F4F6)', borderBottom: '2px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiDollarSign color="#10B981" /> Transactions</h3>
          <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>{filteredTransactions.length} transactions</span>
        </div>
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
            {paginatedTxns.map(txn => {
              const statusStyle = getStatusStyle(txn.status);
              return (
                <tr key={txn.id}>
                  <td className="txn-id">{txn.id}</td>
                  <td>{txn.customer}</td>
                  <td>{txn.boutique}</td>
                  <td className="amount">${txn.amount.toFixed(2)}</td>
                  <td><div className="payment-method"><FiCreditCard />{txn.method}</div></td>
                  <td><span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.text }}>{txn.status}</span></td>
                  <td>{txn.date.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}><FiSearch size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} /><p>No transactions match your search</p></div>
        )}
        {filteredTransactions.length > 0 && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Rows:</span>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: currentPage === 1 ? '#F9FAFB' : 'white', color: currentPage === 1 ? '#D1D5DB' : '#374151', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>{'<<'}</button>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: currentPage === 1 ? '#F9FAFB' : 'white', color: currentPage === 1 ? '#D1D5DB' : '#374151', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>{'<'}</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                const page = start + i;
                if (page > totalPages) return null;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    style={{ padding: '0.35rem 0.7rem', borderRadius: '6px', border: page === currentPage ? '1px solid #10B981' : '1px solid #E5E7EB', background: page === currentPage ? '#10B981' : 'white', color: page === currentPage ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: page === currentPage ? 700 : 500 }}>
                    {page}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: currentPage === totalPages ? '#F9FAFB' : 'white', color: currentPage === totalPages ? '#D1D5DB' : '#374151', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>{'>'}</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: currentPage === totalPages ? '#F9FAFB' : 'white', color: currentPage === totalPages ? '#D1D5DB' : '#374151', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>{'>>'}</button>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Page {currentPage} of {totalPages}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;