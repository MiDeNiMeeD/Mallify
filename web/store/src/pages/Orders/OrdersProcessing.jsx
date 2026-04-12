import React, { useState, useEffect } from 'react';
import { Truck, Package, Eye, ChevronDown, ChevronUp, DollarSign, CheckCircle, Search, Filter, AlertCircle, Clock3, Copy, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../../components/LoadingState';
import Toast from '../../components/Toast';
import {
  extractPrimaryStoreId,
  normalizeStoreOrderStatus,
  orderAmount,
  orderCustomerEmail,
  orderCustomerName,
  orderItemsCount,
} from './storeOrderUtils';
import './Orders.css';
import '../Dashboard/Dashboard.css';

function OrdersProcessing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info', duration: 4000, actions: [] });
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [userProfilesById, setUserProfilesById] = useState({});

  useEffect(() => {
    let isMounted = true;

    const resolveUserPayload = (response) => {
      const candidate = response?.data ?? response;
      if (candidate?.user && typeof candidate.user === 'object') return candidate.user;
      if (candidate && typeof candidate === 'object') return candidate;
      return null;
    };

    const extractUserId = (userObj) => {
      if (!userObj || typeof userObj !== 'object') return '';
      return String(userObj._id || userObj.id || userObj.userId || '').trim();
    };

    const hydrateUsersForOrders = async (ordersList = []) => {
      const userIds = Array.from(
        new Set(
          ordersList
            .map((order) => {
              if (typeof order?.userId === 'string') return order.userId.trim();
              if (order?.userId && typeof order.userId === 'object') {
                return String(order.userId._id || order.userId.id || '').trim();
              }
              return '';
            })
            .filter(Boolean)
        )
      );

      if (userIds.length === 0) return;

      const resolvedUsers = await Promise.all(
        userIds.map(async (id) => {
          try {
            const response = await apiClient.getBuyerBasicById(id);
            const userProfile = resolveUserPayload(response);
            const resolvedId = extractUserId(userProfile);

            if (!userProfile || (resolvedId && resolvedId !== id)) {
              return { id, user: null };
            }

            return { id, user: userProfile };
          } catch (_err) {
            return { id, user: null };
          }
        })
      );

      if (!isMounted) return;

      setUserProfilesById((prev) => {
        const next = { ...prev };
        resolvedUsers.forEach(({ id, user: userProfile }) => {
          if (userProfile) next[id] = userProfile;
        });
        return next;
      });
    };

    const fetchOrders = async () => {
      const storeId = extractPrimaryStoreId(user);
      if (!storeId) {
        setError('No boutique found for this user');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.getStoreOrders(storeId, { status: 'confirmed' });
        if (response.success) {
          const data = response.data;
          let normalizedOrders = [];
          if (Array.isArray(data)) normalizedOrders = data;
          else if (data?.orders && Array.isArray(data.orders)) normalizedOrders = data.orders;
          setOrders(normalizedOrders);
          hydrateUsersForOrders(normalizedOrders);
        } else {
          setError(response.message || 'Failed to fetch processing orders');
        }
      } catch (err) {
        console.error('Error fetching processing orders:', err);
        setError(err.message || 'Failed to load processing orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const getPathValue = (source, path) => {
    return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), source);
  };

  const firstNonEmptyValue = (source, paths = []) => {
    for (const path of paths) {
      const value = getPathValue(source, path);
      if (typeof value === 'string' && value.trim()) return value.trim();
      if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    }
    return '';
  };

  const getCustomerName = (order = {}) => (
    (typeof order?.userId === 'string' && userProfilesById[order.userId]?.name) ||
    (typeof order?.userId === 'string' && userProfilesById[order.userId]?.fullName) ||
    firstNonEmptyValue(order, [
      'customer.name',
      'customer.fullName',
      'customerName',
      'buyer.name',
      'buyer.fullName',
      'contact.name',
      'contact.fullName',
      'customerInfo.name',
      'customerInfo.fullName',
      'checkout.customerName',
      'checkout.customer.name',
      'shippingAddress.contactName',
      'shippingAddress.fullName',
      'userId.name',
      'user.name',
    ]) ||
    orderCustomerName(order) ||
    (typeof order.userId === 'string' && order.userId.trim() ? `User ID: ${order.userId}` : 'N/A')
  );

  const getCustomerEmail = (order = {}) => (
    (typeof order?.userId === 'string' && userProfilesById[order.userId]?.email) ||
    firstNonEmptyValue(order, [
      'customer.email',
      'buyer.email',
      'contact.email',
      'customerEmail',
      'customerInfo.email',
      'checkout.email',
      'checkout.customer.email',
      'shippingAddress.email',
      'deliveryAddress.email',
      'billingAddress.email',
      'userId.email',
      'user.email',
    ]) ||
    orderCustomerEmail(order) ||
    'Not provided'
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const normalizedValue =
      (value && typeof value === 'object' && '$date' in value && value.$date) || value;
    try {
      const parsed = new Date(normalizedValue);
      if (Number.isNaN(parsed.getTime())) return 'N/A';
      return parsed.toLocaleDateString();
    } catch (_err) {
      return 'N/A';
    }
  };

  const getShippingAddress = (order = {}) => {
    const address = order.shippingAddress || order.deliveryAddress || order.customer?.address;
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    const line = [
      address.street || address.addressLine1 || address.address,
      address.city,
      address.state,
      address.zip || address.postalCode,
      address.country,
    ]
      .filter(Boolean)
      .join(', ')
      .trim();
    return line || 'N/A';
  };

  const getItemName = (item = {}) => item.productName || item.name || item.title || item.productSnapshot?.name || 'Product';
  const getItemColor = (item = {}) => item.color || item.colour || item.selectedColor || item.variant?.color || item.selectedVariant?.color || item.attributes?.color || 'N/A';
  const getItemSize = (item = {}) => item.size || item.selectedSize || item.variant?.size || item.selectedVariant?.size || item.attributes?.size || 'N/A';
  const getItemImage = (item = {}) => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      const first = item.images[0];
      if (typeof first === 'string') return first;
      if (typeof first === 'object') return first?.url || first?.src || null;
    }
    return item.image || item.imageUrl || item.productImage || item.thumbnail || item.productSnapshot?.image || item.productSnapshot?.imageUrl || null;
  };

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
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((current) => (current === orderId ? null : orderId));
  };

  const handleSetPending = async (orderId) => {
    try {
      await apiClient.updateStoreOrderAction(orderId, 'pending');
      setOrders((prev) => prev.filter(o => o._id !== orderId));
      showToast('Order moved to pending.', 'success');
    } catch (err) {
      console.error('Error moving order to pending:', err);
      showToast('Failed to update order.', 'error');
    }
  };

  const renderExpandedOrderDetails = (order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    return (
      <div className="order-inline-details">
        <div className="order-inline-section">
          <h4>Customer</h4>
          <div className="order-inline-customer-grid">
            <span className="customer-label">Name</span>
            <span className="customer-value">{getCustomerName(order)}</span>
            <span className="customer-label">Email</span>
            <span className="customer-value">{getCustomerEmail(order)}</span>
            <span className="customer-label">Address</span>
            <span className="customer-value">{getShippingAddress(order)}</span>
          </div>
        </div>

        <div className="order-inline-section order-inline-products">
          <h4>Products</h4>
          {items.length === 0 ? (
            <p>No products available for this order.</p>
          ) : (
            <div className="order-inline-products-list">
              {items.map((item, index) => {
                const qty = item.quantity || item.qty || 1;
                const price = item.unitPrice || item.price || 0;
                const imageUrl = getItemImage(item);
                return (
                  <div key={item._id || item.id || `${order._id}-inline-${index}`} className="order-inline-product-item">
                    {imageUrl ? (
                      <img src={imageUrl} alt={getItemName(item)} className="order-inline-product-image" />
                    ) : (
                      <div className="order-inline-product-image order-inline-product-image-placeholder">No image</div>
                    )}
                    <span className="order-inline-product-name">{getItemName(item)}</span>
                    <span className="order-inline-product-chip">Qty {qty}</span>
                    <span className="order-inline-product-chip">Color {getItemColor(item)}</span>
                    <span className="order-inline-product-chip">Size {getItemSize(item)}</span>
                    <span className="order-inline-product-price">{formatCurrency(price)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const totalItems = orders.reduce((sum, order) => sum + orderItemsCount(order), 0);
  const totalValue = orders.reduce((sum, order) => sum + orderAmount(order), 0);
  const dayMs = 24 * 60 * 60 * 1000;
  const paidOrders = orders.filter((order) => String(order?.paymentStatus || '').toLowerCase() === 'paid').length;

  const filteredOrders = orders.filter((order) => {
    const createdAtRaw =
      (order.createdAt && typeof order.createdAt === 'object' && order.createdAt.$date) ||
      order.createdAt;
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      String(order.orderNumber || '').toLowerCase().includes(search) ||
      String(order.userId || '').toLowerCase().includes(search) ||
      String(getCustomerName(order)).toLowerCase().includes(search) ||
      String(getCustomerEmail(order)).toLowerCase().includes(search);

    const createdAt = createdAtRaw ? new Date(createdAtRaw).getTime() : null;
    const now = Date.now();
    const matchesDateRange =
      filterDateRange === 'all' ||
      (filterDateRange === 'today' && createdAt && now - createdAt <= dayMs) ||
      (filterDateRange === '7days' && createdAt && now - createdAt <= 7 * dayMs) ||
      (filterDateRange === '30days' && createdAt && now - createdAt <= 30 * dayMs);

    return matchesSearch && matchesDateRange;
  });

  const getPriority = (order) => {
    const normalizedStatus = normalizeStoreOrderStatus(order.status);
    const createdAtRaw =
      (order.createdAt && typeof order.createdAt === 'object' && order.createdAt.$date) ||
      order.createdAt;
    const created = createdAtRaw ? new Date(createdAtRaw).getTime() : Date.now();
    const ageDays = (Date.now() - created) / (24 * 60 * 60 * 1000);

    if (normalizedStatus === 'pending' && ageDays >= 2) return 'Urgent';
    if (normalizedStatus === 'cancelled' || normalizedStatus === 'rejected') return 'Low';
    return 'Normal';
  };

  const sortOrders = (list) => {
    const priorityRank = { urgent: 3, normal: 2, low: 1 };
    const resolveDate = (value) => {
      const normalized = (value && typeof value === 'object' && value.$date) || value;
      const parsed = normalized ? new Date(normalized).getTime() : 0;
      return Number.isFinite(parsed) ? parsed : 0;
    };

    return [...list].sort((a, b) => {
      let aValue;
      let bValue;

      switch (sortBy) {
        case 'orderNumber':
          aValue = String(a.orderNumber || '').toLowerCase();
          bValue = String(b.orderNumber || '').toLowerCase();
          break;
        case 'items':
          aValue = orderItemsCount(a);
          bValue = orderItemsCount(b);
          break;
        case 'total':
          aValue = orderAmount(a);
          bValue = orderAmount(b);
          break;
        case 'status':
          aValue = normalizeStoreOrderStatus(a.status);
          bValue = normalizeStoreOrderStatus(b.status);
          break;
        case 'priority':
          aValue = priorityRank[String(getPriority(a)).toLowerCase()] || 0;
          bValue = priorityRank[String(getPriority(b)).toLowerCase()] || 0;
          break;
        case 'createdAt':
        default:
          aValue = resolveDate(a.createdAt);
          bValue = resolveDate(b.createdAt);
          break;
      }

      if (aValue < bValue) return sortDir === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedOrders = sortOrders(filteredOrders);
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + pageSize);
  const visibleOrderIds = paginatedOrders.map((order) => order._id);
  const allVisibleSelected =
    visibleOrderIds.length > 0 && visibleOrderIds.every((id) => selectedOrderIds.includes(id));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDateRange, pageSize, sortBy, sortDir]);

  useEffect(() => {
    setSelectedOrderIds((prev) => {
      const next = prev.filter((id) => sortedOrders.some((o) => o._id === id));
      return next.length === prev.length ? prev : next;
    });
  }, [orders, searchTerm, filterDateRange]);

  const toggleSort = (key) => {
    setSortBy((current) => {
      if (current === key) {
        setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
        return current;
      }
      setSortDir('asc');
      return key;
    });
  };

  const getSortIndicator = (key) => {
    if (sortBy !== key) return '⇅';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAllVisible = () => {
    setSelectedOrderIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleOrderIds.includes(id));
      }
      return Array.from(new Set([...prev, ...visibleOrderIds]));
    });
  };

  const runBulkAction = async () => {
    if (selectedOrderIds.length === 0) return;

    try {
      await Promise.all(selectedOrderIds.map((orderId) => apiClient.updateStoreOrderAction(orderId, 'pending')));
      setOrders((prev) => prev.filter((order) => !selectedOrderIds.includes(order._id)));
      setSelectedOrderIds([]);
      showToast('Selected orders moved to pending.', 'success');
    } catch (err) {
      console.error('Bulk action failed:', err);
      showToast('Failed to apply bulk action.', 'error');
    }
  };

  const handleCopyOrderQuick = async (order) => {
    const payload = String(order?.orderNumber || '').trim();
    if (!payload) {
      showToast('Order ID is missing for this row.', 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(payload);
      showToast('Order ID copied.', 'success');
    } catch (_err) {
      showToast('Failed to copy order ID.', 'error');
    }
  };

  const exportFilteredOrdersToCsv = () => {
    if (sortedOrders.length === 0) {
      showToast('No orders to export.', 'warning');
      return;
    }

    const headers = ['Order ID', 'Created', 'Status', 'Priority', 'Items', 'Total'];
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = sortedOrders.map((order) => [
      order.orderNumber,
      formatDate(order.createdAt),
      normalizeStoreOrderStatus(order.status),
      getPriority(order),
      orderItemsCount(order),
      formatCurrency(orderAmount(order)),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `processing-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully.', 'success');
  };

  if (loading) {
    return (
      <LoadingState
        title="Loading processing orders"
        message="Fetching orders currently being prepared."
        detail="Preparing processing list…"
        icon={Package}
      />
    );
  }

  return (
    <div className="dashboard-page orders-page">
      <div className="page-header">
        <div>
         
          <h1 className="page-title">Processing Orders</h1>
          <p className="page-subtitle">Orders currently being prepared for shipment</p>
        </div>
        <button className="btn-primary" onClick={exportFilteredOrdersToCsv}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">In Progress</span>
            <div className="stat-icon info"><Package size={20} /></div>
          </div>
          <div className="stat-value">{orders.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Items</span>
            <div className="stat-icon warning"><Truck size={20} /></div>
          </div>
          <div className="stat-value">{totalItems}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Value</span>
            <div className="stat-icon success"><DollarSign size={20} /></div>
          </div>
          <div className="stat-value">{formatCurrency(totalValue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Paid Orders</span>
            <div className="stat-icon pink"><CheckCircle size={20} /></div>
          </div>
          <div className="stat-value">{paidOrders}</div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="content-card">
        <div className="card-header">
          <div className="orders-card-title-wrap">
            <Package size={20} className="orders-card-title-icon info" />
            <h2 className="card-title">{orders.length} Orders in Progress</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="filters-bar filters-grid">
            <div className="search-bar filter-field filter-search">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by order ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select filter-field"
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          <div className="orders-toolbar">
            {selectedOrderIds.length > 0 && (
              <div className="bulk-actions-bar">
                <span className="bulk-actions-label">{selectedOrderIds.length} selected</span>
                <button className="btn-secondary btn-action-pending" onClick={runBulkAction}>Set Pending</button>
              </div>
            )}
          </div>

          {paginatedOrders.length > 0 ? (
            <>
              <table className="data-table orders-checkout-table">
                <thead>
                  <tr>
                    <th className="table-checkbox-cell">
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAllVisible}
                      />
                    </th>
                    <th>
                      <button className="orders-sort-btn" onClick={() => toggleSort('orderNumber')}>
                        Order ID <span className="orders-sort-indicator">{getSortIndicator('orderNumber')}</span>
                      </button>
                    </th>
                    <th>
                      <button className="orders-sort-btn" onClick={() => toggleSort('createdAt')}>
                        Created <span className="orders-sort-indicator">{getSortIndicator('createdAt')}</span>
                      </button>
                    </th>
                    <th>
                      <button className="orders-sort-btn" onClick={() => toggleSort('items')}>
                        Items <span className="orders-sort-indicator">{getSortIndicator('items')}</span>
                      </button>
                    </th>
                    <th>
                      <button className="orders-sort-btn" onClick={() => toggleSort('total')}>
                        Total <span className="orders-sort-indicator">{getSortIndicator('total')}</span>
                      </button>
                    </th>
                    <th>
                      <button className="orders-sort-btn" onClick={() => toggleSort('status')}>
                        Status <span className="orders-sort-indicator">{getSortIndicator('status')}</span>
                      </button>
                    </th>
                    <th>
                      <button className="orders-sort-btn" onClick={() => toggleSort('priority')}>
                        Priority <span className="orders-sort-indicator">{getSortIndicator('priority')}</span>
                      </button>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr
                      className={`order-main-row ${expandedOrderId === order._id ? 'is-expanded' : ''}`}
                      onClick={() => toggleOrderDetails(order._id)}
                    >
                      <td className="table-checkbox-cell" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedOrderIds.includes(order._id)}
                          onChange={() => toggleSelectOrder(order._id)}
                        />
                      </td>
                      <td>
                        <div className="order-id-with-copy">
                          {order?.orderNumber ? (
                            <button
                              className="btn-icon btn-icon-view order-copy-inline-btn"
                              title="Copy order ID"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyOrderQuick(order);
                              }}
                            >
                              <Copy size={14} />
                            </button>
                          ) : null}
                          <strong>{order.orderNumber}</strong>
                        </div>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{orderItemsCount(order)}</td>
                      <td><strong>{formatCurrency(orderAmount(order))}</strong></td>
                      <td>
                        <span className={`status-badge ${normalizeStoreOrderStatus(order.status)}`}>
                          {normalizeStoreOrderStatus(order.status)}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-badge ${getPriority(order).toLowerCase()}`}>
                          {getPriority(order)}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="orders-actions-inline">
                          <button
                            className="btn-icon btn-icon-neutral"
                            title={expandedOrderId === order._id ? 'Hide Inline Details' : 'Show Inline Details'}
                            onClick={() => toggleOrderDetails(order._id)}
                          >
                            {expandedOrderId === order._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button
                            className="btn-icon btn-icon-view"
                            title="View Details"
                            onClick={() => navigate(`/orders/${order._id}`)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn-icon btn-icon-pending"
                            title="Set this order to pending"
                            onClick={() => handleSetPending(order._id)}
                          >
                            <Clock3 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrderId === order._id && (
                      <tr className="order-expand-row">
                        <td colSpan={8}>{renderExpandedOrderDetails(order)}</td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                </tbody>
              </table>

              <div className="orders-pagination">
                <div className="orders-pagination-meta">
                  Showing {sortedOrders.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, sortedOrders.length)} of {sortedOrders.length}
                </div>
                <div className="orders-pagination-controls">
                  <select
                    className="form-select orders-page-size"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                  <button
                    className="btn-secondary"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                  >
                    Prev
                  </button>
                  <span className="orders-page-info">Page {safePage} / {totalPages}</span>
                  <button
                    className="btn-secondary"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Filter size={42} />
              <div className="empty-state-title">No orders found</div>
              <p>Try adjusting your search or date filter.</p>
            </div>
          )}
        </div>
      </div>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        actions={toast.actions}
        onClose={closeToast}
      />
    </div>
  );
}

export default OrdersProcessing;
