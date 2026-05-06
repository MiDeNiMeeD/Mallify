import React, { useState, useEffect } from 'react';
import { FiSearch, FiUsers, FiStar, FiMapPin, FiPhone, FiMail, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import Toast from '../../components/Toast';
import '../../styles/Dashboard.css';

const AllDrivers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info', duration: 4000, actions: [] });
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [viewDriver, setViewDriver] = useState(null);
  const [formMode, setFormMode] = useState('add');
  const [formDriverId, setFormDriverId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    status: 'pending_verification',
    availability: 'offline'
  });
  const pageSize = 8;

  useEffect(() => {
    fetchDrivers();
  }, []);


  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDrivers({ limit: 100 });
      const driverList = response?.data?.drivers || response?.drivers || response?.data || [];
      setDrivers(Array.isArray(driverList) ? driverList : []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (driver) => {
    if (driver?.name) return driver.name;
    const firstName = driver?.firstName || '';
    const lastName = driver?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'N/A';
  };

  const getSuccessRate = (driver) => {
    const total = driver?.totalDeliveries || 0;
    const completed = driver?.completedDeliveries || 0;
    if (!total) return driver?.successRate || driver?.statistics?.successRate || 0;
    return Math.round((completed / total) * 100);
  };

  const showToast = (message, type = 'info', duration = 4000, actions = []) => {
    setToast({ show: true, message, type, duration, actions });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false, actions: [] }));
    setPendingDeleteId(null);
  };

  const openViewModal = (driver) => {
    setViewDriver(driver);
    setIsViewOpen(true);
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
    setViewDriver(null);
  };

  const openAddModal = () => {
    setFormMode('add');
    setFormDriverId(null);
    setFormState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      status: 'pending_verification',
      availability: 'offline'
    });
    setIsFormOpen(true);
  };

  const openEditModal = (driver) => {
    setFormMode('edit');
    setFormDriverId(driver._id);
    setFormState({
      firstName: driver.firstName || '',
      lastName: driver.lastName || '',
      email: driver.email || '',
      phone: driver.phone || '',
      licenseNumber: driver.licenseNumber || '',
      licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.slice(0, 10) : '',
      status: driver.status || 'pending_verification',
      availability: driver.availability || 'offline'
    });
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setFormDriverId(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (formMode === 'add') {
        const created = await apiClient.createDriver({
          firstName: formState.firstName,
          lastName: formState.lastName,
          email: formState.email,
          phone: formState.phone,
          licenseNumber: formState.licenseNumber,
          licenseExpiry: formState.licenseExpiry,
          status: formState.status,
          availability: formState.availability
        });
        const newDriver = created?.data || created;
        if (newDriver?._id) {
          setDrivers(prev => [newDriver, ...prev]);
        } else {
          fetchDrivers();
        }
        showToast('Driver added successfully.', 'success');
      } else {
        const updated = await apiClient.updateDriver(formDriverId, {
          firstName: formState.firstName,
          lastName: formState.lastName,
          email: formState.email,
          phone: formState.phone,
          licenseNumber: formState.licenseNumber,
          licenseExpiry: formState.licenseExpiry,
          status: formState.status,
          availability: formState.availability
        });
        const updatedDriver = updated?.data || updated;
        setDrivers(prev => prev.map(item => (item._id === formDriverId ? { ...item, ...updatedDriver } : item)));
        showToast('Driver updated successfully.', 'success');
      }
      closeFormModal();
    } catch (error) {
      showToast('Failed to save driver.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (driver) => {
    if (!driver?._id) return;
    const name = getDisplayName(driver);
    setPendingDeleteId(driver._id);
    showToast(`Delete ${name}?`, 'warning', 0, [
      {
        label: 'Delete',
        variant: 'danger',
        onClick: async () => {
          try {
            await apiClient.deleteDriver(driver._id);
            setDrivers(prev => prev.filter(item => item._id !== driver._id));
            setPendingDeleteId(null);
            showToast('Driver deleted successfully.', 'success');
          } catch (error) {
            showToast('Failed to delete driver.', 'error');
          }
        }
      },
      {
        label: 'Cancel',
        variant: 'secondary',
        onClick: hideToast
      }
    ]);
  };

  const filteredDrivers = drivers.filter(driver => {
    const displayName = getDisplayName(driver).toLowerCase();
    const email = (driver.email || driver.userId?.email || '').toLowerCase();
    const matchesSearch = displayName.includes(searchTerm.toLowerCase()) ||
                          email.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Drivers', value: drivers.length, icon: FiUsers, color: 'orange' },
    { label: 'Active', value: drivers.filter(d => d.status === 'active' || d.availability === 'available').length, icon: FiUsers, color: 'success' },
    { label: 'Inactive', value: drivers.filter(d => d.status === 'inactive' || d.availability === 'offline').length, icon: FiUsers, color: 'warning' },
    { label: 'Avg Rating', value: drivers.length > 0 ? (drivers.reduce((acc, d) => acc + (d.rating || 0), 0) / drivers.length).toFixed(1) : '0.0', icon: FiStar, color: 'info' }
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedDrivers = filteredDrivers.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading drivers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="dashboard-page">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        duration={toast.duration}
        actions={toast.actions}
      />
      <div className="page-header">
        <div>
          <h1 className="page-title">All Drivers</h1>
          <p className="page-subtitle">Manage and monitor delivery drivers</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FiUsers size={18} />
          Add New Driver
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid four-col">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">{stat.label}</span>
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon />
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Driver List</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="search-bar">
              <FiSearch className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="form-select" 
              style={{ width: 'auto', minWidth: '150px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Contact</th>
                <th>Zone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDrivers.map((driver) => (
                <tr key={driver._id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{getDisplayName(driver)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        ID: #{driver._id?.substring(0, 8) || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.813rem' }}>
                        <FiPhone size={12} />
                        {driver.phone || driver.userId?.phone || 'N/A'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.813rem', color: 'var(--text-secondary)' }}>
                        <FiMail size={12} />
                        {driver.email || driver.userId?.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiMapPin size={14} />
                      {driver.assignedZone || driver.currentZone || driver.zone || 'Unassigned'}
                    </div>
                  </td>

                  <td>
                    <span className={`status-badge ${driver.status}`}>{driver.status}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon btn-icon-info" title="View" onClick={() => openViewModal(driver)}>
                        <FiEye size={16} />
                      </button>
                      <button className="btn-icon btn-icon-warning" title="Edit" onClick={() => openEditModal(driver)}>
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        className={`btn-icon btn-icon-danger ${pendingDeleteId === driver._id ? 'active' : ''}`}
                        title="Delete"
                        onClick={() => handleDelete(driver)}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDrivers.length > 0 && totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredDrivers.length)} of {filteredDrivers.length}
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={safePage === 1}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      className={`pagination-btn ${page === safePage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={safePage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {filteredDrivers.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiUsers />
              </div>
              <div className="empty-state-title">No drivers found</div>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
    
    {isViewOpen && viewDriver && (
      <div className="modal-overlay" onClick={closeViewModal}>
        <div className="modal-content" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Driver Details</h3>
            <button className="btn-icon" onClick={closeViewModal} aria-label="Close">
              X
            </button>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div><strong>Name:</strong> {getDisplayName(viewDriver)}</div>
            <div><strong>Email:</strong> {viewDriver.email || viewDriver.userId?.email || 'N/A'}</div>
            <div><strong>Phone:</strong> {viewDriver.phone || viewDriver.userId?.phone || 'N/A'}</div>
            <div><strong>Status:</strong> {viewDriver.status || 'N/A'}</div>
            <div><strong>Availability:</strong> {viewDriver.availability || 'N/A'}</div>
            <div><strong>License #:</strong> {viewDriver.licenseNumber || 'N/A'}</div>
            <div><strong>License Expiry:</strong> {viewDriver.licenseExpiry ? viewDriver.licenseExpiry.slice(0, 10) : 'N/A'}</div>
            <div><strong>Zone:</strong> {viewDriver.assignedZone || viewDriver.currentZone || viewDriver.zone || 'Unassigned'}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-secondary" onClick={closeViewModal}>Close</button>
            <button className="btn btn-primary" onClick={() => { closeViewModal(); openEditModal(viewDriver); }}>
              Edit Driver
            </button>
          </div>
        </div>
      </div>
    )}

    {isFormOpen && (
      <div className="modal-overlay" onClick={closeFormModal}>
        <div className="modal-content" onClick={(event) => event.stopPropagation()}>
          <h3 style={{ marginBottom: '1rem' }}>{formMode === 'add' ? 'Add Driver' : 'Edit Driver'}</h3>
          <form onSubmit={handleFormSubmit}>
            {/* userId is now generated server-side; not collected in the form */}
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                className="form-input"
                name="firstName"
                value={formState.firstName}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                className="form-input"
                name="lastName"
                value={formState.lastName}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                name="email"
                value={formState.email}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                name="phone"
                value={formState.phone}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">License Number</label>
              <input
                className="form-input"
                name="licenseNumber"
                value={formState.licenseNumber}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">License Expiry</label>
              <input
                className="form-input"
                type="date"
                name="licenseExpiry"
                value={formState.licenseExpiry}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="status"
                value={formState.status}
                onChange={handleFormChange}
              >
                <option value="pending_verification">Pending Verification</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Availability</label>
              <select
                className="form-select"
                name="availability"
                value={formState.availability}
                onChange={handleFormChange}
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={closeFormModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : formMode === 'add' ? 'Add Driver' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default AllDrivers;
