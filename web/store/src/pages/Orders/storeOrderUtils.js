export const extractPrimaryStoreId = (user) => {
  const list = Array.isArray(user?.boutiqueList) ? user.boutiqueList : [];
  for (const entry of list) {
    if (typeof entry === 'string' && entry.trim()) return entry.trim();
    const candidate = entry?._id || entry?.id || entry?.boutiqueId || entry?.storeId;
    if (candidate) return String(candidate);
  }
  return '';
};

export const normalizeStoreOrderStatus = (value) => {
  const status = String(value || '').toLowerCase().trim();
  if (!status) return 'pending';
  if (status.includes('confirm') || status.includes('process') || status.includes('ship')) return 'confirmed';
  if (status.includes('reject')) return 'rejected';
  if (status.includes('cancel')) return 'cancelled';
  return status;
};

export const orderAmount = (order) => {
  return Number(order?.payableTotal ?? order?.total ?? order?.totalAmount ?? 0);
};

export const orderItemsCount = (order) => {
  return Array.isArray(order?.items) ? order.items.length : 0;
};

export const orderCustomerName = (order) => {
  if (order?.userId && typeof order.userId === 'object') {
    return order.userId.name || order.userId.fullName || 'N/A';
  }
  return 'N/A';
};

export const orderCustomerEmail = (order) => {
  if (order?.userId && typeof order.userId === 'object') {
    return order.userId.email || 'N/A';
  }
  return 'N/A';
};
