import React, { useState, useEffect } from 'react';
import { FiSearch, FiShoppingBag, FiMail, FiPhone, FiCalendar, FiTrendingUp, FiEye, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import Toast from '../../components/Toast';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await apiClient.getUsers({ role: 'client' });
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.users || [];
      const customerData = payload.filter(user => user.role === 'client');
      setCustomers(customerData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoadError(error?.message || 'Failed to fetch customers');
      setToast({ show: true, message: 'Failed to fetch customers.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const closeToast = () => {
    setToast({ show: false, message: '', type: 'info' });
    setPendingDeleteId(null);
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const handleDeleteCustomer = (customerId) => {
    setPendingDeleteId(customerId);
    setToast({
      show: true,
      message: 'Delete this customer? This action cannot be undone.',
      type: 'warning',
    });
  };

  const confirmDeleteCustomer = async () => {
    if (!pendingDeleteId) {
      return;
    }

    try {
      await apiClient.deleteUser(pendingDeleteId);
      setCustomers(customers.filter(customer => customer._id !== pendingDeleteId));
      showToast('Customer deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showToast('Failed to delete customer.', 'error');
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerOrders(customer?._id);
  };

  const handleEditCustomer = (customer) => {
    showToast(`Edit customer ${customer.name || ''} not implemented yet.`, 'info');
  };

  const closeCustomerModal = () => {
    setSelectedCustomer(null);
    setOrders([]);
    setOrdersError('');
    setOrdersLoading(false);
  };

  const fetchCustomerOrders = async (customerId) => {
    if (!customerId) {
      setOrders([]);
      setOrdersError('Missing customer id.');
      return;
    }

    try {
      setOrdersLoading(true);
      setOrdersError('');
      const response = await apiClient.getOrders({ userId: customerId });
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.orders || response.data?.data?.orders || [];
      setOrders(payload);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      setOrdersError(error?.message || 'Failed to fetch orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, customers.length]);

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    totalOrders: customers.reduce((sum, c) => sum + (c.orderCount || 0), 0),
    totalSpent: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
  };

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.total,
      icon: FiShoppingBag,
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#2563EB',
    },
    {
      title: 'Active',
      value: stats.active,
      icon: FiTrendingUp,
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#059669',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FiShoppingBag,
      iconBg: 'rgba(96, 165, 250, 0.15)',
      iconColor: '#3B82F6',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalSpent / 1000).toFixed(1)}K`,
      icon: FiTrendingUp,
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#D97706',
    },
  ];

  if (loading) {
    return (
      <div className="customers-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
        actions={
          pendingDeleteId
            ? [
                { label: 'Cancel', onClick: closeToast },
                { label: 'Confirm', onClick: confirmDeleteCustomer, variant: 'primary' },
              ]
            : []
        }
      />
      <div className="page-header">
        <div>
          <h1><FiShoppingBag /> Customers</h1>
          <p>Manage customer accounts and monitor activity</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-title">{stat.title}</span>
              <div className="admin-stat-icon" style={{ background: stat.iconBg, color: stat.iconColor }}>
                <stat.icon size={22} />
              </div>
            </div>
            <div className="admin-stat-body">
              <div className="admin-stat-value">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="users-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  {loadError || 'No customers found'}
                </td>
              </tr>
            ) : (
              currentCustomers.map(customer => (
                <tr key={customer._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {customer.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="user-name">{customer.name}</div>
                        <div className="user-id">ID: {customer._id?.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-email">
                      <FiMail />
                      {customer.email}
                    </div>
                    <div className="user-phone">
                      <FiPhone />
                      {customer.phone || 'N/A'}
                    </div>
                  </td>
                  
                  <td>
                    <span className={`status-badge ${customer.status === 'active' ? 'status-active' : 'status-suspended'}`}>
                      {customer.status || 'active'}
                    </span>
                  </td>
                  <td>
                    <div className="user-date">
                      <FiCalendar />
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleViewCustomer(customer)}
                        title="View"
                      >
                        <FiEye />
                      </button>
                      {/* <button
                        className="btn-action btn-edit"
                        onClick={() => handleEditCustomer(customer)}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button> */}
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteCustomer(customer._id)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {selectedCustomer && (
        <div className="customer-modal-overlay" onClick={closeCustomerModal}>
          <div
            className="customer-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="customer-modal-header">
              <div>
                <h2>{selectedCustomer.name || 'Customer'}</h2>
                <p>Customer details and order history</p>
              </div>
              <button className="modal-close" onClick={closeCustomerModal} aria-label="Close">
                <FiX />
              </button>
            </div>

            <div className="customer-modal-body">
              <div className="customer-detail-card">
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedCustomer.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{selectedCustomer.phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge ${selectedCustomer.status === 'active' ? 'status-active' : 'status-suspended'}`}>
                    {selectedCustomer.status || 'active'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Joined</span>
                  <span className="detail-value">
                    {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Customer ID</span>
                  <span className="detail-value mono">{selectedCustomer._id}</span>
                </div>
              </div>

              <div className="customer-orders">
                <div className="orders-header">
                  <h3>Orders</h3>
                  <span>{orders.length} total</span>
                </div>

                {ordersLoading ? (
                  <div className="orders-loading">Loading orders...</div>
                ) : ordersError ? (
                  <div className="orders-error">{ordersError}</div>
                ) : orders.length === 0 ? (
                  <div className="orders-empty">No orders found</div>
                ) : (
                  <div className="orders-list">
                    {orders.map(order => (
                      <div key={order._id} className="order-item">
                        <div>
                          <div className="order-number">{order.orderNumber || `Order ${order._id?.slice(-6)}`}</div>
                          <div className="order-date">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div className="order-meta">
                          <span className={`status-badge ${order.status === 'active' || order.status === 'confirmed' ? 'status-active' : 'status-suspended'}`}>
                            {order.status || 'pending'}
                          </span>
                          <div className="order-total">
                            ${Number(order.total || order.payableTotal || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
