import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiEye } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import Toast from '../../components/Toast';
import '../../styles/Dashboard.css';

const LIVE_STATUSES = ['active', 'published', 'live', 'approved', 'available'];
const DRAFT_STATUSES = ['draft', 'pending', 'in_review'];
const SUSPENDED_STATUSES = ['suspended', 'disabled', 'blocked'];
const OUT_OF_STOCK_STATUSES = ['out_of_stock', 'sold_out', 'archived'];

const STATUS_OPTIONS = Array.from(
  new Set([...DRAFT_STATUSES, ...LIVE_STATUSES, ...SUSPENDED_STATUSES, ...OUT_OF_STOCK_STATUSES])
);

const MAX_MEDIA_FILE_SIZE_MB = 10;
const MAX_MEDIA_FILE_SIZE_BYTES = MAX_MEDIA_FILE_SIZE_MB * 1024 * 1024;

const DEFAULT_FORM_STATE = {
  name: '',
  sku: '',
  category: '',
  price: '',
  inventory: '',
  status: 'draft',
  boutiqueId: '',
  boutiqueName: '',
  description: '',
  tagsInput: '',
  mediaInput: ''
};

const extractProductPayload = (response) =>
  response?.data?.product || response?.data?.item || response?.data || response?.product || response;

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
    sku: product.sku || product.code || '',
    category: product.category || product.primaryCategory || 'Uncategorized',
    price: Number.isFinite(priceValue) ? priceValue : 0,
    inventory: Number.isFinite(inventoryValue) ? inventoryValue : 0,
    status: normalizedStatus,
    boutiqueId: product.boutiqueId || product.storeId || product.boutique?._id || product.store?._id || '',
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

const mergeMediaEntries = (existing = [], additions = []) => {
  const next = Array.isArray(existing) ? [...existing] : [];
  const seen = new Set(next);
  additions.forEach((item) => {
    if (item && !seen.has(item)) {
      seen.add(item);
      next.push(item);
    }
  });
  return next;
};

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

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

const getInventoryState = (inventory) => {
  if (inventory === 0) return 'out';
  if (inventory > 0 && inventory <= 5) return 'low';
  return 'ok';
};

const ProductEditor = ({ mode = 'create', productId = null }) => {
  const navigate = useNavigate();
  const isEditMode = mode === 'edit';
  const [formValues, setFormValues] = useState(DEFAULT_FORM_STATE);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaEntries, setMediaEntries] = useState([]);
  const [error, setError] = useState('');
  const [toastState, setToastState] = useState({ show: false, message: '', type: 'info' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEditMode && !productId) {
      setError('Missing product ID. Return to the catalog and select a product to edit.');
      setLoading(false);
      return;
    }

    if (isEditMode && productId) {
      const loadProduct = async () => {
        try {
          setLoading(true);
          setError('');
          const response = await apiClient.getProductById(productId);
          const payload = extractProductPayload(response);
          if (!payload) {
            throw new Error('Product payload missing in response.');
          }
          const normalized = normalizeProduct(payload);
          populateForm(normalized);
          setMediaEntries(normalized.mediaList || (normalized.media ? [normalized.media] : []));
        } catch (err) {
          console.error('Error loading product', err);
          setError('Unable to load this product. Please refresh or return to the catalog.');
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    } else if (!isEditMode) {
      setFormValues({ ...DEFAULT_FORM_STATE });
      setMediaEntries([]);
    }
  }, [isEditMode, productId]);

  const populateForm = (product) => {
    setFormValues({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category === 'Uncategorized' ? '' : product.category || '',
      price: Number.isFinite(product.price) ? String(product.price) : '',
      inventory: Number.isFinite(product.inventory) ? String(product.inventory) : '',
      status: product.status || 'draft',
      boutiqueId: product.boutiqueId || '',
      boutiqueName: product.boutiqueName === 'Unknown boutique' ? '' : product.boutiqueName || '',
      description: product.description || '',
      tagsInput: product.tags?.join(', ') || '',
      mediaInput: ''
    });
  };

  const showToast = (message, type = 'info') => {
    setToastState({ show: true, message, type });
  };

  const hideToast = () => {
    setToastState((prev) => ({ ...prev, show: false }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const mediaList = mediaEntries;

  const tagsList = useMemo(() => {
    return formValues.tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [formValues.tagsInput]);

  const heroImage = mediaList[0] || '';
  const previewName = formValues.name || 'Untitled product';
  const previewPrice = Number(formValues.price) || 0;
  const previewInventory = Number(formValues.inventory) || 0;
  const inventoryState = getInventoryState(previewInventory);

  const handleMediaDelete = (index) => {
    setMediaEntries((prev) => prev.filter((_, mediaIndex) => mediaIndex !== index));
  };

  const handleMediaUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleMediaFileChange = async (event) => {
    const { files } = event.target;
    if (!files || !files.length) return;

    const fileArray = Array.from(files);
    const oversized = fileArray.filter((file) => file.size > MAX_MEDIA_FILE_SIZE_BYTES);
    if (oversized.length) {
      const message =
        oversized.length === 1
          ? `${oversized[0].name} is too big (max ${MAX_MEDIA_FILE_SIZE_MB}MB). It was discarded.`
          : `${oversized.length} images were too big (max ${MAX_MEDIA_FILE_SIZE_MB}MB each) and were discarded.`;
      showToast(message, 'error');
    }

    const validFiles = fileArray.filter((file) => file.size <= MAX_MEDIA_FILE_SIZE_BYTES);
    if (!validFiles.length) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setUploading(true);
      const dataUrls = await Promise.all(validFiles.map((file) => readFileAsDataUrl(file)));
      const nextGallery = mergeMediaEntries(mediaList, dataUrls);
      setMediaEntries(nextGallery);
      showToast('Images added to gallery. They will upload when you save.', 'info');
    } catch (err) {
      console.error('Error reading files', err);
      showToast('Unable to process one or more images. Try smaller files.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddManualMedia = () => {
    const entries = formValues.mediaInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (!entries.length) {
      showToast('Add at least one URL before saving.', 'warning');
      return;
    }
    setMediaEntries((prev) => mergeMediaEntries(prev, entries));
    setFormValues((prev) => ({ ...prev, mediaInput: '' }));
    showToast(`${entries.length} URL${entries.length > 1 ? 's' : ''} added to gallery.`, 'success');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError('');

    const payload = {
      name: formValues.name.trim(),
      sku: formValues.sku.trim(),
      category: formValues.category.trim() || 'Uncategorized',
      price: Number(formValues.price) || 0,
      inventory: Number(formValues.inventory) || 0,
      status: formValues.status || 'draft',
      boutiqueId: formValues.boutiqueId.trim() || undefined,
      boutiqueName: formValues.boutiqueName.trim() || undefined,
      description: formValues.description.trim(),
      tags: tagsList,
      images: mediaList,
      galleryImages: mediaList,
      media: { images: mediaList }
    };

    try {
      const response = isEditMode
        ? await apiClient.updateProduct(productId, payload)
        : await apiClient.createProduct(payload);
      const payloadData = extractProductPayload(response);
      if (!payloadData) {
        throw new Error('Server did not return a product payload.');
      }
      const normalized = normalizeProduct(payloadData);
      populateForm(normalized);
      setMediaEntries(normalized.mediaList || (normalized.media ? [normalized.media] : []));
      showToast(isEditMode ? 'Product updated successfully.' : 'Product created successfully.', 'success');

      if (!isEditMode && normalized._id) {
        navigate(`/products/${normalized._id}/manage`, { replace: true });
      }
    } catch (err) {
      console.error('Error saving product', err);
      let message = err?.message || 'Unable to save the product. Please try again.';
      const status = err?.response?.status;
      const loweredMessage = typeof err?.message === 'string' ? err.message.toLowerCase() : '';
      if (status === 413 || loweredMessage.includes('entity too large')) {
        message = 'Media payload exceeds the server limit (10 MB). Remove or compress images before saving.';
      }
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    if (!isEditMode || !productId) return;
    try {
      setRefreshing(true);
      const response = await apiClient.getProductById(productId);
      const payload = extractProductPayload(response);
      if (!payload) {
        throw new Error('Product payload missing in response.');
      }
      const normalized = normalizeProduct(payload);
      populateForm(normalized);
      setMediaEntries(normalized.mediaList || (normalized.media ? [normalized.media] : []));
      showToast('Product data refreshed.', 'info');
    } catch (err) {
      console.error('Error refreshing product', err);
      showToast(err?.message || 'Unable to refresh this product right now.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const navigateToManage = () => {
    if (productId) {
      navigate(`/products/${productId}/manage`);
    }
  };

  const navigateBack = () => {
    navigate('/products');
  };

  const productSummary = [
    `${tagsList.length || 0} tags attached`,
    mediaList.length ? `${mediaList.length} gallery images` : 'No media linked yet'
  ];

  const renderLoadingState = () => (
    <div className="content-card">
      <div className="card-body">
        <div className="empty-state">
          <div className="loading-spinner" />
          <p>Loading product details...</p>
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="content-card" style={{ borderColor: 'var(--danger-color)' }}>
      <div className="card-body" style={{ color: 'var(--danger-color)', textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem' }}>{error}</p>
        <button type="button" className="btn btn-secondary" onClick={navigateBack}>
          Back to catalog
        </button>
      </div>
    </div>
  );

  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

  return (
    <div className="dashboard-page">
      <div className="page-header" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button type="button" className="ghost-button" onClick={navigateBack} style={{ width: 'fit-content' }}>
            <FiArrowLeft size={14} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              {isEditMode ? 'Edit Product' : 'Create Product'}
            </h1>
            <span className={`status-badge ${getStatusClass(formValues.status)}`}>
              {formatStatusLabel(formValues.status)}
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: 0 }}>
            {isEditMode ? 'Update and publish product details' : 'Build a new product listing for the catalog'}
          </p>
        </div>
        <div className="filter-actions" style={{ gap: '0.5rem' }}>
          {isEditMode && (
            <button type="button" className="ghost-button" onClick={handleRefresh} disabled={refreshing}>
              <FiRefreshCw size={14} /> {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
          {isEditMode && (
            <button type="button" className="btn btn-secondary" onClick={navigateToManage}>
              <FiEye size={14} /> Manage
            </button>
          )}
        </div>
      </div>

      <div className="content-with-sidebar">
        <div className="content-card flex-grow">
          <div className="card-header">
            <h3 className="card-title">Product details</h3>
            <span className="page-subtitle">Everything customers see on the storefront</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="form-stack" style={{ display: 'grid', gap: '1.25rem' }}>
              <div className="detail-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Product name</label>
                  <input
                    id="name"
                    name="name"
                    className="form-input"
                    value={formValues.name}
                    onChange={handleInputChange}
                    placeholder="Summer linen dress"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="sku">SKU</label>
                  <input
                    id="sku"
                    name="sku"
                    className="form-input"
                    value={formValues.sku}
                    onChange={handleInputChange}
                    placeholder="SKU-001"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category</label>
                  <input
                    id="category"
                    name="category"
                    className="form-input"
                    value={formValues.category}
                    onChange={handleInputChange}
                    placeholder="Dresses"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="price">Price</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    className="form-input"
                    value={formValues.price}
                    onChange={handleInputChange}
                    placeholder="120"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="inventory">Inventory</label>
                  <input
                    id="inventory"
                    name="inventory"
                    type="number"
                    className="form-input"
                    value={formValues.inventory}
                    onChange={handleInputChange}
                    placeholder="24"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    className="form-select"
                    value={formValues.status}
                    onChange={handleInputChange}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {formatStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="boutiqueName">Boutique name</label>
                  <input
                    id="boutiqueName"
                    name="boutiqueName"
                    className="form-input"
                    value={formValues.boutiqueName}
                    onChange={handleInputChange}
                    placeholder="Starlight Apparel"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="boutiqueId">Boutique ID</label>
                  <input
                    id="boutiqueId"
                    name="boutiqueId"
                    className="form-input"
                    value={formValues.boutiqueId}
                    onChange={handleInputChange}
                    placeholder="64a9f3b9d9..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  rows={4}
                  value={formValues.description}
                  onChange={handleInputChange}
                  placeholder="Give shoppers a quick summary of the product..."
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tagsInput">Tags (comma separated)</label>
                <input
                  id="tagsInput"
                  name="tagsInput"
                  className="form-input"
                  value={formValues.tagsInput}
                  onChange={handleInputChange}
                  placeholder="summer, linen, new"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Media gallery</label>
                <div className="media-manager">
                  <div className="media-actions">
                    <button type="button" className="btn btn-secondary" onClick={handleMediaUploadClick}>
                      Upload images
                    </button>
                    <span className="media-hint">Max {MAX_MEDIA_FILE_SIZE_MB}MB per file</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleMediaFileChange}
                  />

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label" htmlFor="mediaInput">Add media URLs</label>
                    <textarea
                      id="mediaInput"
                      name="mediaInput"
                      className="form-textarea"
                      rows={3}
                      value={formValues.mediaInput}
                      onChange={handleInputChange}
                      placeholder="Paste one image URL per line"
                    />
                    <button type="button" className="ghost-button" onClick={handleAddManualMedia}>
                      Add URLs
                    </button>
                  </div>

                  {uploading && (
                    <div className="media-hint">Uploading files...</div>
                  )}

                  {mediaList.length === 0 ? (
                    <div className="media-empty">No media added yet.</div>
                  ) : (
                    <div className="media-grid">
                      {mediaList.map((media, index) => (
                        <div className="media-card" key={media}>
                          <div className="media-thumb" style={{ backgroundImage: `url(${media})` }} />
                          <div className="media-meta">
                            <span className="media-label">Image {index + 1}</span>
                            <button type="button" className="ghost-button muted" onClick={() => handleMediaDelete(index)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : isEditMode ? 'Save changes' : 'Create product'}
              </button>
            </form>
          </div>
        </div>

        <div className="review-panel">
          <h4>Live preview</h4>
          <p className="panel-subtitle">Preview how the product appears in catalog cards</p>
          <div className="product-card" style={{ marginBottom: 0 }}>
            {heroImage ? (
              <div className="product-card-media" style={{ backgroundImage: `url(${heroImage})` }} />
            ) : (
              <div className="product-card-media placeholder">{previewName.charAt(0)}</div>
            )}
            <div className="product-card-body">
              <div className="product-card-header">
                <div>
                  <div className="product-card-title">{previewName}</div>
                  <div className="product-card-subtitle">SKU · {formValues.sku || 'N/A'}</div>
                </div>
                <span className={`status-badge ${getStatusClass(formValues.status)}`}>
                  {formatStatusLabel(formValues.status)}
                </span>
              </div>
              <div className="product-card-tags">
                <span className="tag-pill primary">{formatCurrency(previewPrice)}</span>
                <span className={`inventory-pill ${inventoryState}`}>
                  {previewInventory === 0 ? 'Out of stock' : `${previewInventory} in stock`}
                </span>
              </div>
              <div className="product-card-footer">
                <span className="card-updated">{productSummary.join(' • ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast show={toastState.show} message={toastState.message} type={toastState.type} onClose={hideToast} />
    </div>
  );
};

export default ProductEditor;
