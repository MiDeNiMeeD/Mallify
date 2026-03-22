import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiEdit2,
  FiSlash,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiLayers,
  FiClock
} from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/Dashboard.css';

const LIVE_STATUSES = ['active', 'published', 'live', 'approved', 'available'];
const DRAFT_STATUSES = ['draft', 'pending', 'in_review'];
const SUSPENDED_STATUSES = ['suspended', 'disabled', 'blocked'];
const OUT_OF_STOCK_STATUSES = ['out_of_stock', 'sold_out', 'archived'];

const extractMediaList = (product = {}) => {
  const candidates = [
    product.images,
    product.galleryImages,
    product.gallery,
    product.photos,
    product.media?.images,
    product.media?.gallery,
    product.media?.items,
    product.assets?.images
  ];

  const urls = candidates
    .filter(Boolean)
    .flatMap((entry) => (Array.isArray(entry) ? entry : [entry]))
    .map((item) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (typeof item === 'object') {
        return item.url || item.src || item.path || item.imageUrl || '';
      }
      return '';
    })
    .filter(Boolean);

  return [...new Set(urls)];
};

const normalizeProduct = (product = {}) => {
  const priceValue = Number(
    product.price ?? product.pricing?.current ?? product.currentPrice ?? product.priceCents?.value ?? 0
  );
  const inventoryValue = Number(product.inventory ?? product.stock ?? product.quantity ?? 0);
  const normalizedStatus = String(product.status || product.state || 'draft').toLowerCase();
  const mediaList = extractMediaList(product);

  return {
    _id: product._id || product.id,
    name: product.name || product.title || 'Untitled product',
    sku: product.sku || product.code || 'N/A',
    category: product.category || product.primaryCategory || 'Uncategorized',
    price: Number.isFinite(priceValue) ? priceValue : 0,
    inventory: Number.isFinite(inventoryValue) ? inventoryValue : 0,
    status: normalizedStatus,
    boutiqueId: product.boutiqueId || product.storeId || product.boutique?._id || product.store?._id || null,
    boutiqueName:
      product.boutiqueName || product.storeName || product.boutique?.name || product.store?.name || 'Unknown boutique',
    description: product.description || product.longDescription || '',
    updatedAt: product.updatedAt || product.modifiedAt || product.createdAt || null,
    createdAt: product.createdAt || null,
    tags: Array.isArray(product.tags) ? product.tags : [],
    mediaList,
    media: mediaList[0] || product.imageUrl || product.thumbnailUrl || ''
  };
};

const extractProductPayload = (response) =>
  response?.data?.product || response?.data?.item || response?.data || response?.product || response;

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatDate = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleString();
};

const formatStatusLabel = (status = '') =>
  status
    .replace(/_/g, ' ')
    .split(' ')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');

const getStatusClass = (status = '') => {
  if (LIVE_STATUSES.includes(status)) return 'approved';
  if (SUSPENDED_STATUSES.includes(status)) return 'suspended';
  if (OUT_OF_STOCK_STATUSES.includes(status)) return 'failed';
  return 'pending';
};

const extractBoutiqueList = (response) => {
  const data = response?.data;
  if (Array.isArray(data?.boutiques)) return data.boutiques;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(response?.boutiques)) return response.boutiques;
  if (Array.isArray(response?.items)) return response.items;
  return Array.isArray(response) ? response : [];
};

const normalizeBoutiqueOption = (boutique = {}) => {
  const id = boutique._id || boutique.id || boutique.boutiqueId || boutique.storeId;
  const name = boutique.name || boutique.boutiqueName || boutique.storeName || boutique.title || 'Unnamed boutique';
  const slug = boutique.slug || boutique.handle || boutique.username || boutique.profileSlug;
  const ownerName =
    boutique.ownerName || boutique.owner?.name || boutique.owner?.fullName || boutique.manager?.name || boutique.ownerEmail;
  const subtitleParts = [];
  if (slug) subtitleParts.push(`Slug: ${slug}`);
  if (ownerName) subtitleParts.push(ownerName);
  return {
    id: id || slug || name,
    name,
    subtitle: subtitleParts.join(' • '),
    value: slug || id || name,
    inputValue: slug ? `${name} (${slug})` : name
  };
};

const INITIAL_MOVE_MODAL_STATE = {
  inputValue: '',
  searchTerm: '',
  selectedBoutique: null,
  results: [],
  loading: false
};

const INITIAL_CONFIRM_MODAL_STATE = {
  show: false,
  title: 'Confirm action',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'default',
  showInput: false,
  inputPlaceholder: '',
  inputRequired: false,
  intent: null,
  payload: null
};

const ManageProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState({ suspend: false, move: false });
  const [toastState, setToastState] = useState({ show: false, message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState(INITIAL_CONFIRM_MODAL_STATE);
  const [moveModalState, setMoveModalState] = useState(INITIAL_MOVE_MODAL_STATE);
  const boutiqueSearchTimeout = useRef(null);

  const showToast = (message, type = 'info') => {
    setToastState({ show: true, message, type });
  };

  const hideToast = () => {
    setToastState((prev) => ({ ...prev, show: false }));
  };

  const resetMoveModalState = (overrides = {}) => {
    setMoveModalState({ ...INITIAL_MOVE_MODAL_STATE, ...overrides });
  };

  const closeConfirmModal = () => {
    if (boutiqueSearchTimeout.current) {
      clearTimeout(boutiqueSearchTimeout.current);
      boutiqueSearchTimeout.current = null;
    }
    setConfirmModal({ ...INITIAL_CONFIRM_MODAL_STATE });
    resetMoveModalState();
  };

  const handleConfirmModalConfirm = async (inputValue) => {
    const modalData = { ...confirmModal };
    const moveStateSnapshot = { ...moveModalState };
    closeConfirmModal();
    if (modalData.intent === 'move') {
      await handleMoveConfirm(inputValue, moveStateSnapshot);
      return;
    }
    if (modalData.intent === 'suspend') {
      await handleSuspendConfirm(modalData.payload);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => () => {
    if (boutiqueSearchTimeout.current) {
      clearTimeout(boutiqueSearchTimeout.current);
      boutiqueSearchTimeout.current = null;
    }
  }, []);

  const fetchProduct = async (showLoader = true) => {
    const shouldShowLoader = typeof showLoader === 'boolean' ? showLoader : true;
    try {
      if (shouldShowLoader) {
        setLoading(true);
      }
      setError('');
      const response = await apiClient.getProductById(id);
      const payload = extractProductPayload(response);
      if (!payload) {
        throw new Error('Product payload missing');
      }
      setProduct(normalizeProduct(payload));
      setActiveImageIndex(0);
    } catch (err) {
      console.error('Error fetching product', err);
      setError('Unable to load product details. Please try again later.');
    } finally {
      if (shouldShowLoader) {
        setLoading(false);
      }
    }
  };

  const updateProductDetails = async (updates, loadingKey, successMessage) => {
    if (!product) return;
    try {
      if (loadingKey) {
        setActionLoading((prev) => ({ ...prev, [loadingKey]: true }));
      }
      const response = await apiClient.updateProduct(product._id || id, updates);
      const payload = extractProductPayload(response);
      if (payload) {
        setProduct(normalizeProduct(payload));
        setActiveImageIndex(0);
      } else {
        await fetchProduct(false);
      }
      if (successMessage) {
        showToast(successMessage, 'success');
      }
    } catch (err) {
      console.error('Error updating product', err);
      showToast(err?.message || 'Unable to update product. Please try again.', 'error');
    } finally {
      if (loadingKey) {
        setActionLoading((prev) => ({ ...prev, [loadingKey]: false }));
      }
    }
  };

  const fetchBoutiqueSuggestions = async (searchTerm = '') => {
    try {
      setMoveModalState((prev) => ({ ...prev, loading: true }));
      const trimmedTerm = searchTerm.trim();
      const params = trimmedTerm ? { search: trimmedTerm, limit: 8 } : { limit: 8 };
      const response = await apiClient.getBoutiques(params);
      const options = extractBoutiqueList(response).map(normalizeBoutiqueOption).slice(0, 8);
      setMoveModalState((prev) => ({ ...prev, results: options, loading: false }));
    } catch (err) {
      console.error('Error searching boutiques', err);
      setMoveModalState((prev) => ({ ...prev, loading: false, results: [] }));
    }
  };

  const handleMoveInputChange = (value) => {
    const nextValue = value || '';
    setMoveModalState((prev) => ({
      ...prev,
      inputValue: nextValue,
      searchTerm: nextValue,
      selectedBoutique: null,
      loading: true
    }));
    if (boutiqueSearchTimeout.current) {
      clearTimeout(boutiqueSearchTimeout.current);
    }
    boutiqueSearchTimeout.current = setTimeout(() => {
      fetchBoutiqueSuggestions(nextValue);
    }, 250);
  };

  const handleMoveSuggestionSelect = (option) => {
    if (!option) return;
    setMoveModalState((prev) => ({
      ...prev,
      selectedBoutique: option,
      inputValue: option.inputValue || option.name || option.label || option.value || ''
    }));
  };

  const handleMoveConfirm = async (inputValue = '', stateSnapshot = null) => {
    if (!product) return;
    const state = stateSnapshot || moveModalState;
    const manualValue = (inputValue || state.inputValue || '').trim();
    const resolvedValue = state.selectedBoutique?.value || state.selectedBoutique?.id || manualValue;
    if (!resolvedValue) {
      showToast('Select or enter a boutique to complete the move.', 'warning');
      return;
    }
    await updateProductDetails(
      { boutiqueId: resolvedValue },
      'move',
      'Product reassigned to the selected boutique.'
    );
  };

  const handleSuspendConfirm = async (payload) => {
    if (!payload) return;
    await updateProductDetails(payload.updates, 'suspend', payload.successMessage);
  };

  const inventoryState = useMemo(() => {
    if (!product) return 'unknown';
    if (product.inventory === 0 || OUT_OF_STOCK_STATUSES.includes(product.status)) return 'out';
    if (product.inventory > 0 && product.inventory <= 5) return 'low';
    return 'ok';
  }, [product]);

  const handleSuspend = () => {
    if (!product) return;
    const isCurrentlySuspended = SUSPENDED_STATUSES.includes(product.status);
    const nextStatus = isCurrentlySuspended ? 'active' : 'suspended';
    setConfirmModal({
      ...INITIAL_CONFIRM_MODAL_STATE,
      show: true,
      title: isCurrentlySuspended ? 'Reactivate product' : 'Suspend product',
      message: isCurrentlySuspended
        ? 'Reactivate this product so customers can purchase it again.'
        : 'Suspend this product to hide it from all storefronts immediately.',
      confirmText: isCurrentlySuspended ? 'Reactivate' : 'Suspend',
      cancelText: 'Cancel',
      type: isCurrentlySuspended ? 'success' : 'danger',
      intent: 'suspend',
      payload: {
        updates: { status: nextStatus },
        successMessage: isCurrentlySuspended
          ? 'Product reactivated successfully.'
          : 'Product suspended successfully.'
      }
    });
  };

  const handleEdit = () => {
    navigate(`/products/edit/${id}`);
  };

  const handleMove = () => {
    if (!product) return;
    resetMoveModalState({ loading: true });
    setConfirmModal({
      ...INITIAL_CONFIRM_MODAL_STATE,
      show: true,
      title: 'Move to boutique',
      message: 'Assign this product to another boutique. Search by name, slug, or ID to pick the destination.',
      confirmText: 'Move product',
      cancelText: 'Cancel',
      type: 'default',
      showInput: true,
      inputPlaceholder: 'Search boutique name, slug, or ID',
      inputRequired: true,
      intent: 'move'
    });
    fetchBoutiqueSuggestions('');
  };

  const gallerySources = product?.mediaList?.length
    ? product.mediaList
    : product?.media
    ? [product.media]
    : [];
  const activeImage = gallerySources[activeImageIndex] || product?.media;
  const isSuspended = product ? SUSPENDED_STATUSES.includes(product.status) : false;
  const suspendButtonVariant = isSuspended ? 'btn-success' : 'btn-danger';
  const suspendButtonLabel = isSuspended ? 'Reactivate' : 'Suspend';
  const suspendActionTitle = isSuspended ? 'Reactivate product' : 'Suspend product';
  const suspendActionSubtitle = isSuspended
    ? 'Return to storefront immediately'
    : 'Hide from storefront immediately';

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="loading-spinner" />
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="content-card" style={{ borderColor: 'var(--danger-color)' }}>
          <div className="card-body" style={{ color: 'var(--danger-color)', textAlign: 'center' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <FiPackage className="empty-state-icon" />
          <div className="empty-state-title">Product not found</div>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>
            Back to catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-page">
      <div className="page-header" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button type="button" className="ghost-button" onClick={() => navigate(-1)} style={{ width: 'fit-content' }}>
            <FiArrowLeft size={14} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ margin: 0 }}>{product.name}</h1>
            <span className={`status-badge ${getStatusClass(product.status)}`}>
              {formatStatusLabel(product.status)}
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: 0 }}>
            {product.boutiqueName} • SKU {product.sku}
          </p>
        </div>
        <div className="filter-actions" style={{ gap: '0.5rem' }}>
          <button type="button" className="ghost-button" onClick={fetchProduct}>
            <FiRefreshCw size={14} /> Refresh
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleEdit}>
            <FiEdit2 size={14} /> Edit details
          </button>
          <button
            type="button"
            className={`btn ${suspendButtonVariant}`}
            onClick={handleSuspend}
            disabled={actionLoading.suspend}
          >
            {actionLoading.suspend ? (
              'Processing...'
            ) : (
              <>
                <FiSlash size={14} /> {suspendButtonLabel}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="content-with-sidebar">
        <div className="content-card flex-grow">
          <div className="card-header">
            <h3 className="card-title">Product overview</h3>
            <span className="page-subtitle">Key metadata pulled directly from the catalog</span>
          </div>
          <div className="card-body">
            <div className="product-hero">
              {activeImage ? (
                <div className="product-hero-media" style={{ backgroundImage: `url(${activeImage})` }} />
              ) : (
                <div className="product-hero-media placeholder">
                  <span>{product.name?.charAt(0) || '?'}</span>
                </div>
              )}
            </div>
            {gallerySources.length > 0 && (
              <div className="product-gallery">
                {gallerySources.map((imageUrl, index) => (
                  <button
                    type="button"
                    key={imageUrl}
                    className={`product-gallery-thumb ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <div
                      className="product-gallery-thumb-media"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Price</span>
                <span className="detail-value">{formatCurrency(product.price)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Inventory</span>
                <span className={`detail-chip inventory-pill ${inventoryState}`}>
                  {product.inventory === 0 ? 'Out of stock' : `${product.inventory} units`}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category</span>
                <span className="detail-value">{product.category}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Updated</span>
                <span className="detail-value">{formatDate(product.updatedAt)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created</span>
                <span className="detail-value">{formatDate(product.createdAt)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Boutique</span>
                <span className="detail-value">{product.boutiqueName}</span>
              </div>
            </div>
            {product.description && (
              <div className="product-description">
                <h4>Description</h4>
                <p>{product.description}</p>
              </div>
            )}
            {product.tags.length > 0 && (
              <div className="product-tags-block">
                <h4>Tags</h4>
                <div className="product-card-tags secondary">
                  {product.tags.map((tag) => (
                    <span key={tag} className="tag-pill subtle">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="review-panel">
          <h4>Control Center</h4>
          <p className="panel-subtitle">Elevate or pause availability in one click</p>
          <div className="action-list">
            <button type="button" className="action-item" onClick={handleEdit}>
              <div>
                <span className="action-title">Edit product</span>
                <span className="action-subtitle">Update pricing, media, or metadata</span>
              </div>
              <FiEdit2 size={16} />
            </button>
            <button
              type="button"
              className={`action-item ${isSuspended ? '' : 'danger'}`}
              onClick={handleSuspend}
              disabled={actionLoading.suspend}
            >
              <div>
                <span className="action-title">{suspendActionTitle}</span>
                <span className="action-subtitle">{suspendActionSubtitle}</span>
              </div>
              {actionLoading.suspend ? '...' : <FiSlash size={16} />}
            </button>
            <button
              type="button"
              className="action-item"
              onClick={handleMove}
              disabled={actionLoading.move}
            >
              <div>
                <span className="action-title">Move to boutique</span>
                <span className="action-subtitle">Assign a different store owner</span>
              </div>
              {actionLoading.move ? '...' : <FiShoppingBag size={16} />}
            </button>
          </div>
          <div className="panel-divider" />
          <div className="insight-block">
            <h5>At a glance</h5>
            <ul>
              <li>
                <FiDollarSign size={14} /> {formatCurrency(product.price)} price point
              </li>
              <li>
                <FiLayers size={14} /> {product.category}
              </li>
              <li>
                <FiClock size={14} /> Updated {formatDate(product.updatedAt)}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      show={confirmModal.show}
      title={confirmModal.title}
      message={confirmModal.message}
      confirmText={confirmModal.confirmText}
      cancelText={confirmModal.cancelText}
      type={confirmModal.type}
      showInput={confirmModal.showInput}
      inputPlaceholder={confirmModal.inputPlaceholder}
      inputRequired={confirmModal.inputRequired}
      inputValue={confirmModal.showInput ? moveModalState.inputValue : undefined}
      onInputChange={confirmModal.intent === 'move' ? handleMoveInputChange : undefined}
      suggestions={confirmModal.intent === 'move' ? moveModalState.results : []}
      onSuggestionSelect={confirmModal.intent === 'move' ? handleMoveSuggestionSelect : undefined}
      inputLoading={confirmModal.intent === 'move' ? moveModalState.loading : false}
      onConfirm={handleConfirmModalConfirm}
      onCancel={closeConfirmModal}
    />
    <Toast show={toastState.show} message={toastState.message} type={toastState.type} onClose={hideToast} />
    </>
  );
};

export default ManageProduct;
