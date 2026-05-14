import React, { useState, useEffect } from 'react';
import { 
  FiAlertTriangle, 
  FiDollarSign, 
  FiCheckCircle, 
  FiXCircle,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiSearch,
  FiFilter,
  FiClock,
  FiUser,
  FiShoppingBag,
  FiActivity,
  FiShield,
  FiThumbsUp,
  FiThumbsDown
} from 'react-icons/fi';
import './TransactionsPage.css';

const PaymentDisputesPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [disputes, setDisputes] = useState([]);
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

  const reasons = ['Unauthorized charge', 'Incorrect amount', 'Double charge', 'Product not received', 'Service not rendered', 'Fraudulent transaction', 'Subscription issue', 'Quality dispute'];
  const statuses = ['open', 'investigating', 'resolved', 'rejected'];
  const customerNames = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emma Davis', 'Alex Brown', 'Lisa Anderson', 'Tom Harris', 'Jane Doe'];

  const generateDisputes = (days) => {
    const data = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * days));
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));
      
      const amount = Math.floor(Math.random() * 2000 + 50) + Math.random();
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      data.push({
        id: `DSP${String(1000 + i)}`,
        customer: customerNames[Math.floor(Math.random() * customerNames.length)],
        boutique: ['Fashion Hub', 'Tech Store', 'Home & Living', 'Sports Center', 'Beauty World'][Math.floor(Math.random() * 5)],
        amount: parseFloat(amount.toFixed(2)),
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status,
        date,
        resolvedDate: status === 'resolved' || status === 'rejected' ? new Date(date.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000) : null,
        transactionId: `TXN${String(200000 + Math.floor(Math.random() * 100000)).slice(0, 6)}`
      });
    }
    data.sort((a, b) => b.date - a.date);
    return data;
  };

  const generateAnalytics = (data) => {
    const totalAmount = data.reduce((s, d) => s + d.amount, 0);
    const open = data.filter(d => d.status === 'open').length;
    const investigating = data.filter(d => d.status === 'investigating').length;
    const resolved = data.filter(d => d.status === 'resolved').length;
    const rejected = data.filter(d => d.status === 'rejected').length;
    const avgAmount = data.length > 0 ? totalAmount / data.length : 0;
    const resolutionRate = data.length > 0 ? (((resolved + rejected) / data.length) * 100).toFixed(1) : 0;

    return { total: data.length, totalAmount, open, investigating, resolved, rejected, avgAmount, resolutionRate, count: data.length };
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      const days = parseInt(dateRange);
      const data = generateDisputes(days);
      setDisputes(data);
      setAnalytics(generateAnalytics(data));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleResolve = (id, resolution) => {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: resolution === 'refund' ? 'resolved' : 'rejected', resolvedDate: new Date() } : d));
  };

  const handleRefresh = () => fetchData(true);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const dataStr = JSON.stringify({ generatedAt: new Date().toISOString(), analytics, disputes }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url;
      link.download = `disputes-${new Date().toISOString().split('T')[0]}.json`; link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 1000);
  };

  const filteredDisputes = disputes.filter(d => {
    const matchesSearch = d.id.toLowerCase().includes(searchTerm.toLowerCase()) || d.customer.toLowerCase().includes(searchTerm.toLowerCase()) || d.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage);
  const paginatedDisputes = filteredDisputes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, dateRange]);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'open': return { bg: '#FEE2E2', text: '#991B1B', icon: FiAlertTriangle };
      case 'investigating': return { bg: '#FEF3C7', text: '#92400E', icon: FiClock };
      case 'resolved': return { bg: '#D1FAE5', text: '#065F46', icon: FiCheckCircle };
      case 'rejected': return { bg: '#FFEDD5', text: '#9A3412', icon: FiXCircle };
      default: return { bg: '#F3F4F6', text: '#374151', icon: FiActivity };
    }
  };

  if (loading || !analytics) {
    return <div className="transactions-page"><div className="loading-spinner"><div className="spinner"></div><p>Loading disputes...</p></div></div>;
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1><FiAlertTriangle /> Payment Disputes</h1>
          <p>Resolve payment-related disputes and chargebacks</p>
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
        <div className="admin-stat-card highlight" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
          <div className="admin-stat-header">
            <span className="admin-stat-title" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Disputes</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}><FiAlertTriangle size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value" style={{ color: 'white' }}>{analytics.total}</div>
            <div className="admin-stat-change positive" style={{ color: 'rgba(255,255,255,0.85)' }}><FiArrowUp size={14} /> {analytics.resolutionRate}% resolved</div>
            <div className="admin-stat-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>${(analytics.totalAmount / 1000).toFixed(1)}K total disputed</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Open</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#DC2626' }}><FiAlertTriangle size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.open}</div>
            <div className="admin-stat-change negative"><FiArrowUp size={14} /> Requires action</div>
            <div className="admin-stat-sub">New disputes</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Investigating</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}><FiClock size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.investigating}</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Being reviewed</div>
            <div className="admin-stat-sub">Under investigation</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Resolved</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}><FiCheckCircle size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.resolved}</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Refunded/Resolved</div>
            <div className="admin-stat-sub">Completed resolutions</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Rejected</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(251, 146, 60, 0.15)', color: '#F97316' }}><FiXCircle size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.rejected}</div>
            <div className="admin-stat-change negative"><FiArrowDown size={14} /> Disputed rejected</div>
            <div className="admin-stat-sub">Dismissed disputes</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Avg Dispute</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}><FiDollarSign size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">${analytics.avgAmount.toFixed(0)}</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Average amount</div>
            <div className="admin-stat-sub">Per dispute</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Resolution Rate</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}><FiThumbsUp size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.resolutionRate}%</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> Cases resolved</div>
            <div className="admin-stat-sub">Of all disputes</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Total Value</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}><FiShield size={22} /></div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">${(analytics.totalAmount / 1000).toFixed(1)}K</div>
            <div className="admin-stat-change positive"><FiArrowUp size={14} /> In disputed funds</div>
            <div className="admin-stat-sub">Total amount at risk</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '2px solid #E5E7EB', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.08)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F9FAFB', padding: '0.5rem 1rem', borderRadius: '10px', border: '2px solid #E5E7EB' }}>
            <FiSearch color="#9CA3AF" />
            <input type="text" placeholder="Search by ID, customer, reason..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: '0.875rem', color: '#374151' }} />
          </div>
          <div className="date-range-selector">
            <FiFilter />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              style={{ border: "none", outline: "none", boxShadow: "none", background: "transparent", appearance: "none" }}>
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="transactions-table-container">
        <div style={{ padding: '1rem 1.5rem', background: 'linear-gradient(135deg, #F9FAFB, #F3F4F6)', borderBottom: '2px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiAlertTriangle color="#EF4444" /> Disputes</h3>
          <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>{filteredDisputes.length} disputes</span>
        </div>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Dispute ID</th>
              <th>Customer</th>
              <th>Boutique</th>
              <th>Reason</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDisputes.map(dispute => {
              const statusStyle = getStatusStyle(dispute.status);
              const StatusIcon = statusStyle.icon;
              return (
                <tr key={dispute.id}>
                  <td className="txn-id">{dispute.id}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiUser size={14} />{dispute.customer}</div></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiShoppingBag size={14} />{dispute.boutique}</div></td>
                  <td style={{ color: '#374151', fontSize: '0.875rem' }}>{dispute.reason}</td>
                  <td className="amount">${dispute.amount.toFixed(2)}</td>
                  <td><span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.text, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><StatusIcon size={12} />{dispute.status}</span></td>
                  <td style={{ color: '#6B7280', fontSize: '0.8rem' }}>{dispute.date.toLocaleDateString()}</td>
                  <td>
                    {(dispute.status === 'open' || dispute.status === 'investigating') && (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button onClick={() => handleResolve(dispute.id, 'refund')}
                          style={{ padding: '0.35rem 0.6rem', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <FiThumbsUp size={10} /> Refund
                        </button>
                        <button onClick={() => handleResolve(dispute.id, 'reject')}
                          style={{ padding: '0.35rem 0.6rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <FiThumbsDown size={10} /> Reject
                        </button>
                      </div>
                    )}
                    {(dispute.status === 'resolved' || dispute.status === 'rejected') && (
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>
                        {dispute.resolvedDate?.toLocaleDateString()}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredDisputes.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}><FiSearch size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} /><p>No disputes match your search</p></div>
        )}
        {filteredDisputes.length > 0 && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Page {currentPage} of {totalPages}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDisputesPage;