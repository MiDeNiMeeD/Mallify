import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiTarget,
  FiTrendingUp,
  FiRefreshCw,
  FiFilter,
  FiActivity,
  FiCheckCircle,
  FiAlertTriangle,
  FiEye
} from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const VERIFIED_STATUSES = ['active', 'verified', 'approved', 'live'];
const WATCHLIST_STATUSES = ['suspended', 'paused', 'at_risk'];
const ITEMS_PER_PAGE = 8;

const getSalesValue = (item) => {
  if (!item) return 0;
  const value = Number(item.totalSales);
  return Number.isFinite(value) ? value : 0;
};

const getOrdersValue = (item) => {
  if (!item) return 0;
  const value = Number(item.totalOrders);
  return Number.isFinite(value) ? value : 0;
};

const getHealthBucket = (item) => {
  const sales = getSalesValue(item);
  const orders = getOrdersValue(item);
  if (sales >= 50000 || orders >= 400) return 'thriving';
  if (sales <= 5000 || orders <= 60 || WATCHLIST_STATUSES.includes((item.status || '').toLowerCase())) {
    return 'watch';
  }
  return 'steady';
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
};

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value || 0);

const VerifiedBoutiquesPage = () => {
  const navigate = useNavigate();
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortKey, setSortKey] = useState('sales');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchVerifiedBoutiques();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, healthFilter, sortKey, sortDirection, boutiques]);

  const fetchVerifiedBoutiques = async () => {
    try {
      setLoading(true);
      setError('');

      const [boutiquesResponse, applicationsResponse] = await Promise.all([
        apiClient.getBoutiques({ limit: 200 }),
        apiClient.getBoutiqueApplications({ limit: 200 })
      ]);

      const boutiquesData = (boutiquesResponse.data?.boutiques || []).map((item) => ({
        ...item,
        dataSource: 'boutique'
      }));

      const approvedApplications = (applicationsResponse.data?.applications || [])
        .filter((app) => VERIFIED_STATUSES.includes((app.status || '').toLowerCase()))
        .map((app) => ({
          _id: app._id,
          name: app.boutiqueName,
          email: app.email,
          ownerName: app.ownerName,
          phone: app.phone,
          status: app.status,
          createdAt: app.submittedAt || app.createdAt,
          totalSales: app.totalSales || 0,
          totalOrders: app.totalOrders || 0,
          productCount: app.productCount || 0,
          dataSource: 'application'
        }));

      const verified = [...boutiquesData, ...approvedApplications].filter((item) =>
        VERIFIED_STATUSES.includes((item.status || '').toLowerCase())
      );

      setBoutiques(verified);
    } catch (fetchError) {
      console.error('Error loading verified boutiques', fetchError);
      setError('Unable to load verified boutiques at the moment. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBoutiques = useMemo(() => {
    return boutiques
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
        if (statusFilter === 'all') return true;
        if (statusFilter === 'watch') {
          return WATCHLIST_STATUSES.includes((item.status || '').toLowerCase());
        }
        return (item.status || '').toLowerCase() === statusFilter;
      })
      .filter((item) => {
        if (healthFilter === 'all') return true;
        return getHealthBucket(item) === healthFilter;
      });
  }, [boutiques, searchTerm, statusFilter, healthFilter]);

  const sortedBoutiques = useMemo(() => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    return [...filteredBoutiques].sort((a, b) => {
      let aValue = 0;
      let bValue = 0;

      if (sortKey === 'sales') {
        aValue = getSalesValue(a);
        bValue = getSalesValue(b);
      } else if (sortKey === 'orders') {
        aValue = getOrdersValue(a);
        bValue = getOrdersValue(b);
      } else if (sortKey === 'products') {
        aValue = Number(a.productCount || 0);
        bValue = Number(b.productCount || 0);
      } else if (sortKey === 'recent') {
        aValue = new Date(a.createdAt || 0).getTime();
        bValue = new Date(b.createdAt || 0).getTime();
      }

      if (aValue === bValue) return 0;
      return aValue > bValue ? direction : -direction;
    });
  }, [filteredBoutiques, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedBoutiques.length / ITEMS_PER_PAGE));
  const paginatedBoutiques = sortedBoutiques.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const stats = useMemo(() => {
    if (!boutiques.length) {
      return {
        total: 0,
        avgSales: 0,
        avgOrders: 0,
        thriving: 0,
        watch: 0
      };
    }

    const totalSales = boutiques.reduce((sum, item) => sum + getSalesValue(item), 0);
    const totalOrders = boutiques.reduce((sum, item) => sum + getOrdersValue(item), 0);
    const thriving = boutiques.filter((item) => getHealthBucket(item) === 'thriving').length;
    const watch = boutiques.filter((item) => getHealthBucket(item) === 'watch').length;

    return {
      total: boutiques.length,
      avgSales: totalSales / boutiques.length,
      avgOrders: totalOrders / boutiques.length,
      thriving,
      watch
    };
  }, [boutiques]);

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
          <p>Loading verified boutiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Approved Boutiques</h1>
          <p className="page-subtitle">Track performance across approved partners and keep growth momentum</p>
        </div>
        <div className="filter-actions" style={{ gap: '0.5rem' }}>
          <button type="button" className="ghost-button" onClick={fetchVerifiedBoutiques}>
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Verified Network</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
              <FiCheckCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{stats.total.toLocaleString()}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Avg. Sales</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}>
              <FiTrendingUp size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{formatCurrency(stats.avgSales)}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Avg. Orders</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#3B82F6' }}>
              <FiActivity size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{formatNumber(Math.round(stats.avgOrders))}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Watchlist</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#DC2626' }}>
              <FiAlertTriangle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{stats.watch.toLocaleString()}</div>
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
              placeholder="Search verified boutiques by name, owner, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-group" style={{ maxWidth: '180px' }}>
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="verified">Verified</option>
            <option value="approved">Approved</option>
            <option value="watch">Watchlist</option>
          </select>
        </div>
        <div className="filter-group" style={{ maxWidth: '180px' }}>
          <select className="form-select" value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)}>
            <option value="all">All health states</option>
            <option value="thriving">Thriving</option>
            <option value="steady">Steady</option>
            <option value="watch">Watchlist</option>
          </select>
        </div>
        <div className="filter-actions" style={{ gap: '0.5rem' }}>
          <div className="sort-group">
            <span className="sort-label">Sort by:</span>
            <button
              type="button"
              className={`ghost-button ${sortKey === 'sales' ? 'active' : ''}`}
              onClick={() => setSortKey('sales')}
            >
              <FiTrendingUp size={14} /> Revenue
            </button>
            <button
              type="button"
              className={`ghost-button ${sortKey === 'orders' ? 'active' : ''}`}
              onClick={() => setSortKey('orders')}
            >
              <FiActivity size={14} /> Orders
            </button>
            <button
              type="button"
              className={`ghost-button ${sortKey === 'products' ? 'active' : ''}`}
              onClick={() => setSortKey('products')}
            >
              <FiTarget size={14} /> Inventory
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              title="Toggle sort direction"
            >
              <FiFilter size={14} /> {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="content-card" style={{ borderColor: 'var(--danger-color)' }}>
          <div className="card-body" style={{ color: 'var(--danger-color)' }}>{error}</div>
        </div>
      )}

      <div className="content-with-sidebar">
        <div className="content-card flex-grow">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 className="card-title">Performance Table</h3>
              <p className="page-subtitle" style={{ margin: 0 }}>
                {filteredBoutiques.length} boutique{filteredBoutiques.length === 1 ? '' : 's'} match your filters
              </p>
            </div>
          </div>
          <div className="card-body">
            {filteredBoutiques.length === 0 ? (
              <div className="empty-state">
                <FiTarget className="empty-state-icon" />
                <div className="empty-state-title">No verified boutiques found</div>
                <p className="empty-state-text">Try clearing filters or refreshing data.</p>
              </div>
            ) : (
              <>
                <table className="data-table" style={{ minWidth: '100%', width: 'max-content' }}>
                  <thead>
                    <tr>
                      <th style={{ minWidth: '220px' }}>Boutique</th>
                      <th style={{ minWidth: '150px' }}>Owner</th>
                      <th style={{ minWidth: '140px' }}>Revenue</th>
                      <th style={{ minWidth: '120px' }}>Orders</th>
                      <th style={{ minWidth: '120px' }}>Inventory</th>
                      <th style={{ minWidth: '140px' }}>Health</th>
                      <th style={{ minWidth: '110px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBoutiques.map((boutique) => {
                      const health = getHealthBucket(boutique);
                      return (
                        <tr key={boutique._id}>
                          <td>
                            <div className="table-primary">
                              <span className="table-title">{boutique.name || 'Unnamed Boutique'}</span>
                              <span className="table-subtitle">{boutique.email || 'No email'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="table-primary">
                              <span className="table-title">{boutique.ownerName || 'Unknown owner'}</span>
                              <span className="table-subtitle">{boutique.phone || 'No phone'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="table-metric">
                              <span>{formatCurrency(getSalesValue(boutique))}</span>
                              <small>Total</small>
                            </div>
                          </td>
                          <td>
                            <div className="table-metric">
                              <span>{formatNumber(getOrdersValue(boutique))}</span>
                              <small>Orders</small>
                            </div>
                          </td>
                          <td>
                            <div className="table-metric">
                              <span>{formatNumber(boutique.productCount || 0)}</span>
                              <small>Items</small>
                            </div>
                          </td>
                          <td>
                            <span className={`health-pill ${health}`}>
                              {health === 'thriving' ? 'Thriving' : health === 'steady' ? 'Steady' : 'Watchlist'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => navigate(`/boutiques/${boutique._id}`)}
                            >
                              <FiEye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredBoutiques.length > ITEMS_PER_PAGE && (
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

export default VerifiedBoutiquesPage;
