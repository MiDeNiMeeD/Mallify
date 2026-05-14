import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiInbox,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiEye
} from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const REVIEW_STATUSES = ['pending', 'submitted', 'under_review', 'in_review', 'needs_info', 'info_required'];
const STAGE_LABELS = {
  awaiting: 'Awaiting Review',
  review: 'In Review',
  needs_info: 'Needs Info'
};
const STAGE_OPTIONS = [
  { value: 'all', label: 'All stages' },
  { value: 'awaiting', label: STAGE_LABELS.awaiting },
  { value: 'review', label: STAGE_LABELS.review },
  { value: 'needs_info', label: STAGE_LABELS.needs_info }
];
const ITEMS_PER_PAGE = 8;

const normalizeStatus = (status = '') => status.toLowerCase();

const getStageKey = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === 'under_review' || normalized === 'in_review') {
    return 'review';
  }
  if (normalized === 'needs_info' || normalized === 'info_required') {
    return 'needs_info';
  }
  return 'awaiting';
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

const getAgeInDays = (value) => {
  if (!value) return 0;
  const created = new Date(value);
  if (Number.isNaN(created.getTime())) return 0;
  const diff = Date.now() - created.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

const PendingBoutiquesPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stageFilter, sortDirection, requests]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const [boutiquesResponse, applicationsResponse] = await Promise.all([
        apiClient.getBoutiques({ limit: 200 }),
        apiClient.getBoutiqueApplications({ limit: 200 })
      ]);

      const boutiques = (boutiquesResponse.data?.boutiques || [])
        .map((item) => ({
          _id: item._id,
          name: item.name,
          ownerName: item.ownerName,
          email: item.email,
          phone: item.phone,
          status: item.status,
          createdAt: item.createdAt,
          productCount: item.productCount || 0,
          totalSales: item.totalSales || 0,
          totalOrders: item.totalOrders || 0,
          source: 'boutique'
        }))
        .filter((item) => REVIEW_STATUSES.includes(normalizeStatus(item.status)));

      const applications = (applicationsResponse.data?.applications || [])
        .map((app) => ({
          _id: app._id,
          name: app.boutiqueName,
          ownerName: app.ownerName,
          email: app.email,
          phone: app.phone,
          status: app.status,
          createdAt: app.submittedAt || app.createdAt,
          productCount: app.productCount || 0,
          totalSales: app.totalSales || 0,
          totalOrders: app.totalOrders || 0,
          source: 'application'
        }))
        .filter((item) => REVIEW_STATUSES.includes(normalizeStatus(item.status)));

      setRequests([...boutiques, ...applications]);
    } catch (fetchError) {
      console.error('Error loading pending boutiques', fetchError);
      setError('Unable to load pending boutiques right now. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return [...requests]
      .filter((item) => {
        if (!searchTerm) return true;
        const query = searchTerm.toLowerCase();
        return (
          item.name?.toLowerCase().includes(query) ||
          item.email?.toLowerCase().includes(query) ||
          item.ownerName?.toLowerCase().includes(query)
        );
      })
      .filter((item) => {
        if (stageFilter === 'all') return true;
        return getStageKey(item.status) === stageFilter;
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        if (sortDirection === 'asc') {
          return aTime - bTime;
        }
        return bTime - aTime;
      });
  }, [requests, searchTerm, stageFilter, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const stats = useMemo(() => {
    const awaiting = requests.filter((req) => getStageKey(req.status) === 'awaiting').length;
    const review = requests.filter((req) => getStageKey(req.status) === 'review').length;
    const needsInfo = requests.filter((req) => getStageKey(req.status) === 'needs_info').length;
    const overdue = requests.filter((req) => getAgeInDays(req.createdAt) >= 7).length;
    return {
      total: requests.length,
      awaiting,
      review,
      needsInfo,
      overdue
    };
  }, [requests]);

  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="loading-spinner" />
          <p>Loading pending boutiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pending Boutiques</h1>
          <p className="page-subtitle">Triage and advance applications waiting for approval</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Total Pending</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}>
              <FiInbox size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{stats.total.toLocaleString()}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Awaiting Review</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#3B82F6' }}>
              <FiClock size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{stats.awaiting.toLocaleString()}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">In Review</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
              <FiCheckCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{stats.review.toLocaleString()}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Need Attention</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#DC2626' }}>
              <FiAlertTriangle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{(stats.needsInfo + stats.overdue).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="filters-row">
        <div className="filter-group">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by boutique, owner, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-group" style={{ maxWidth: '220px' }}>
          <select
            className="form-select"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            {STAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-actions" style={{ gap: '0.5rem' }}>
          <button
            type="button"
            className="ghost-button"
            onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          >
            {sortDirection === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            <span>{sortDirection === 'asc' ? 'Oldest first' : 'Newest first'}</span>
          </button>
          <button type="button" className="ghost-button" onClick={fetchPendingRequests}>
            <FiRefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="content-card" style={{ borderColor: 'var(--danger-color)' }}>
          <div className="card-body" style={{ color: 'var(--danger-color)' }}>
            {error}
          </div>
        </div>
      )}

      <div className="content-with-sidebar">
        <div className="content-card flex-grow">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Review Queue</h3>
            <p className="page-subtitle" style={{ margin: 0 }}>
              {filteredRequests.length} application{filteredRequests.length === 1 ? '' : 's'} ready for action
            </p>
          </div>
          <div className="card-body">
            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <FiInbox className="empty-state-icon" />
                <div className="empty-state-title">No pending boutiques match your filters</div>
              </div>
            ) : (
              <>
                <table className="data-table" style={{ minWidth: '100%', width: 'max-content' }}>
                  <thead>
                    <tr>
                      <th style={{ minWidth: '220px' }}>Boutique</th>
                      <th style={{ minWidth: '150px' }}>Owner</th>
                      <th style={{ minWidth: '120px' }}>Submitted</th>
                      <th style={{ minWidth: '120px' }}>Stage</th>
                      <th style={{ minWidth: '100px' }}>Days Open</th>
                      <th style={{ minWidth: '110px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRequests.map((request) => {
                      const stageKey = getStageKey(request.status);
                      const ageInDays = getAgeInDays(request.createdAt);
                      const overdue = ageInDays >= 7;
                      return (
                        <tr key={request._id}>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <span style={{ fontWeight: 600 }}>{request.name || 'Unnamed Boutique'}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {request.email || 'No email provided'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <span>{request.ownerName || 'Unknown owner'}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {request.phone || 'No phone provided'}
                              </span>
                            </div>
                          </td>
                          <td>{formatDate(request.createdAt)}</td>
                          <td>
                            <span className={`stage-pill ${stageKey}`}>
                              {STAGE_LABELS[stageKey]}
                            </span>
                          </td>
                          <td>
                            <span className={overdue ? 'overdue-badge' : ''}>
                              {ageInDays} day{ageInDays === 1 ? '' : 's'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => navigate(`/boutiques/${request._id}`)}
                            >
                              <FiEye size={14} />
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredRequests.length > ITEMS_PER_PAGE && (
                  <div className="pagination">
                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                    {getPageNumbers().map((page) => (
                      <button
                        type="button"
                        key={page}
                        className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingBoutiquesPage;
