import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiPackage,
  FiCheckCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiGrid,
  FiList,
  FiRefreshCw
} from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const LIVE_STATUSES = ['active', 'published', 'live', 'approved', 'available'];
const DRAFT_STATUSES = ['draft', 'pending', 'in_review'];
const SUSPENDED_STATUSES = ['suspended', 'disabled', 'blocked'];
const OUT_OF_STOCK_STATUSES = ['out_of_stock', 'sold_out', 'archived'];
const ITEMS_PER_PAGE = 12;

const normalizeProduct = (item = {}) => {
  const priceValue = Number(
    item.price ?? item.pricing?.current ?? item.currentPrice ?? item.priceCents?.value ?? 0
  );
  const inventoryValue = Number(item.inventory ?? item.stock ?? item.quantity ?? 0);
  const normalizedStatus = String(item.status || item.state || 'draft').toLowerCase();

  return {
    _id: item._id || item.id || `${item.sku || item.name}-product`,
    name: item.name || item.title || 'Untitled product',
    sku: item.sku || item.code || 'N/A',
    category: item.category || item.primaryCategory || 'Uncategorized',
    price: Number.isFinite(priceValue) ? priceValue : 0,
    inventory: Number.isFinite(inventoryValue) ? inventoryValue : 0,
    status: normalizedStatus,
    boutiqueName:
      item.boutiqueName || item.storeName || item.boutique?.name || item.store?.name || 'Unknown boutique',
    updatedAt: item.updatedAt || item.modifiedAt || item.createdAt || null,
    tags: Array.isArray(item.tags) ? item.tags : [],
    media: Array.isArray(item.images) ? item.images[0] : item.imageUrl || item.thumbnailUrl || '',
    description: item.shortDescription || item.description || ''
  };
};

const getStatusBucket = (status = '') => {
  if (LIVE_STATUSES.includes(status)) return 'live';
  if (SUSPENDED_STATUSES.includes(status)) return 'suspended';
  if (OUT_OF_STOCK_STATUSES.includes(status)) return 'out';
  if (DRAFT_STATUSES.includes(status)) return 'draft';
  return 'draft';
};

const getStatusClass = (status = '') => {
  if (LIVE_STATUSES.includes(status)) return 'approved';
  if (SUSPENDED_STATUSES.includes(status)) return 'suspended';
  if (OUT_OF_STOCK_STATUSES.includes(status)) return 'failed';
  return 'pending';
};

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatDate = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString();
};

const formatStatusLabel = (status = '') =>
  status
    .replace(/_/g, ' ')
    .split(' ')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');

const AllProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [boutiqueFilter, setBoutiqueFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [sortKey, setSortKey] = useState('updated');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, boutiqueFilter, viewMode]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.getProducts({ limit: 400 });
      const rawList = response.data?.products || response.data?.items || response.data || [];
      const normalized = (Array.isArray(rawList) ? rawList : []).map((item) => normalizeProduct(item));
      setProducts(normalized);
    } catch (err) {
      console.error('Error loading products', err);
      setError('Unable to load products right now. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const boutiques = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.boutiqueName).filter(Boolean)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.boutiqueName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'low_stock'
          ? product.inventory > 0 && product.inventory <= 5
          : getStatusBucket(product.status) === statusFilter;

      const matchesBoutique =
        boutiqueFilter === 'all' ? true : product.boutiqueName === boutiqueFilter;

      return matchesSearch && matchesStatus && matchesBoutique;
    });
  }, [products, searchTerm, statusFilter, boutiqueFilter]);

  const sortedProducts = useMemo(() => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    return [...filteredProducts].sort((a, b) => {
      if (sortKey === 'price') {
        return (a.price - b.price) * direction;
      }
      if (sortKey === 'inventory') {
        return (a.inventory - b.inventory) * direction;
      }
      if (sortKey === 'alpha') {
        return a.name.localeCompare(b.name) * direction;
      }
      const aTime = new Date(a.updatedAt || 0).getTime();
      const bTime = new Date(b.updatedAt || 0).getTime();
      return (aTime - bTime) * direction;
    });
  }, [filteredProducts, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
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

  const stats = useMemo(() => {
    const live = products.filter((product) => getStatusBucket(product.status) === 'live').length;
    const lowStock = products.filter((product) => product.inventory > 0 && product.inventory <= 5).length;
    const suspended = products.filter((product) => getStatusBucket(product.status) === 'suspended').length;
    const avgPrice = products.length
      ? products.reduce((sum, product) => sum + product.price, 0) / products.length
      : 0;

    return {
      total: products.length,
      live,
      lowStock,
      suspended,
      avgPrice
    };
  }, [products]);

  const handleSortChange = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection(key === 'alpha' ? 'asc' : 'desc');
  };

  const getInventoryState = (inventory) => {
    if (inventory === 0) return 'out';
    if (inventory > 0 && inventory <= 5) return 'low';
    return 'ok';
  };

  const goToManage = (productId) => {
    if (!productId) return;
    navigate(`/products/${productId}/manage`);
  };

  const renderTableView = () => {
    if (!paginatedProducts.length) {
      return (
        <div className="empty-state">
          <FiPackage className="empty-state-icon" />
          <div className="empty-state-title">No products match your filters</div>
          <p className="empty-state-text">Try a different search or status filter.</p>
        </div>
      );
    }

    return (
      <table className="data-table" style={{ minWidth: '100%', width: 'max-content' }}>
        <thead>
          <tr>
            <th style={{ minWidth: '220px' }}>Product</th>
            <th style={{ minWidth: '160px' }}>Boutique</th>
            <th style={{ minWidth: '120px' }}>Price</th>
            <th style={{ minWidth: '120px' }}>Inventory</th>
            <th style={{ minWidth: '140px' }}>Status</th>
            <th style={{ minWidth: '140px' }}>Updated</th>
            <th style={{ minWidth: '130px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map((product) => (
            <tr key={product._id}>
              <td>
                <div className="table-primary">
                  <span className="table-title">{product.name}</span>
                  <span className="table-subtitle">SKU · {product.sku}</span>
                </div>
              </td>
              <td>
                <div className="table-primary">
                  <span className="table-title">{product.boutiqueName}</span>
                  <span className="table-subtitle">{product.category}</span>
                </div>
              </td>
              <td>
                <div className="table-metric">
                  <span>{formatCurrency(product.price)}</span>
                  <small>unit price</small>
                </div>
              </td>
              <td>
                <div className="table-metric">
                  <span>{product.inventory}</span>
                  <small>in stock</small>
                </div>
              </td>
              <td>
                <span className={`status-badge ${getStatusClass(product.status)}`}>
                  {formatStatusLabel(product.status)}
                </span>
              </td>
              <td>{formatDate(product.updatedAt)}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                  onClick={() => goToManage(product._id)}
                >
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderCardView = () => {
    if (!paginatedProducts.length) {
      return (
        <div className="empty-state">
          <FiPackage className="empty-state-icon" />
          <div className="empty-state-title">No products available</div>
          <p className="empty-state-text">Refresh or adjust filters to see products.</p>
        </div>
      );
    }

    return (
      <div className="masonry-grid">
        {paginatedProducts.map((product) => (
          <div className="product-card" key={product._id}>
            {product.media ? (
              <div className="product-card-media" style={{ backgroundImage: `url(${product.media})` }} />
            ) : (
              <div className="product-card-media placeholder">{product.name.charAt(0)}</div>
            )}
            <div className="product-card-body">
              <div className="product-card-header">
                <div>
                  <div className="product-card-title">{product.name}</div>
                  <div className="product-card-subtitle">SKU · {product.sku}</div>
                </div>
                <span className={`status-badge ${getStatusClass(product.status)}`}>
                  {formatStatusLabel(product.status)}
                </span>
              </div>
              <div className="product-card-meta">
                <span>{product.boutiqueName}</span>
                <span>•</span>
                <span>{product.category}</span>
              </div>
              <div className="product-card-tags">
                <span className="tag-pill primary">{formatCurrency(product.price)}</span>
                <span className={`inventory-pill ${getInventoryState(product.inventory)}`}>
                  {product.inventory === 0 ? 'Out of stock' : `${product.inventory} in stock`}
                </span>
              </div>
              {product.tags.length > 0 && (
                <div className="product-card-tags secondary">
                  {product.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag-pill subtle">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="product-card-footer">
                <span className="card-updated">Updated {formatDate(product.updatedAt)}</span>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => goToManage(product._id)}
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="loading-spinner" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Products</h1>
          <p className="page-subtitle">Control every product across stores and switch layouts on demand</p>
        </div>
        <div className="filter-actions" style={{ gap: '0.5rem' }}>
          <button type="button" className="ghost-button" onClick={fetchProducts}>
            <FiRefreshCw size={14} /> Refresh
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/products/add')}>
            Create Product
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">All Products</span>
            <div className="stat-icon pink">
              <FiPackage />
            </div>
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Live Products</span>
            <div className="stat-icon success">
              <FiCheckCircle />
            </div>
          </div>
          <div className="stat-value">{stats.live}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Low Stock</span>
            <div className="stat-icon warning">
              <FiAlertTriangle />
            </div>
          </div>
          <div className="stat-value">{stats.lowStock}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Avg Price</span>
            <div className="stat-icon info">
              <FiTrendingUp />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(stats.avgPrice)}</div>
        </div>
      </div>

      {error && (
        <div className="content-card" style={{ borderColor: 'var(--danger-color)' }}>
          <div className="card-body" style={{ color: 'var(--danger-color)' }}>{error}</div>
        </div>
      )}

      <div className="filters-row">
        <div className="filter-group">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by product, SKU, or store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-group" style={{ maxWidth: '180px' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="live">Live</option>
            <option value="draft">Draft</option>
            <option value="suspended">Suspended</option>
            <option value="out">Out of stock</option>
            <option value="low_stock">Low stock</option>
          </select>
        </div>
        <div className="filter-group" style={{ maxWidth: '220px' }}>
          <select
            className="form-select"
            value={boutiqueFilter}
            onChange={(e) => setBoutiqueFilter(e.target.value)}
          >
            <option value="all">All boutiques</option>
            {boutiques.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-actions" style={{ gap: '0.5rem' }}>
          <button
            type="button"
            className={`ghost-button ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <FiList size={14} /> List view
          </button>
          <button
            type="button"
            className={`ghost-button ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            <FiGrid size={14} /> Card view
          </button>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 className="card-title">Inventory overview</h3>
            <p className="page-subtitle" style={{ margin: 0 }}>
              {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} ready for review
            </p>
          </div>
          <div className="sort-group">
            <span className="sort-label">Sort by</span>
            <button
              type="button"
              className={`ghost-button ${sortKey === 'updated' ? 'active' : ''}`}
              onClick={() => handleSortChange('updated')}
            >
              Updated
            </button>
            <button
              type="button"
              className={`ghost-button ${sortKey === 'price' ? 'active' : ''}`}
              onClick={() => handleSortChange('price')}
            >
              Price
            </button>
            <button
              type="button"
              className={`ghost-button ${sortKey === 'inventory' ? 'active' : ''}`}
              onClick={() => handleSortChange('inventory')}
            >
              Inventory
            </button>
            <button
              type="button"
              className={`ghost-button ${sortKey === 'alpha' ? 'active' : ''}`}
              onClick={() => handleSortChange('alpha')}
            >
              A → Z
            </button>
          </div>
        </div>
        <div className="card-body">
          {viewMode === 'table' ? renderTableView() : renderCardView()}
          {filteredProducts.length > ITEMS_PER_PAGE && (
            <div className="pagination">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              {getPageNumbers().map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={`pagination-btn ${pageNumber === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
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
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
