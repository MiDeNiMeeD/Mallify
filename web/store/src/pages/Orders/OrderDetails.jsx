import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import apiClient from '../../api/apiClient';
import { normalizeStoreOrderStatus } from './storeOrderUtils';
import './Orders.css';
import '../Dashboard/Dashboard.css';

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPathValue = (source, path) => {
    return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), source);
  };

  const firstNonEmptyValue = (source, paths = []) => {
    for (const path of paths) {
      const value = getPathValue(source, path);
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
      if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
      }
    }
    return '';
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

  const formatAmount = (value) => {
    const amount = Number(value || 0);
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} DT`;
  };

  const getCustomerName = (source = {}) => (
    customerProfile?.name ||
    customerProfile?.fullName ||
    firstNonEmptyValue(source, [
      'customer.name',
      'customer.fullName',
      'customerName',
      'buyer.name',
      'buyer.fullName',
      'contact.name',
      'contact.fullName',
      'checkout.customerName',
      'checkout.customer.name',
      'shippingAddress.contactName',
      'shippingAddress.fullName',
      'userId.name',
      'user.name',
    ]) ||
    (typeof source.userId === 'string' ? `User ID: ${source.userId}` : 'N/A')
  );

  const getCustomerEmail = (source = {}) => (
    customerProfile?.email ||
    firstNonEmptyValue(source, [
      'customer.email',
      'buyer.email',
      'contact.email',
      'customerEmail',
      'checkout.email',
      'checkout.customer.email',
      'shippingAddress.email',
      'userId.email',
      'user.email',
    ]) ||
    'Not provided'
  );

  const getCustomerPhone = (source = {}) => (
    customerProfile?.phone ||
    firstNonEmptyValue(source, [
      'customer.phone',
      'buyer.phone',
      'contact.phone',
      'customerPhone',
      'checkout.phone',
      'shippingAddress.phone',
      'userId.phone',
      'user.phone',
    ]) ||
    'Not provided'
  );

  const getShippingAddress = (source = {}) => {
    const address = source.shippingAddress || source.deliveryAddress || source.customer?.address;
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

  const getItemName = (item = {}) => item.productName || item.name || item.title || 'Product';
  const getItemColor = (item = {}) => item.color || item.colour || item.selectedColor || item.variant?.color || 'N/A';
  const getItemSize = (item = {}) => item.size || item.selectedSize || item.variant?.size || 'N/A';
  const getItemQty = (item = {}) => item.quantity || item.qty || 1;
  const getItemPrice = (item = {}) => Number(item.unitPrice || item.price || 0);
  const getItemsSubtotal = (itemsList = []) =>
    itemsList.reduce((sum, item) => sum + getItemPrice(item) * getItemQty(item), 0);
  const getItemImage = (item = {}) => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      const first = item.images[0];
      if (typeof first === 'string') return first;
      if (typeof first === 'object') return first?.url || first?.src || null;
    }
    return item.image || item.imageUrl || item.productImage || item.thumbnail || null;
  };

  useEffect(() => {
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

    const resolveOrderUserId = (resolvedOrder) => {
      if (typeof resolvedOrder?.userId === 'string') return resolvedOrder.userId.trim();
      if (resolvedOrder?.userId && typeof resolvedOrder.userId === 'object') {
        return String(resolvedOrder.userId._id || resolvedOrder.userId.id || '').trim();
      }
      return '';
    };

    const fetchOrder = async () => {
      if (!orderId) {
        setError('Invalid order id');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await apiClient.getOrderById(orderId);
        if (res && res.success) {
          const resolvedOrder =
            res?.data?.order ||
            (res?.data && !Array.isArray(res.data) ? res.data : null) ||
            res?.order ||
            res;
          setOrder(resolvedOrder);

          const resolvedUserId = resolveOrderUserId(resolvedOrder);
          if (resolvedUserId) {
            try {
              const userResponse = await apiClient.getBuyerBasicById(resolvedUserId);
              const user = resolveUserPayload(userResponse);
              const returnedId = extractUserId(user);
              if (user && (!returnedId || returnedId === resolvedUserId)) {
                setCustomerProfile(user);
              } else {
                setCustomerProfile(null);
              }
            } catch (_userErr) {
              setCustomerProfile(null);
            }
          } else {
            setCustomerProfile(null);
          }
        } else {
          setError(res?.message || 'Order not found');
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleChangeStatus = async (newStatus) => {
    if (!order) return;
    try {
      const action =
        newStatus === 'confirmed' ? 'confirm' : newStatus === 'rejected' ? 'reject' : 'cancel';
      await apiClient.updateStoreOrderAction(order._id || order.id, action);
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      console.error('Error updating status', err);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <LoadingState
        title="Loading order"
        message="Fetching order details…"
        detail="Retrieving order and customer information."
        icon={Loader2}
      />
    );
  }

  if (error) {
    return (
      <div className="dashboard-page orders-page">
        <div className="page-header">
          <div>
            <div className="orders-eyebrow">Order Lookup</div>
            <h1 className="page-title">Order</h1>
            <p className="page-subtitle">Order details</p>
          </div>
          <div>
            <button className="btn-secondary" onClick={() => navigate('/orders')}>Back</button>
          </div>
        </div>

        <div className="content-card">
          <div className="card-body">
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const normalizedStatus = normalizeStoreOrderStatus(order?.status);
  const items = Array.isArray(order?.items) ? order.items : [];
  const customerName = getCustomerName(order || {});
  const customerEmail = getCustomerEmail(order || {});
  const customerPhone = getCustomerPhone(order || {});
  const shippingAddress = getShippingAddress(order || {});
  const itemsSubtotal = getItemsSubtotal(items);
  const shippingAmount = Number(order?.shippingCost || 0);
  const taxAmount = Number(order?.tax || 0);
  const discountAmount = Number(order?.discount || 0);
  const displayedTotal = formatAmount(order?.payableTotal || order?.total || order?.totalAmount || 0);
  const itemBreakdown = items
    .map((item) => {
      const qty = getItemQty(item);
      const unitPrice = getItemPrice(item);
      return `${formatAmount(unitPrice)} x ${qty}`;
    })
    .join(' + ');
  const summaryDetails = [
    itemBreakdown || formatAmount(itemsSubtotal),
    shippingAmount ? `+ ${formatAmount(shippingAmount)}` : '',
    taxAmount ? `+ ${formatAmount(taxAmount)}` : '',
    discountAmount ? `- ${formatAmount(discountAmount)}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleExportInvoicePdf = () => {
    if (!order) return;

    const invoiceId = `INV-${String(order.orderNumber || orderId || '').replace(/\s+/g, '').toUpperCase()}`;
    const issueDate = formatDate(order?.createdAt);
    const logoUrl = `${window.location.origin}/mallify.png`;

    const escapeHtml = (value) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const itemRows = items
      .map((item) => {
        const qty = getItemQty(item);
        const unitPrice = getItemPrice(item);
        const lineTotal = unitPrice * qty;
        return `
          <tr>
            <td>${escapeHtml(getItemName(item))}</td>
            <td>${escapeHtml(getItemColor(item))}</td>
            <td>${escapeHtml(getItemSize(item))}</td>
            <td class="num">${qty}</td>
            <td class="num">${escapeHtml(formatAmount(unitPrice))}</td>
            <td class="num">${escapeHtml(formatAmount(lineTotal))}</td>
          </tr>
        `;
      })
      .join('');

    const invoiceHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice ${escapeHtml(order.orderNumber || orderId)}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 24px; }
            .invoice { max-width: 900px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
            .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .brand { display: flex; align-items: center; gap: 10px; }
            .brand img { width: 40px; height: 40px; object-fit: contain; }
            .brand h1 { margin: 0; font-size: 22px; }
            .muted { color: #6b7280; font-size: 12px; }
            .meta { text-align: right; }
            .meta h2 { margin: 0; font-size: 18px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
            .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
            .card h3 { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; color: #6b7280; letter-spacing: .03em; }
            .row { margin: 2px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 10px 8px; font-size: 13px; text-align: left; }
            th { background: #f9fafb; color: #374151; }
            .num { text-align: right; white-space: nowrap; }
            .totals { margin-top: 16px; margin-left: auto; width: 320px; }
            .totals .line { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
            .totals .total { border-top: 2px solid #111827; margin-top: 8px; padding-top: 8px; font-size: 16px; font-weight: 700; }
            .footer { margin-top: 24px; font-size: 12px; color: #6b7280; text-align: center; }
            @media print { body { padding: 0; } .invoice { border: none; border-radius: 0; } }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="top">
              <div class="brand">
                <img src="${escapeHtml(logoUrl)}" alt="Mallify logo" />
                <div>
                  <h1>Mallify</h1>
                  <div class="muted">Invoice / Facture</div>
                </div>
              </div>
              <div class="meta">
                <h2>${escapeHtml(invoiceId)}</h2>
                <div class="muted">Order #${escapeHtml(order.orderNumber || orderId)}</div>
                <div class="muted">Date: ${escapeHtml(issueDate)}</div>
              </div>
            </div>

            <div class="grid">
              <div class="card">
                <h3>Billed To</h3>
                <div class="row"><strong>${escapeHtml(customerName)}</strong></div>
                <div class="row">${escapeHtml(customerEmail)}</div>
                <div class="row">${escapeHtml(customerPhone)}</div>
                <div class="row">${escapeHtml(shippingAddress)}</div>
              </div>
              <div class="card">
                <h3>Order Info</h3>
                <div class="row">Status: ${escapeHtml(normalizedStatus)}</div>
                <div class="row">Created: ${escapeHtml(formatDate(order?.createdAt))}</div>
                <div class="row">Updated: ${escapeHtml(formatDate(order?.updatedAt || order?.createdAt))}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th class="num">Qty</th>
                  <th class="num">Unit Price</th>
                  <th class="num">Line Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>

            <div class="totals">
              <div class="line"><span>Items Subtotal</span><span>${escapeHtml(formatAmount(itemsSubtotal))}</span></div>
              ${shippingAmount ? `<div class="line"><span>Shipping</span><span>${escapeHtml(formatAmount(shippingAmount))}</span></div>` : ''}
              ${taxAmount ? `<div class="line"><span>Tax</span><span>${escapeHtml(formatAmount(taxAmount))}</span></div>` : ''}
              ${discountAmount ? `<div class="line"><span>Discount</span><span>- ${escapeHtml(formatAmount(discountAmount))}</span></div>` : ''}
              <div class="line total"><span>Total</span><span>${escapeHtml(displayedTotal)}</span></div>
            </div>

            <div class="footer">Thank you for choosing Mallify.</div>
          </div>
          <script>
            window.onload = function () { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  return (
    <div className="dashboard-page orders-page">
      <div className="page-header">
        <div>
         
          <h1 className="page-title">Order #{order.orderNumber || orderId}</h1>
          <p className="page-subtitle">Store segment details and actions</p>
        </div>
        <div className="order-header-actions">
          <button className="btn-primary" onClick={handleExportInvoicePdf}>Export PDF</button>
          <button className="btn-secondary" onClick={() => navigate('/orders')}>Back</button>
        </div>
      </div>

      <div className="content-card">
        <div className="card-body">
          <div className="order-details-grid">
            <div className="order-inline-section">
              <h4>Customer</h4>
              <div className="order-inline-customer-grid">
                <span className="customer-label">Name</span>
                <span className="customer-value">{customerName}</span>
                <span className="customer-label">Email</span>
                <span className="customer-value">{customerEmail}</span>
                <span className="customer-label">Phone</span>
                <span className="customer-value">{customerPhone}</span>
                <span className="customer-label">Address</span>
                <span className="customer-value">{shippingAddress}</span>
              </div>
            </div>

            <div className="order-inline-section order-details-summary">
              <h4>Summary</h4>
              <div className="order-summary-list">
                <div className="order-summary-row">
                  <span className="customer-label">Status</span>
                  <span className={`status-badge ${normalizedStatus}`}>{normalizedStatus}</span>
                </div>
                <div className="order-summary-row">
                  <span className="customer-label">Created</span>
                  <span className="customer-value">{formatDate(order?.createdAt)}</span>
                </div>
                <div className="order-summary-row">
                  <span className="customer-label">Last Update</span>
                  <span className="customer-value">{formatDate(order?.updatedAt || order?.createdAt)}</span>
                </div>
                <div className="order-summary-row">
                  <span className="customer-label">Details</span>
                  <span className="customer-value order-summary-breakdown">
                    {summaryDetails}
                  </span>
                </div>
                <div className="order-summary-row">
                  <span className="customer-label">Total</span>
                  <span className="customer-value order-summary-total">{displayedTotal}</span>
                </div>
                
              </div>

              <div className="order-details-actions">
                {normalizedStatus !== 'confirmed' && (
                  <button
                    className="btn-icon btn-icon-labeled btn-icon-confirm"
                    title="Confirm"
                    onClick={() => handleChangeStatus('confirmed')}
                  >
                    <CheckCircle size={16} />
                    <span>Confirm</span>
                  </button>
                )}
                {normalizedStatus !== 'rejected' && (
                  <button
                    className="btn-icon btn-icon-labeled btn-icon-reject"
                    title="Reject"
                    onClick={() => handleChangeStatus('rejected')}
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-body">
          <div className="order-inline-section order-inline-products">
            <h4>Products</h4>
            {items.length === 0 ? (
              <p>No products available for this order.</p>
            ) : (
              <div className="order-inline-products-list">
                {items.map((item, index) => {
                  const imageUrl = getItemImage(item);
                  const qty = getItemQty(item);
                  const unitPrice = getItemPrice(item);
                  const lineTotal = unitPrice * qty;
                  return (
                    <div key={item._id || item.id || `${order?._id || orderId}-detail-${index}`} className="order-inline-product-item">
                      {imageUrl ? (
                        <img src={imageUrl} alt={getItemName(item)} className="order-inline-product-image" />
                      ) : (
                        <div className="order-inline-product-image order-inline-product-image-placeholder">No image</div>
                      )}
                      <span className="order-inline-product-name">{getItemName(item)}</span>
                      <span className="order-inline-product-chip">Qty {qty}</span>
                      <span className="order-inline-product-chip">Color {getItemColor(item)}</span>
                      <span className="order-inline-product-chip">Size {getItemSize(item)}</span>
                      <span className="order-inline-product-price">
                        {`${formatAmount(unitPrice)} x ${qty} = ${formatAmount(lineTotal)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
