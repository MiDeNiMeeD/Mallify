import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiCheckCircle, FiClock, FiXCircle, FiEye, FiChevronUp, FiChevronDown, FiSliders } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const ITEMS_PER_PAGE = 8;

const AllBoutiquesPage = () => {
  const navigate = useNavigate();
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [salesRange, setSalesRange] = useState({ min: 0, max: 0 });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const getSalesValue = (item) => {
    if (!item) return 0;
    if (item.status === 'pending') return 0;
    const value = Number(item.totalSales);
    return Number.isFinite(value) ? value : 0;
  };

  const calculateSalesBounds = (items = []) => {
    if (!items.length) return { min: 0, max: 0 };
    let min = Infinity;
    let max = -Infinity;

    items.forEach((entry) => {
      const value = getSalesValue(entry);
      if (value < min) min = value;
      if (value > max) max = value;
    });

    if (!Number.isFinite(min)) min = 0;
    if (!Number.isFinite(max)) max = 0;
    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 0;

    return { min, max };
  };

  const formatReadableDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString();
  };

  const salesBounds = useMemo(() => calculateSalesBounds(boutiques), [boutiques]);

  const dateBounds = useMemo(() => {
    if (!boutiques.length) return { start: '', end: '' };

    let earliest = null;
    let latest = null;

    boutiques.forEach((item) => {
      if (!item.createdAt) return;
      const created = new Date(item.createdAt);
      if (Number.isNaN(created.getTime())) return;

      if (!earliest || created < earliest) earliest = created;
      if (!latest || created > latest) latest = created;
    });

    return {
      start: earliest ? earliest.toISOString().split('T')[0] : '',
      end: latest ? latest.toISOString().split('T')[0] : '',
    };
  }, [boutiques]);

  useEffect(() => {
    fetchBoutiques();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, boutiques, sortConfig, salesRange, dateRange]);

  const fetchBoutiques = async () => {
    try {
      setLoading(true);

      const [boutiquesResponse, applicationsResponse] = await Promise.all([
        apiClient.getBoutiques({ limit: 100 }),
        apiClient.getBoutiqueApplications({ limit: 100 })
      ]);

      const boutiquesData = boutiquesResponse.data?.boutiques || [];
      const applications = applicationsResponse.data?.applications || [];

      const mappedApplications = applications.map(app => ({
        _id: app._id,
        name: app.boutiqueName,
        email: app.email,
        status: app.status,
        createdAt: app.submittedAt || app.createdAt,
        productCount: 0,
        totalSales: 0,
        totalOrders: 0,
        isApplication: true,
        ownerName: app.ownerName,
        phone: app.phone,
        description: app.description
      }));

      const allItems = [...boutiquesData, ...mappedApplications];
      setSalesRange(calculateSalesBounds(allItems));
      setBoutiques(allItems);
    } catch (error) {
      console.error('Error fetching boutiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBoutiques = boutiques.filter(b => {
    const matchesSearch = b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const salesValue = getSalesValue(b);
    const matchesSales = salesValue >= (salesRange.min ?? salesBounds.min) && salesValue <= (salesRange.max ?? salesBounds.max);

    const createdDate = b.createdAt ? new Date(b.createdAt) : null;
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    let matchesDate = true;
    if ((startDate || endDate)) {
      if (!createdDate || Number.isNaN(createdDate.getTime())) {
        matchesDate = false;
      } else {
        if (startDate && createdDate < startDate) matchesDate = false;
        if (endDate && createdDate > endDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesSales && matchesDate;
  });

  const handleSalesRangeChange = (type, value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;

    setSalesRange((prev) => {
      if (type === 'min') {
        const nextMin = Math.min(
          Math.max(numericValue, salesBounds.min),
          prev.max ?? salesBounds.max
        );
        return { ...prev, min: nextMin };
      }

      const nextMax = Math.max(
        Math.min(numericValue, salesBounds.max),
        prev.min ?? salesBounds.min
      );
      return { ...prev, max: nextMax };
    });
  };

  const handleDateRangeChange = (type, value) => {
    setDateRange((prev) => {
      if (type === 'start') {
        if (!value) return { ...prev, start: '' };
        if (prev.end && new Date(value) > new Date(prev.end)) {
          return { start: value, end: value };
        }
        return { ...prev, start: value };
      }

      if (!value) return { ...prev, end: '' };
      if (prev.start && new Date(value) < new Date(prev.start)) {
        return { start: value, end: value };
      }
      return { ...prev, end: value };
    });
  };

  const resetAdvancedFilters = () => {
    setSalesRange(calculateSalesBounds(boutiques));
    setDateRange({ start: '', end: '' });
  };

  const salesFilterDisabled = salesBounds.max === salesBounds.min;
  const hasDateBounds = Boolean(dateBounds.start && dateBounds.end);
  const advancedFiltersActive =
    (salesRange.min ?? salesBounds.min) !== salesBounds.min ||
    (salesRange.max ?? salesBounds.max) !== salesBounds.max ||
    Boolean(dateRange.start) ||
    Boolean(dateRange.end);

  const advancedFilterToggleLabel = showAdvancedFilters ? 'Hide advanced filters' : 'Show advanced filters';

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedBoutiques = [...filteredBoutiques].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const getValue = (item) => {
      if (sortConfig.key === 'products') {
        return item.status === 'pending' ? 0 : (item.productCount || 0);
      }
      if (sortConfig.key === 'sales') {
        return getSalesValue(item);
      }
      if (sortConfig.key === 'orders') {
        return item.status === 'pending' ? 0 : (item.totalOrders || 0);
      }
      return 0;
    };

    const aValue = getValue(a);
    const bValue = getValue(b);

    if (aValue === bValue) return 0;
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    return aValue > bValue ? direction : -direction;
  });

  const totalPages = Math.max(1, Math.ceil(sortedBoutiques.length / ITEMS_PER_PAGE));
  const paginatedBoutiques = sortedBoutiques.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

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

  const stats = {
    total: boutiques.length,
    active: boutiques.filter(b => b.status === 'active').length,
    pending: boutiques.filter(b => b.status === 'pending').length,
    suspended: boutiques.filter(b => b.status === 'suspended').length,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMetaText = (boutique) => {
    const parts = [];
    if (boutique.email) parts.push(boutique.email);

    if (boutique.createdAt) {
      parts.push(new Date(boutique.createdAt).toLocaleDateString());
    }
    return parts.join(' • ');
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading boutiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Boutiques</h1>
          <p className="page-subtitle">Manage and monitor all registered boutiques</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Total Boutiques</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}>
              <FiShoppingBag size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{stats.total.toLocaleString()}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Active</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
              <FiCheckCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{stats.active.toLocaleString()}</div>
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
            <div className="admin-stat-value">{stats.pending.toLocaleString()}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Suspended</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#DC2626' }}>
              <FiXCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{stats.suspended.toLocaleString()}</div>
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
              placeholder="Search boutiques by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-group" style={{ maxWidth: '200px' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="filter-actions">
          <button
            type="button"
            className={`advanced-filter-toggle ${showAdvancedFilters ? 'open' : ''} ${advancedFiltersActive ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(prev => !prev)}
          >
            <FiSliders size={16} />
            <span>{advancedFilterToggleLabel}</span>
            {advancedFiltersActive && !showAdvancedFilters && <span className="advanced-filter-indicator" aria-hidden="true"></span>}
          </button>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="advanced-filters-card">
          <div className="advanced-filter-header">
            <div>
              <h4 className="advanced-filter-title">Advanced Filters</h4>
              <p className="advanced-filter-subtitle">Dial in by revenue or application date</p>
            </div>
            <button
              type="button"
              className="link-button"
              onClick={resetAdvancedFilters}
              disabled={!advancedFiltersActive}
            >
              Reset
            </button>
          </div>

          <div className="advanced-filters-grid">
            <div className="advanced-filter-block">
              <div className="advanced-filter-label">
                <span>Sales Range</span>
                <small>
                  {salesFilterDisabled
                    ? 'No sales data yet'
                    : `${formatCurrency(salesBounds.min)} – ${formatCurrency(salesBounds.max)}`}
                </small>
              </div>
              <div className="range-values">
                <span>{formatCurrency((salesRange.min ?? salesBounds.min) || 0)}</span>
                <span>{formatCurrency((salesRange.max ?? salesBounds.max) || 0)}</span>
              </div>
              <div className="dual-range-inputs">
                <div className="range-input-wrapper">
                  <span className="range-label">Min</span>
                  <input
                    type="range"
                    className="range-slider"
                    min={salesBounds.min}
                    max={salesBounds.max || 1}
                    value={salesRange.min ?? salesBounds.min}
                    onChange={(e) => handleSalesRangeChange('min', e.target.value)}
                    disabled={salesFilterDisabled}
                  />
                </div>
                <div className="range-input-wrapper">
                  <span className="range-label">Max</span>
                  <input
                    type="range"
                    className="range-slider"
                    min={salesBounds.min}
                    max={salesBounds.max || 1}
                    value={salesRange.max ?? salesBounds.max}
                    onChange={(e) => handleSalesRangeChange('max', e.target.value)}
                    disabled={salesFilterDisabled}
                  />
                </div>
              </div>
            </div>

            <div className="advanced-filter-block">
              <div className="advanced-filter-label">
                <span>Date Created</span>
                <small>
                  {hasDateBounds
                    ? `${formatReadableDate(dateBounds.start)} – ${formatReadableDate(dateBounds.end)}`
                    : 'No submission dates yet'}
                </small>
              </div>
              {hasDateBounds && (
                <button
                  type="button"
                  className="link-button subtle"
                  onClick={() => setDateRange({ start: dateBounds.start, end: dateBounds.end })}
                >
                  Use full range
                </button>
              )}
              <div className="date-range-inputs">
                <div>
                  <label className="form-label" htmlFor="date-start">From</label>
                  <input
                    id="date-start"
                    type="date"
                    className="form-input"
                    max={dateRange.end || dateBounds.end || ''}
                    value={dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="date-end">To</label>
                  <input
                    id="date-end"
                    type="date"
                    className="form-input"
                    min={dateRange.start || dateBounds.start || ''}
                    value={dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="content-card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 className="card-title" style={{ margin: 0 }}>Boutiques List</h3>
          <p className="page-subtitle" style={{ margin: 0 }}>Full registry of stores and pending applications</p>
        </div>
        <div className="card-body">
          {filteredBoutiques.length === 0 ? (
            <div className="empty-state">
              <FiShoppingBag className="empty-state-icon" />
              <div className="empty-state-title">
                {searchTerm || statusFilter !== 'all'
                  ? 'No boutiques match your filters'
                  : 'No boutiques found'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: '100%', width: 'max-content' }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: '260px' }}>Boutique</th>
                    <th style={{ minWidth: '120px' }}>Status</th>
                    <th style={{ minWidth: '100px' }}>
                      <button
                        type="button"
                        className={`table-sort-btn ${sortConfig.key === 'products' ? 'active' : ''}`}
                        onClick={() => handleSort('products')}
                        aria-label="Sort by products"
                      >
                        Products
                        {sortConfig.key === 'products' && (
                          sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                        )}
                      </button>
                    </th>
                    <th style={{ minWidth: '140px' }}>
                      <button
                        type="button"
                        className={`table-sort-btn ${sortConfig.key === 'sales' ? 'active' : ''}`}
                        onClick={() => handleSort('sales')}
                        aria-label="Sort by sales"
                      >
                        Sales
                        {sortConfig.key === 'sales' && (
                          sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                        )}
                      </button>
                    </th>
                    <th style={{ minWidth: '110px' }}>
                      <button
                        type="button"
                        className={`table-sort-btn ${sortConfig.key === 'orders' ? 'active' : ''}`}
                        onClick={() => handleSort('orders')}
                        aria-label="Sort by orders"
                      >
                        Orders
                        {sortConfig.key === 'orders' && (
                          sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                        )}
                      </button>
                    </th>
                    <th style={{ minWidth: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBoutiques.map((boutique) => (
                    <tr key={boutique._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {boutique.logo ? (
                            <img
                              src={boutique.logo}
                              alt=""
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                border: '1px solid var(--border-color)'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              background: 'var(--bg-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid var(--border-color)'
                            }}>
                              <FiShoppingBag size={20} color="var(--text-secondary)" />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                              {boutique.name || 'Unnamed Boutique'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {getMetaText(boutique) || 'No contact info'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${boutique.status}`}>
                          {boutique.status || 'pending'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {boutique.status === 'pending' ? '—' : (boutique.productCount || 0)}
                      </td>
                      <td style={{ fontWeight: 600, color: boutique.status === 'pending' ? 'var(--warning-color)' : (boutique.totalSales > 0 ? 'var(--success-color)' : 'var(--text-secondary)') }}>
                        {boutique.status === 'pending' ? 'Pending' : formatCurrency(boutique.totalSales || 0)}
                      </td>
                      <td style={{ color: boutique.status === 'pending' ? 'var(--warning-color)' : 'inherit' }}>
                        {boutique.status === 'pending' ? 'Pending' : (boutique.totalOrders || 0)}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
                          onClick={() => navigate(`/boutiques/${boutique._id}`)}
                        >
                          <FiEye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBoutiques.length > ITEMS_PER_PAGE && (
                <div className="pagination">
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllBoutiquesPage;