import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiCheckCircle, 
  FiClock, 
  FiUser,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiSearch,
  FiFilter,
  FiXCircle,
  FiShoppingBag,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';
import './TransactionsPage.css';

const PayoutsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [payouts, setPayouts] = useState([]);
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

  const boutiqueNames = ['Fashion Hub', 'Tech Store', 'Home & Living', 'Sports Center', 'Beauty World', 'Book Haven', 'Electronic Zone', 'Garden Supplies', 'Pet Paradise', 'Auto Parts'];
  const methods = ['bank_transfer', 'paypal', 'stripe', 'mobile_money'];

  const generatePayouts = (days) => {
    const payoutsData = [];
    for (let i = 0; i < 50; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * days));
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));
      
      payoutsData.push({
        id: `POUT${String(1000 + i)}`,
        boutique: boutiqueNames[Math.floor(Math.random() * boutiqueNames.length)],
        amount: Math.floor(Math.random() * 10000 + 500) + Math.random(),
        status: ['pending', 'processing', 'completed'][Math.floor(Math.random() * 3)],
        method: methods[Math.floor(Math.random() * methods.length)],
        requestDate: date,
        completedDate: null,
        fee: Math.floor(Math.random() * 50 + 5)
      });
    }
    payoutsData.sort((a, b) => b.requestDate - a.requestDate);
    return payoutsData;
  };

  const generateAnalytics = (data) => {
    const totalPayouts = data.reduce((s, p) => s + p.amount, 0);
    const totalFees = data.reduce((s, p) => s + p.fee, 0);
    const pending = data.filter(p => p.status === 'pending').length;
    const processing = data.filter(p => p.status === 'processing').length;
    const completed = data.filter(p => p.status === 'completed').length;
    return { totalPayouts, totalFees, pending, processing, completed, count: data.length, avgAmount: totalPayouts / data.length };
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      const days = parseInt(dateRange);
      const data = generatePayouts(days);
      setPayouts(data);
      setAnalytics(generateAnalytics(data));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = (id) => {
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'processing' } : p));
    setAnalytics(prev => ({ ...prev, pending: prev.pending - 1, processing: prev.processing + 1 }));
  };

  const handleComplete = (id) => {
    const now = new Date();
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'completed', completedDate: now } : p));
    setAnalytics(prev => ({ ...prev, processing: prev.processing - 1, completed: prev.completed + 1 }));
  };

  const handleRefresh = () => fetchData(true);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const dataStr = JSON.stringify({ generatedAt: new Date().toISOString(), analytics, payouts }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url;
      link.download = `payouts-${new Date().toISOString().split('T')[0]}.json`; link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 1000);
  };

  const filteredPayouts = payouts.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) || p.boutique.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage);
  const paginatedPayouts = filteredPayouts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, dateRange]);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'completed': return { bg: '#D1FAE5', text: '#065F46' };
      case 'processing': return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'pending': return { bg: '#FEF3C7', text: '#92400E' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  if (loading || !analytics) {
    return <div className="transactions-page"><div className="loading-spinner"><div className="spinner"></div><p>Loading payouts...</p></div></div>;
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1><FiDollarSign /> Boutique Payouts</h1>
          <p>Manage payout requests from boutiques</p>
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
        <div className="admin-stat-card highlight" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
          <div className="admin-stat-header">
            <span className="admin-stat-title" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Payouts</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}><FiDollarSign size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value" style={{ color: 'white' }}>${(analytics.totalPayouts / 1000).toFixed(1)}K</div>
            <div className="admin-stat-change positive" style={{ color: 'rgba(255,255,255,0.85)' }}><FiArrowUp size={14} /> {analytics.count} payouts</div>
            <div className="admin-stat-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>${analytics.avgAmount.toFixed(0)} avg per payout</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Pending</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}><FiClock size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.pending}</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Awaiting approval</div>
            <div className="admin-stat-sub">Needs action</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Processing</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}><FiActivity size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.processing}</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> In progress</div>
            <div className="admin-stat-sub">Being processed</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Completed</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}><FiCheckCircle size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.completed}</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Successfully paid</div>
            <div className="admin-stat-sub">Total completed</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Avg Amount</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}><FiTrendingUp size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">${analytics.avgAmount.toFixed(0)}</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Per payout</div>
            <div className="admin-stat-sub">Average payout amount</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Total Fees</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}><FiDollarSign size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">${(analytics.totalFees / 1000).toFixed(1)}K</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Processing fees</div>
            <div className="admin-stat-sub">Transaction costs</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Completion Rate</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}><FiCheckCircle size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.count > 0 ? ((analytics.completed / analytics.count) * 100).toFixed(0) : 0}%</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Above target</div>
            <div className="admin-stat-sub">Payouts completed</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Active Boutiques</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563EB' }}><FiShoppingBag size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{boutiqueNames.length}</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Registered boutiques</div>
            <div className="admin-stat-sub">Eligible for payouts</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '2px solid #E5E7EB', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.08)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F9FAFB', padding: '0.5rem 1rem', borderRadius: '10px', border: '2px solid #E5E7EB' }}>
            <FiSearch color="#9CA3AF" />
            <input type="text" placeholder="Search by ID, boutique..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: '0.875rem', color: '#374151' }} />
          </div>
          <div className="date-range-selector">
            <FiFilter />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              style={{ border: "none", outline: "none", boxShadow: "none", background: "transparent", appearance: "none" }}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="transactions-table-container">
        <div style={{ padding: '1rem 1.5rem', background: 'linear-gradient(135deg, #F9FAFB, #F3F4F6)', borderBottom: '2px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiDollarSign color="#3B82F6" /> Payouts</h3>
          <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>{filteredPayouts.length} payouts</span>
        </div>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Payout ID</th>
              <th>Boutique</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayouts.map(payout => {
              const statusStyle = getStatusStyle(payout.status);
              return (
                <tr key={payout.id}>
                  <td className="txn-id">{payout.id}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiUser size={14} />{payout.boutique}</div></td>
                  <td className="amount">${payout.amount.toFixed(2)}</td>
                  <td style={{ color: '#6B7280', fontSize: '0.875rem' }}>{payout.method.replace('_', ' ')}</td>
                  <td><span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.text }}>{payout.status}</span></td>
                  <td style={{ color: '#6B7280', fontSize: '0.875rem' }}>{payout.requestDate.toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {payout.status === 'pending' && (
                        <button onClick={() => handleApprove(payout.id)}
                          style={{ padding: '0.4rem 0.8rem', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                          Approve
                        </button>
                      )}
                      {payout.status === 'processing' && (
                        <button onClick={() => handleComplete(payout.id)}
                          style={{ padding: '0.4rem 0.8rem', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                          Complete
                        </button>
                      )}
                      {payout.status === 'completed' && (
                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Paid</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredPayouts.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}><FiSearch size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} /><p>No payouts match your search</p></div>
        )}
        {filteredPayouts.length > 0 && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Page {currentPage} of {totalPages}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayoutsPage;