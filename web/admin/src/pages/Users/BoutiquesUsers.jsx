import React, { useState, useEffect } from 'react';
import { FiSearch, FiShoppingBag, FiMail, FiPhone, FiMapPin, FiCalendar, FiEye, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import Toast from '../../components/Toast';
import '../Users/Customers.css';

const BoutiquesUsers = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [selectedBoutique, setSelectedBoutique] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const boutiquesPerPage = 10;

  useEffect(() => {
    fetchBoutiques();
  }, []);

  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await apiClient.getUsers({ role: 'boutique_owner' });
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.users || [];
      const boutiqueData = payload.filter(user => user.role === 'boutique_owner');
      setBoutiques(boutiqueData);
    } catch (error) {
      console.error('Error fetching boutiques:', error);
      setLoadError(error?.message || 'Failed to fetch boutiques');
      setToast({ show: true, message: 'Failed to fetch boutiques.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast({ show: false, message: '', type: 'info' });
    setPendingDeleteId(null);
  };

  const handleDeleteBoutique = (boutiqueId) => {
    setPendingDeleteId(boutiqueId);
    setToast({
      show: true,
      message: 'Delete this boutique owner? This action cannot be undone.',
      type: 'warning',
    });
  };

  const confirmDeleteBoutique = async () => {
    if (!pendingDeleteId) {
      return;
    }

    try {
      await apiClient.deleteUser(pendingDeleteId);
      setBoutiques(boutiques.filter(boutique => boutique._id !== pendingDeleteId));
      showToast('Boutique owner deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting boutique owner:', error);
      showToast('Failed to delete boutique owner.', 'error');
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleViewBoutique = (boutique) => {
    setSelectedBoutique(boutique);
    fetchBoutiqueOrders(boutique);
  };

  const handleEditBoutique = (boutique) => {
    showToast(`Edit boutique ${boutique.name || ''} not implemented yet.`, 'info');
  };

  const closeBoutiqueModal = () => {
    setSelectedBoutique(null);
    setOrders([]);
    setOrdersError('');
    setOrdersLoading(false);
  };

  const fetchBoutiqueOrders = async (boutique) => {
    const boutiqueId = boutique?.boutiqueId || boutique?.storeId || boutique?._id;
    if (!boutiqueId) {
      setOrders([]);
      setOrdersError('Missing boutique id.');
      return;
    }

    try {
      setOrdersLoading(true);
      setOrdersError('');
      const response = await apiClient.getOrders({ boutiqueId });
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.orders || response.data?.data?.orders || [];
      setOrders(payload);
    } catch (error) {
      console.error('Error fetching boutique orders:', error);
      setOrdersError(error?.message || 'Failed to fetch orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const filteredBoutiques = boutiques.filter(boutique =>
    boutique.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    boutique.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, boutiques.length]);

  const indexOfLastBoutique = currentPage * boutiquesPerPage;
  const indexOfFirstBoutique = indexOfLastBoutique - boutiquesPerPage;
  const currentBoutiques = filteredBoutiques.slice(indexOfFirstBoutique, indexOfLastBoutique);
  const totalPages = Math.ceil(filteredBoutiques.length / boutiquesPerPage);

  const stats = {
    total: boutiques.length,
    active: boutiques.filter(b => b.status === 'active').length,
    verified: boutiques.filter(b => b.verified).length,
    pending: boutiques.filter(b => !b.verified).length,
  };

  if (loading) {
    return (
      <div className="customers-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading boutiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customers-page boutiques-page">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
        actions={
          pendingDeleteId
            ? [
                { label: 'Cancel', onClick: closeToast },
                { label: 'Confirm', onClick: confirmDeleteBoutique, variant: 'primary' },
              ]
            : []
        }
      />
      <div className="page-header">
        <div>
          <h1><FiShoppingBag /> Boutique Owners</h1>
          <p>Manage boutique owner accounts</p>
        </div>
      </div>

      <div className="customers-stats">
        <div className="stat-card">
          <FiShoppingBag className="stat-icon boutique" />
          <div className="stat-details">
            <h3>{stats.total}</h3>
            <p>Total Boutiques</p>
          </div>
        </div>
        <div className="stat-card">
          <FiShoppingBag className="stat-icon verified" />
          <div className="stat-details">
            <h3>{stats.verified}</h3>
            <p>Verified</p>
          </div>
        </div>
        <div className="stat-card">
          <FiShoppingBag className="stat-icon pending" />
          <div className="stat-details">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <FiShoppingBag className="stat-icon active" />
          <div className="stat-details">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
        </div>
      </div>

      <div className="users-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search boutiques..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Boutique</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBoutiques.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  {loadError || 'No boutiques found'}
                </td>
              </tr>
            ) : (
              currentBoutiques.map(boutique => (
                <tr key={boutique._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        <FiShoppingBag />
                      </div>
                      <div>
                        <div className="user-name">{boutique.name}</div>
                        <div className="user-id">ID: {boutique._id?.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-email">
                      <FiMail />
                      {boutique.email}
                    </div>
                  </td>
                  <td>
                    <div className="user-phone">
                      <FiPhone />
                      {boutique.phone || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${boutique.verified ? 'status-verified' : 'status-pending'}`}>
                      {boutique.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="user-date">
                      <FiCalendar />
                      {boutique.createdAt ? new Date(boutique.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleViewBoutique(boutique)}
                        title="View"
                      >
                        <FiEye />
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEditBoutique(boutique)}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteBoutique(boutique._id)}
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

      {selectedBoutique && (
        <div className="customer-modal-overlay" onClick={closeBoutiqueModal}>
          <div
            className="customer-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="customer-modal-header">
              <div>
                <h2>{selectedBoutique.name || 'Boutique Owner'}</h2>
                <p>Boutique details and order history</p>
              </div>
              <button className="modal-close" onClick={closeBoutiqueModal} aria-label="Close">
                <FiX />
              </button>
            </div>

            <div className="customer-modal-body">
              <div className="customer-detail-card">
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedBoutique.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{selectedBoutique.phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{selectedBoutique.address?.city || 'No address'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge ${selectedBoutique.verified ? 'status-verified' : 'status-pending'}`}>
                    {selectedBoutique.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Joined</span>
                  <span className="detail-value">
                    {selectedBoutique.createdAt ? new Date(selectedBoutique.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Boutique ID</span>
                  <span className="detail-value mono">{selectedBoutique.boutiqueId || selectedBoutique.storeId || selectedBoutique._id}</span>
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

export default BoutiquesUsers;
