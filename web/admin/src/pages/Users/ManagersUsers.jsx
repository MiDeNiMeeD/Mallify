import React, { useState, useEffect } from 'react';
import { FiSearch, FiShield, FiMail, FiPhone, FiCalendar, FiUsers, FiEye, FiEdit2, FiTrash2, FiX, FiUserPlus, FiFilter } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import Toast from '../../components/Toast';

const ManagersUsers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const managersPerPage = 10;

  // Add Manager form state
  const [newManager, setNewManager] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'delivery_manager',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await apiClient.getUsers();
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.users || [];
      const managerData = payload.filter(user => 
        user.role === 'delivery_manager' || user.role === 'boutiques_manager'
      );
      setManagers(managerData);
    } catch (error) {
      console.error('Error fetching managers:', error);
      setLoadError(error?.message || 'Failed to fetch managers');
      setToast({ show: true, message: 'Failed to fetch managers.', type: 'error' });
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

  const handleDeleteManager = (managerId) => {
    setPendingDeleteId(managerId);
    setToast({
      show: true,
      message: 'Delete this manager? This action cannot be undone.',
      type: 'warning',
    });
  };

  const confirmDeleteManager = async () => {
    if (!pendingDeleteId) {
      return;
    }

    try {
      await apiClient.deleteUser(pendingDeleteId);
      setManagers(managers.filter(manager => manager._id !== pendingDeleteId));
      showToast('Manager deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting manager:', error);
      showToast('Failed to delete manager.', 'error');
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleViewManager = (manager) => {
    setSelectedManager(manager);
  };

  const handleEditManager = (manager) => {
    showToast(`Edit manager ${manager.name || ''} not implemented yet.`, 'info');
  };

  const handleAddManager = () => {
    setShowAddModal(true);
    setNewManager({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'delivery_manager',
      status: 'active'
    });
    setFormErrors({});
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewManager({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'delivery_manager',
      status: 'active'
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!newManager.name.trim()) errors.name = 'Name is required';
    if (!newManager.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newManager.email)) {
      errors.email = 'Email is invalid';
    }
    if (!newManager.password) {
      errors.password = 'Password is required';
    } else if (newManager.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!newManager.phone.trim()) errors.phone = 'Phone is required';
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewManager(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitManager = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      // Add skipEmailVerification flag for admin-created managers
      const userData = { ...newManager, skipEmailVerification: true };
      const response = await apiClient.createUser(userData);
      // Refresh the managers list
      await fetchManagers();
      closeAddModal();
      showToast('Manager created successfully.', 'success');
    } catch (error) {
      console.error('Error creating manager:', error);
      showToast(error.message || 'Failed to create manager.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const closeManagerModal = () => {
    setSelectedManager(null);
  };

  const filteredManagers = managers.filter(manager => {
    const matchesSearch = manager.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          manager.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || manager.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, managers.length]);

  const indexOfLastManager = currentPage * managersPerPage;
  const indexOfFirstManager = indexOfLastManager - managersPerPage;
  const currentManagers = filteredManagers.slice(indexOfFirstManager, indexOfLastManager);
  const totalPages = Math.ceil(filteredManagers.length / managersPerPage);

  const stats = {
    total: managers.length,
    active: managers.filter(m => m.status === 'active').length,
    deliveryManagers: managers.filter(m => m.role === 'delivery_manager').length,
    boutiquesManagers: managers.filter(m => m.role === 'boutiques_manager').length,
  };

  const statCards = [
    {
      title: 'Total Managers',
      value: stats.total,
      icon: FiShield,
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#2563EB',
    },
    {
      title: 'Active',
      value: stats.active,
      icon: FiShield,
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#059669',
    },
    {
      title: 'Delivery',
      value: stats.deliveryManagers,
      icon: FiUsers,
      iconBg: 'rgba(96, 165, 250, 0.15)',
      iconColor: '#3B82F6',
    },
    {
      title: 'Boutiques',
      value: stats.boutiquesManagers,
      icon: FiUsers,
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#D97706',
    },
  ];

  if (loading) {
    return (
      <div className="customers-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading managers...</p>
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
                { label: 'Confirm', onClick: confirmDeleteManager, variant: 'primary' },
              ]
            : []
        }
      />
      <div className="page-header">
        <div>
          <h1><FiShield /> Platform Managers</h1>
          <p>Manage platform administrators and managers</p>
        </div>
        <button className="btn-add-manager" onClick={handleAddManager}>
          <FiUserPlus /> Add Manager
        </button>
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
            placeholder="Search managers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <FiFilter />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="delivery_manager">Delivery Managers</option>
            <option value="boutiques_manager">Boutiques Managers</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentManagers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {loadError || 'No managers found'}
                </td>
              </tr>
            ) : (
              currentManagers.map(manager => (
                <tr key={manager._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar manager-avatar">
                        <FiShield />
                      </div>
                      <div>
                        <div className="user-name">{manager.name}</div>
                        <div className="user-id">ID: {manager._id?.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-email">
                      <FiMail />
                      {manager.email}
                    </div>
                    <div className="user-phone">
                      <FiPhone />
                      {manager.phone || 'N/A'}
                    </div>
                  </td>
                 
                  <td>
                    <span className={`role-badge ${manager.role === 'delivery_manager' ? 'badge-delivery-manager' : 'badge-boutiques-manager'}`}>
                      {manager.role === 'delivery_manager' ? 'Delivery' : 'Boutiques'}
                    </span>
                  </td>
                  
                  <td>
                    <div className="user-date">
                      <FiCalendar />
                      {new Date(manager.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleViewManager(manager)}
                        title="View"
                      >
                        <FiEye />
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEditManager(manager)}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteManager(manager._id)}
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

      {selectedManager && (
        <div className="customer-modal-overlay" onClick={closeManagerModal}>
          <div
            className="customer-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="customer-modal-header">
              <div>
                <h2>{selectedManager.name || 'Manager'}</h2>
                <p>Manager details</p>
              </div>
              <button className="modal-close" onClick={closeManagerModal} aria-label="Close">
                <FiX />
              </button>
            </div>

            <div className="customer-modal-body">
              <div className="customer-detail-card">
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedManager.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{selectedManager.phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Role Type</span>
                  <span className={`role-badge ${selectedManager.role === 'delivery_manager' ? 'badge-delivery-manager' : 'badge-boutiques-manager'}`}>
                    {selectedManager.role === 'delivery_manager' ? 'Delivery Manager' : 'Boutiques Manager'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge ${selectedManager.status === 'active' ? 'status-active' : 'status-suspended'}`}>
                    {selectedManager.status || 'active'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Joined</span>
                  <span className="detail-value">
                    {selectedManager.createdAt ? new Date(selectedManager.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Manager ID</span>
                  <span className="detail-value mono">{selectedManager._id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Manager Modal */}
      {showAddModal && (
        <div className="customer-modal-overlay" onClick={closeAddModal}>
          <div
            className="customer-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="customer-modal-header">
              <div>
                <h2><FiUserPlus /> Add New Manager</h2>
                <p>Fill in the details to create a new manager account</p>
              </div>
              <button className="modal-close" onClick={closeAddModal} aria-label="Close">
                <FiX />
              </button>
            </div>

            <div className="customer-modal-body">
              <form onSubmit={handleSubmitManager} className="add-manager-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newManager.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className={formErrors.name ? 'input-error' : ''}
                  />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newManager.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className={formErrors.email ? 'input-error' : ''}
                  />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newManager.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className={formErrors.phone ? 'input-error' : ''}
                  />
                  {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newManager.password}
                    onChange={handleInputChange}
                    placeholder="Enter password (min 6 characters)"
                    className={formErrors.password ? 'input-error' : ''}
                  />
                  {formErrors.password && <span className="error-message">{formErrors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role Type *</label>
                  <select
                    id="role"
                    name="role"
                    value={newManager.role}
                    onChange={handleInputChange}
                  >
                    <option value="delivery_manager">Delivery Manager</option>
                    <option value="boutiques_manager">Boutiques Manager</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={newManager.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={closeAddModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Manager'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagersUsers;