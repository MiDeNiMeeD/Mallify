import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye, Package, AlertCircle, List, LayoutGrid } from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import Toast from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../../styles/base.css';
import '../../styles/list-layout.css';
import './ProductsList.css';

const ITEMS_PER_PAGE = 10;

function ProductsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [boutiqueFilter, setBoutiqueFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [sortKey, setSortKey] = useState('updated');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info', duration: 4000, actions: [] });
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const showToast = (message, type = 'info', options = {}) => {
    setToast({
      show: true,
      message,
      type,
      duration: typeof options.duration === 'number' ? options.duration : 4000,
      actions: options.actions || [],
    });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false, actions: [], duration: 4000 }));
    setPendingDelete(null);
  };

  const resetPendingDelete = () => {
    setPendingDelete(null);
  };

  const uiStyles = useMemo(() => ({
    filtersRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'stretch',
      marginBottom: '1.5rem',
    },
    filterGroup: {
      flex: '1 1 220px',
      minWidth: '200px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    filterActions: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.5rem',
    },
    sortGroup: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.35rem',
    },
    sortLabel: {
      fontSize: '0.85rem',
      fontWeight: 600,
      color: 'var(--text-muted)',
      marginRight: '0.35rem',
    },
    ghostButton: (active) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      paddingInline: '1rem',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      backgroundColor: active ? 'rgba(246, 59, 215, 0.12)' : 'transparent',
      color: active ? 'var(--primary-color)' : 'var(--text-secondary)',
      fontWeight: 600,
      fontSize: '0.85rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap',
      marginTop: '1.5rem',
    },
    paginationBtn: (active) => ({
      padding: '0.5rem 0.9rem',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      backgroundColor: active ? 'var(--primary-color)' : 'transparent',
      color: active ? '#fff' : 'var(--text-primary)',
      cursor: 'pointer',
      fontWeight: 600,
    }),
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.75rem',
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: '1rem',
    },
  }), []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.boutiqueList?.[0]) {
        setError('No boutique found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const boutiqueId = user.boutiqueList[0];
        const response = await apiClient.getProductsByBoutique(boutiqueId);
        if (response.success) {
          const productsData = response.data;
          if (Array.isArray(productsData)) {
            setProducts(productsData);
          } else if (productsData?.products && Array.isArray(productsData.products)) {
            setProducts(productsData.products);
          } else {
            setProducts([]);
          }
        } else {
          setError(response.message || 'Failed to fetch products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const getStockCount = (product) => {
    if (typeof product.quantity === 'number') {
      return product.quantity;
    }
    if (typeof product.stock === 'number') {
      return product.stock;
    }
    return 0;
  };

  const getStoreName = (product) => {
    return (
      product?.boutique?.name ||
      product?.boutiqueName ||
      product?.storeName ||
      product?.brandName ||
      'My boutique'
    );
  };

  const getStatusCategory = (product) => {
    const normalized = (product.status || '').toLowerCase();
    if (normalized === 'draft') return 'draft';
    if (normalized === 'suspended' || normalized === 'disabled') return 'suspended';
    if (normalized === 'live' || normalized === 'active') {
      const stock = getStockCount(product);
      if (stock === 0) return 'out';
      if (stock > 0 && stock <= 10) return 'low_stock';
      return 'live';
    }

    const stock = getStockCount(product);
    if (stock === 0) return 'out';
    if (stock > 0 && stock <= 10) return 'low_stock';
    return 'live';
  };

  const getStatusLabel = (statusCategory) => {
    switch (statusCategory) {
      case 'draft':
        return 'Draft';
      case 'suspended':
        return 'Suspended';
      case 'out':
        return 'Out of stock';
      case 'low_stock':
        return 'Low stock';
      case 'live':
      default:
        return 'Live';
    }
  };

  const getProductRecordId = (product) => {
    return product?._id || product?.id || null;
  };

  const getStatusChipStyle = (statusCategory, variant = 'default') => {
    if (variant === 'card') {
      switch (statusCategory) {
        case 'draft':
          return { backgroundColor: '#475569', color: '#fff' };
        case 'suspended':
          return { backgroundColor: '#DC2626', color: '#fff' };
        case 'out':
          return { backgroundColor: '#B91C1C', color: '#fff' };
        case 'low_stock':
          return { backgroundColor: '#D97706', color: '#1F2937' };
        case 'live':
        default:
          return { backgroundColor: '#059669', color: '#fff' };
      }
    }

    switch (statusCategory) {
      case 'draft':
        return { backgroundColor: 'rgba(148, 163, 184, 0.2)', color: 'var(--text-primary)' };
      case 'suspended':
        return { backgroundColor: 'rgba(248, 113, 113, 0.2)', color: 'var(--danger-color)' };
      case 'out':
        return { backgroundColor: 'rgba(248, 113, 113, 0.2)', color: 'var(--danger-color)' };
      case 'low_stock':
        return { backgroundColor: 'rgba(251, 191, 36, 0.25)', color: 'var(--warning-color)' };
      case 'live':
      default:
        return { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-color)' };
    }
  };

  const formatUpdatedAt = (product) => {
    const rawDate = product.updatedAt || product.createdAt;
    if (!rawDate) return '—';
    try {
      return new Date(rawDate).toLocaleDateString();
    } catch (err) {
      return '—';
    }
  };

  const resolveImageUrl = (entry) => {
    if (!entry) return null;
    if (typeof entry === 'string') return entry;
    if (typeof entry === 'object') {
      return entry.url || entry.href || entry.src || entry.path || entry.imageUrl || null;
    }
    return null;
  };

  const getProductImages = (product = {}) => {
    const collections = [
      product.images,
      product.galleryImages,
      product.gallery,
      product.media?.images,
      product.media?.gallery,
      product.media?.items,
      product.assets?.images,
      product.assets?.gallery,
      product.photos,
      product.pictures,
    ];

    const singles = [
      product.image,
      product.imageUrl,
      product.thumbnail,
      product.thumbnailUrl,
      product.featuredImage,
      product.coverImage,
      product.primaryImage,
    ];

    const urls = [];

    const addUrl = (value) => {
      const url = resolveImageUrl(value);
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    };

    collections.forEach((collection) => {
      if (Array.isArray(collection)) {
        collection.forEach(addUrl);
      }
    });

    singles.forEach(addUrl);

    return urls;
  };

  const boutiques = useMemo(() => {
    const names = new Set();
    products.forEach((product) => {
      const name = getStoreName(product);
      if (name) {
        names.add(name);
      }
    });
    return Array.from(names);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const name = (product.name || '').toLowerCase();
      const identifier = (product.sku || product.id || product._id || '').toLowerCase();
      const store = getStoreName(product).toLowerCase();
      const matchesSearch = !normalizedSearch ||
        name.includes(normalizedSearch) ||
        identifier.includes(normalizedSearch) ||
        store.includes(normalizedSearch);

      const statusCategory = getStatusCategory(product);
      const matchesStatus = statusFilter === 'all' || statusCategory === statusFilter;
      const matchesBoutique = boutiqueFilter === 'all' || getStoreName(product) === boutiqueFilter;

      return matchesSearch && matchesStatus && matchesBoutique;
    });
  }, [products, searchTerm, statusFilter, boutiqueFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, boutiqueFilter]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case 'price':
          return (b.price || 0) - (a.price || 0);
        case 'inventory':
          return getStockCount(b) - getStockCount(a);
        case 'alpha':
          return (a.name || '').localeCompare(b.name || '');
        case 'updated':
        default: {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        }
      }
    });
    return sorted;
  }, [filteredProducts, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const getPageNumbers = () => Array.from({ length: totalPages }, (_, index) => index + 1);

  const productStats = useMemo(() => {
    return products.reduce((acc, product) => {
      acc.total += 1;
      const statusCategory = getStatusCategory(product);
      if (statusCategory === 'live') {
        acc.active += 1;
      }
      if (statusCategory === 'low_stock') {
        acc.lowStock += 1;
      }
      if (statusCategory === 'out') {
        acc.outOfStock += 1;
      }
      return acc;
    }, {
      total: 0,
      active: 0,
      lowStock: 0,
      outOfStock: 0,
    });
  }, [products]);

  const handleSortChange = (key) => {
    setSortKey(key);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleEditProduct = (product) => {
    const recordId = getProductRecordId(product);
    if (!recordId) {
      showToast('Unable to open this product for editing (missing ID).', 'error');
      return;
    }

    navigate(`/products/${recordId}/edit`, { state: { product } });
  };

  const handleDeleteClick = (product) => {
    const recordId = getProductRecordId(product);
    if (!recordId) {
      showToast('Unable to delete this product (missing ID).', 'error');
      return;
    }

    setPendingDelete(recordId);
    const productName = product.name || 'this product';
    showToast(`Are you sure you want to delete ${productName}?`, 'warning', {
      duration: 0,
      actions: [
        {
          key: 'confirm-delete',
          label: 'Delete',
          variant: 'danger',
          onClick: () => handleDeleteProduct(product),
        },
        {
          key: 'cancel-delete',
          label: 'Cancel',
          variant: 'ghost',
          onClick: () => {
            resetPendingDelete();
          },
        },
      ],
    });
  };

  const handleDeleteProduct = async (product) => {
    const recordId = getProductRecordId(product);
    if (!recordId) {
      showToast('Unable to delete this product (missing ID).', 'error');
      return;
    }

    setDeletingId(recordId);
    resetPendingDelete();
    try {
      const response = await apiClient.deleteProduct(recordId);
      if (response?.success === false) {
        throw new Error(response?.message || 'Failed to delete product.');
      }

      setProducts((prev) => prev.filter((item) => getProductRecordId(item) !== recordId));
      showToast('Product deleted successfully.', 'success');
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast(err.message || 'Failed to delete product.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-state-icon">📦</div>
      <div className="empty-state-title">No products found</div>
      <p>Try adjusting your search or filters</p>
    </div>
  );

  const renderTableView = () => (
    <table className="data-table">
      <thead>
        <tr>
          <th>Product</th>
          
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Status</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((product, index) => {
            const stock = getStockCount(product);
            const statusCategory = getStatusCategory(product);
            const statusLabel = getStatusLabel(statusCategory);
            const productId = product.sku || product.id || product._id || '—';
            const key = product._id || product.id || product.sku || `product-${index}`;
            const recordId = getProductRecordId(product);
            const canNavigate = Boolean(recordId);
            const isDeleting = Boolean(recordId && deletingId === recordId);
            const awaitingConfirm = Boolean(recordId && pendingDelete === recordId && !isDeleting);
            const deleteTitle = isDeleting ? 'Deleting…' : awaitingConfirm ? 'Awaiting confirmation…' : 'Delete';

            return (
              <tr key={key}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong>{product.name || 'Untitled product'}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{productId}</span>
                  </div>
                </td>
                
                <td>{product.category || '—'}</td>
                <td><strong>{formatCurrency(product.price || 0)}</strong></td>
                <td>
                  <span style={{
                    color: stock === 0 ? 'var(--danger-color)' :
                      stock <= 10 ? 'var(--warning-color)' :
                        'var(--success-color)',
                  }}>
                    {stock} units
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${statusCategory}`} style={getStatusChipStyle(statusCategory)}>
                    {statusLabel}
                  </span>
                </td>
                <td>{formatUpdatedAt(product)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn-icon"
                      title="View"
                      onClick={() => canNavigate && navigate(`/products/${recordId}`)}
                      disabled={!canNavigate}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      title="Edit"
                      onClick={() => handleEditProduct(product)}
                      disabled={!recordId}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      title={deleteTitle}
                      onClick={() => handleDeleteClick(product)}
                      disabled={!recordId || isDeleting}
                      aria-busy={isDeleting}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="8">{renderEmptyState()}</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  const renderCardView = () => {
    if (!paginatedProducts.length) {
      return renderEmptyState();
    }

    return (
      <div style={uiStyles.cardGrid}>
        {paginatedProducts.map((product, index) => {
          const stock = getStockCount(product);
          const statusCategory = getStatusCategory(product);
          const statusLabel = getStatusLabel(statusCategory);
          const key = product._id || product.id || product.sku || `card-${index}`;
          const images = getProductImages(product);
          const primaryImage = images[0];
          const galleryImages = images.slice(1);
          const recordId = getProductRecordId(product);
          const isDeleting = Boolean(recordId && deletingId === recordId);
          const awaitingConfirm = Boolean(recordId && pendingDelete === recordId && !isDeleting);
          const deleteTitle = isDeleting ? 'Deleting…' : awaitingConfirm ? 'Awaiting confirmation…' : 'Delete';

          return (
            <div
              key={key}
              className="product-card"
            >
              <div className="card-status-badge">
                <span className={`status-badge ${statusCategory}`} style={getStatusChipStyle(statusCategory, 'card')}>
                  {statusLabel}
                </span>
              </div>
              <div>
                <div className="product-card-media" aria-label={`Images for ${product.name || 'product'}`}>
                  {primaryImage ? (
                    <>
                      <div className="primary-media">
                        <img src={primaryImage} alt={`${product.name || 'Product'} primary image`} loading="lazy" />
                      </div>
                      {galleryImages.length > 0 && (
                        <div className="product-media-strip" aria-label="Additional images" role="list">
                          {galleryImages.map((src, idx) => (
                            <div className="media-thumb" role="listitem" key={`${key}-image-${idx + 1}`}>
                              <img src={src} alt={`${product.name || 'Product'} image ${idx + 2}`} loading="lazy" />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="primary-media placeholder">No photo</div>
                  )}
                </div>
              
                <h4 style={{ margin: 0 }}>{product.name || 'Untitled product'}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{product.category || 'Uncategorized'}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price</span>
                  <div style={{ fontWeight: 600 }}>{formatCurrency(product.price || 0)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inventory</span>
                  <div style={{ fontWeight: 600 }}>{stock} units</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Updated {formatUpdatedAt(product)}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-icon"
                    title="Edit"
                    onClick={() => handleEditProduct(product)}
                    disabled={!recordId}
                  >
                    <Edit size={16} /> 
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    title={deleteTitle}
                    onClick={() => handleDeleteClick(product)}
                    disabled={!recordId || isDeleting}
                    aria-busy={isDeleting}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const shouldShowPagination = filteredProducts.length > ITEMS_PER_PAGE;

  const formatCurrency = (amount) => {
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(amount) || 0)} DT`;
  };

  if (loading) {
    return (
      <LoadingState
        title="Loading products"
        message="Pulling live inventory from your store."
        detail="Syncing product catalog, pricing, and stock levels…"
        icon={Package}
      />
    );
  }

  return (
    <>
      <div className="dashboard-page">
      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product inventory and pricing</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/products/add')}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Products</span>
            <div className="stat-icon pink">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{productStats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active</span>
            <div className="stat-icon success">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{productStats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Low Stock</span>
            <div className="stat-icon warning">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{productStats.lowStock}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Out of Stock</span>
            <div className="stat-icon pink">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{productStats.outOfStock}</div>
        </div>
      </div>

      <div className="filters-row" style={uiStyles.filtersRow}>
        <div className="filter-group search-group">
            
            <div className="search-bar">
              <Search className="search-icon" size={16} />
              <input
                type="search"
                className="search-input"
                placeholder="Search by product, SKU, or store..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search products by name, SKU, or store"
              />
            </div>
          
        </div>
        <div className="filter-group" style={{ ...uiStyles.filterGroup, maxWidth: '180px' }}>
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
        
        <div className="filter-actions" style={uiStyles.filterActions}>
          <button
            type="button"
            className={`ghost-button ${viewMode === 'table' ? 'active' : ''}`}
            style={uiStyles.ghostButton(viewMode === 'table')}
            onClick={() => handleViewModeChange('table')}
          >
            <List size={14} /> List view
          </button>
          <button
            type="button"
            className={`ghost-button ${viewMode === 'cards' ? 'active' : ''}`}
            style={uiStyles.ghostButton(viewMode === 'cards')}
            onClick={() => handleViewModeChange('cards')}
          >
            <LayoutGrid size={14} /> Card view
          </button>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header" style={{ ...uiStyles.cardHeader, flexWrap: 'wrap' }}>
          <div>
            <h3 className="card-title">Inventory overview</h3>
            <p className="page-subtitle" style={{ margin: 0 }}>
              {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} ready for review
            </p>
          </div>
          <div className="sort-group" style={uiStyles.sortGroup}>
            <span style={uiStyles.sortLabel}>Sort by</span>
            <button
              type="button"
              className={`ghost-button ${sortKey === 'updated' ? 'active' : ''}`}
              style={uiStyles.ghostButton(sortKey === 'updated')}
              onClick={() => handleSortChange('updated')}
            >
              Updated
            </button>
            <button
              type="button"
              className={`ghost-button ${sortKey === 'price' ? 'active' : ''}`}
              style={uiStyles.ghostButton(sortKey === 'price')}
              onClick={() => handleSortChange('price')}
            >
              Price
            </button>
            <button
              type="button"
              className={`ghost-button ${sortKey === 'inventory' ? 'active' : ''}`}
              style={uiStyles.ghostButton(sortKey === 'inventory')}
              onClick={() => handleSortChange('inventory')}
            >
              Inventory
            </button>
            <button
              type="button"
              className={`ghost-button ${sortKey === 'alpha' ? 'active' : ''}`}
              style={uiStyles.ghostButton(sortKey === 'alpha')}
              onClick={() => handleSortChange('alpha')}
            >
              A → Z
            </button>
          </div>
        </div>
        <div className="card-body">
          {viewMode === 'table' ? renderTableView() : renderCardView()}
          {shouldShowPagination && (
            <div className="pagination" style={uiStyles.pagination}>
              <button
                type="button"
                className="pagination-btn"
                style={{
                  ...uiStyles.paginationBtn(false),
                  opacity: currentPage === 1 ? 0.45 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
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
                  style={uiStyles.paginationBtn(pageNumber === currentPage)}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                className="pagination-btn"
                style={{
                  ...uiStyles.paginationBtn(false),
                  opacity: currentPage === totalPages ? 0.45 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
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
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
        duration={toast.duration}
        actions={toast.actions}
      />
    </>
  );
}

export default ProductsList;
