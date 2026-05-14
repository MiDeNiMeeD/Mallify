import React, { useState, useEffect } from 'react';
import { 
  FiEye, 
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiSearch,
  FiFilter,
  FiUserCheck,
  FiAlertCircle,
  FiShield,
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiClock
} from 'react-icons/fi';
import './SystemPages.css';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const dateRanges = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Last Year' }
  ];

  const actions = ['User Login', 'Boutique Approved', 'Order Refund', 'User Created', 'User Deleted', 'Role Changed', 'Payment Processed', 'Dispute Resolved', 'Settings Updated', 'Boutique Suspended', 'Driver Approved', 'Promotion Created'];
  const users = ['admin@mallify.com', 'support@mallify.com', 'superadmin@mallify.com', 'finance@mallify.com', 'manager@mallify.com'];
  const statuses = ['success', 'failed', 'pending', 'warning'];

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return { bg: '#D1FAE5', text: '#065F46' };
      case 'failed': return { bg: '#FEE2E2', text: '#991B1B' };
      case 'pending': return { bg: '#FEF3C7', text: '#92400E' };
      case 'warning': return { bg: '#FFEDD5', text: '#9A3412' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return FiCheckCircle;
      case 'failed': return FiXCircle;
      case 'pending': return FiClock;
      case 'warning': return FiAlertCircle;
      default: return FiActivity;
    }
  };

  const generateLogs = (days) => {
    const generatedLogs = [];
    const totalEntries = Math.floor(Math.random() * 50 + 80);
    
    for (let i = 0; i < totalEntries; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * days));
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      
      generatedLogs.push({
        id: i + 1,
        action,
        user,
        timestamp: date,
        status,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        details: `${action} by ${user}`
      });
    }

    // Sort by timestamp descending
    generatedLogs.sort((a, b) => b.timestamp - a.timestamp);
    return generatedLogs;
  };

  const generateAnalytics = (logsData) => {
    const total = logsData.length;
    const successful = logsData.filter(l => l.status === 'success').length;
    const failed = logsData.filter(l => l.status === 'failed').length;
    const pending = logsData.filter(l => l.status === 'pending').length;
    const warnings = logsData.filter(l => l.status === 'warning').length;
    
    const actionCounts = {};
    logsData.forEach(l => {
      actionCounts[l.action] = (actionCounts[l.action] || 0) + 1;
    });
    
    const userCounts = {};
    logsData.forEach(l => {
      userCounts[l.user] = (userCounts[l.user] || 0) + 1;
    });

    const uniqueUsers = Object.keys(userCounts).length;
    const mostActiveUser = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const mostCommonAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      total,
      successful,
      failed,
      pending,
      warnings,
      uniqueUsers,
      mostActiveUser,
      mostCommonAction,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(1) : 0,
      failureRate: total > 0 ? ((failed / total) * 100).toFixed(1) : 0
    };
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 600));
      
      const days = parseInt(dateRange);
      const generatedLogs = generateLogs(days);
      const generatedAnalytics = generateAnalytics(generatedLogs);

      setLogs(generatedLogs);
      setAnalytics(generatedAnalytics);
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
      const exportData = {
        dateRange: `${dateRange} days`,
        generatedAt: new Date().toISOString(),
        analytics,
        logs
      };
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${dateRange}days-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 1000);
  };

  // Filter logs (defined before pagination logic)
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.ip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesStatus && matchesAction;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, actionFilter, dateRange]);

  if (loading || !analytics) {
    return (
      <div className="system-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-page">
      <div className="page-header">
        <div>
          <h1><FiEye /> Audit Logs</h1>
          <p>Track all administrative actions and system events</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="date-range-selector">
            <FiCalendar />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              disabled={refreshing}
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
                appearance: "none",
              }}
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
          <button 
            className="btn-action-header"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
          >
            <FiRefreshCw className={refreshing ? 'spinning' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button 
            className="btn-action-header btn-export"
            onClick={handleExport}
            disabled={exporting}
            title="Export data"
          >
            <FiDownload />
            <span>{exporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-stat-card highlight" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
          <div className="admin-stat-header">
            <span className="admin-stat-title" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Events</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF' }}>
              <FiActivity size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value" style={{ color: 'white' }}>{analytics.total.toLocaleString()}</div>
            <div className="admin-stat-change positive" style={{ color: 'rgba(255,255,255,0.85)' }}>
              <FiArrowUp size={14} /> {analytics.successRate}% success rate
            </div>
            <div className="admin-stat-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>This period</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Successful</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
              <FiCheckCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.successful.toLocaleString()}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> {((analytics.successful / analytics.total) * 100).toFixed(1)}% of total
            </div>
            <div className="admin-stat-sub">Completed actions</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Failed</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#DC2626' }}>
              <FiXCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.failed.toLocaleString()}</div>
            <div className="admin-stat-change negative">
              <FiArrowDown size={14} /> {analytics.failureRate}% failure rate
            </div>
            <div className="admin-stat-sub">Requires attention</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Unique Actors</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}>
              <FiUserCheck size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.uniqueUsers}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> {analytics.mostActiveUser.split('@')[0]}
            </div>
            <div className="admin-stat-sub">Most active admin</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Pending</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
              <FiClock size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.pending.toLocaleString()}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> Awaiting completion
            </div>
            <div className="admin-stat-sub">In progress actions</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Warnings</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(251, 146, 60, 0.15)', color: '#F97316' }}>
              <FiAlertCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.warnings.toLocaleString()}</div>
            <div className="admin-stat-change negative">
              <FiArrowDown size={14} /> Needs review
            </div>
            <div className="admin-stat-sub">Suspicious activity</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Most Common</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED' }}>
              <FiShield size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value" style={{ fontSize: '1.5rem' }}>{analytics.mostCommonAction}</div>
            <div className="admin-stat-sub">Most frequent action</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Security Events</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#DC2626' }}>
              <FiShield size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.failed + analytics.warnings}</div>
            <div className="admin-stat-change negative">
              <FiArrowDown size={14} /> Requires monitoring
            </div>
            <div className="admin-stat-sub">Failed + warnings</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '2px solid #E5E7EB',
        boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F9FAFB', padding: '0.5rem 1rem', borderRadius: '10px', border: '2px solid #E5E7EB' }}>
            <FiSearch color="#9CA3AF" />
            <input 
              type="text" 
              placeholder="Search actions, users, IP addresses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                border: 'none', 
                outline: 'none', 
                background: 'transparent', 
                flex: 1,
                fontSize: '0.875rem',
                color: '#374151'
              }}
            />
          </div>
          <div className="date-range-selector">
            <FiFilter />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
                appearance: "none",
              }}
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="warning">Warning</option>
            </select>
          </div>
          <div className="date-range-selector">
            <FiActivity />
            <select 
              value={actionFilter} 
              onChange={(e) => setActionFilter(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
                appearance: "none",
              }}
            >
              <option value="all">All Actions</option>
              {actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="logs-table">
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.1)'
        }}>
          <div style={{ 
            padding: '1rem 1.5rem', 
            background: 'linear-gradient(135deg, #F9FAFB, #F3F4F6)',
            borderBottom: '2px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiEye /> Activity Log
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredLogs.length)}-{Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} events
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#7C3AED' }}>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>IP Address</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timestamp</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'center', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log, i) => {
                  const statusColor = getStatusColor(log.status);
                  const StatusIcon = getStatusIcon(log.status);
                  return (
                    <tr 
                      key={log.id} 
                      style={{ 
                        borderBottom: i < filteredLogs.length - 1 ? '1px solid #F3F4F6' : 'none',
                        transition: 'background 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.875rem 1.25rem', fontWeight: 500, color: '#111827', fontSize: '0.875rem' }}>{log.action}</td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#374151', fontSize: '0.875rem' }}>{log.user}</td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#6B7280', fontSize: '0.8rem', fontFamily: 'monospace' }}>{log.ip}</td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#6B7280', fontSize: '0.8rem' }}>{log.timestamp.toLocaleString()}</td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '0.35rem 0.85rem', 
                          background: statusColor.bg, 
                          color: statusColor.text, 
                          borderRadius: '8px', 
                          fontSize: '0.75rem', 
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <StatusIcon size={12} />
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredLogs.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>
              <FiSearch size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>No audit logs match your search criteria</p>
            </div>
          )}

          {/* Pagination */}
          {filteredLogs.length > 0 && (
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  style={{
                    padding: '0.35rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    background: '#F9FAFB',
                    fontSize: '0.8rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    background: currentPage === 1 ? '#F9FAFB' : 'white',
                    color: currentPage === 1 ? '#D1D5DB' : '#374151',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                  title="First page"
                >
                  {'<<'}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    background: currentPage === 1 ? '#F9FAFB' : 'white',
                    color: currentPage === 1 ? '#D1D5DB' : '#374151',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                  title="Previous page"
                >
                  {'<'}
                </button>

                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: '0.35rem 0.7rem',
                      borderRadius: '6px',
                      border: page === currentPage ? '1px solid #7C3AED' : '1px solid #E5E7EB',
                      background: page === currentPage ? '#7C3AED' : 'white',
                      color: page === currentPage ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: page === currentPage ? 700 : 500,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    background: currentPage === totalPages ? '#F9FAFB' : 'white',
                    color: currentPage === totalPages ? '#D1D5DB' : '#374151',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                  title="Next page"
                >
                  {'>'}
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    background: currentPage === totalPages ? '#F9FAFB' : 'white',
                    color: currentPage === totalPages ? '#D1D5DB' : '#374151',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                  title="Last page"
                >
                  {'>>'}
                </button>
              </div>

              <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;