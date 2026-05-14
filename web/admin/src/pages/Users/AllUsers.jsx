import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiMail,
  FiPhone,
  FiCalendar,
  FiUser,
  FiShield,
  FiUsers,
  FiShoppingBag
} from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import Toast from '../../components/Toast';
import './AllUsers.css';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await apiClient.getUsers();
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.users || [];
      setUsers(payload);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoadError(error?.message || 'Failed to fetch users');
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

  const handleDeleteUser = (userId) => {
    setPendingDeleteId(userId);
    setToast({
      show: true,
      message: 'Delete this user? This action cannot be undone.',
      type: 'warning',
    });
  };

  const confirmDeleteUser = async () => {
    if (!pendingDeleteId) {
      return;
    }

    try {
      await apiClient.deleteUser(pendingDeleteId);
      setUsers(users.filter(user => user._id !== pendingDeleteId));
      setToast({ show: true, message: 'User deleted successfully.', type: 'success' });
    } catch (error) {
      console.error('Error deleting user:', error);
      setToast({ show: true, message: 'Failed to delete user.', type: 'error' });
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await apiClient.updateUser(userId, { status: newStatus });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
      showToast(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully.`, 'success');
    } catch (error) {
      console.error('Error updating user status:', error);
      showToast('Failed to update user status.', 'error');
    }
  };

  // Filter users based on search and filters (exclude admins from view)
  const filteredUsers = users.filter(user => {
    // Exclude admins from the list
    if (user.role === 'admin') return false;
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Statistics (exclude admins)
  const nonAdminUsers = users.filter(u => u.role !== 'admin');
  const stats = {
    total: nonAdminUsers.length,
    active: nonAdminUsers.filter(u => u.status === 'active').length,
    suspended: nonAdminUsers.filter(u => u.status === 'suspended').length,
    customers: nonAdminUsers.filter(u => u.role === 'client').length,
    boutiques: nonAdminUsers.filter(u => u.role === 'boutique_owner').length,
    drivers: nonAdminUsers.filter(u => u.role === 'delivery_person').length,
  };

  const getRoleBadge = (role) => {
    const badges = {
      client: { label: 'Customer', class: 'badge-customer' },
      boutique_owner: { label: 'Boutique Owner', class: 'badge-boutique' },
      delivery_person: { label: 'Driver', class: 'badge-driver' },
      delivery_manager: { label: 'Delivery Manager', class: 'badge-manager' },
      boutiques_manager: { label: 'Boutiques Manager', class: 'badge-manager' },
    };
    return badges[role] || { label: role, class: 'badge-default' };
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? 'status-active' : 'status-suspended';
  };
  const statCards = [
    {
      title: 'Total Users',
      value: stats.total.toLocaleString(),
      icon: FiUsers,
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#2563EB'
    },
    {
      title: 'Active',
      value: stats.active.toLocaleString(),
      icon: FiShield,
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#059669'
    },
    {
      title: 'Customers',
      value: stats.customers.toLocaleString(),
      icon: FiUser,
      iconBg: 'rgba(96, 165, 250, 0.15)',
      iconColor: '#3B82F6'
    },
    {
      title: 'Boutiques',
      value: stats.boutiques.toLocaleString(),
      icon: FiShoppingBag,
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#D97706'
    }
  ];

 if (loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading boutiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-users-page">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
        actions={
          pendingDeleteId
            ? [
                { label: 'Cancel', onClick: closeToast },
                { label: 'Confirm', onClick: confirmDeleteUser, variant: 'primary' },
              ]
            : []
        }
      />
      <div className="page-header">
        <div>
          <h1><FiUser /> All Users</h1>
          <p>Manage and monitor all platform users</p>
        </div>
      </div>

      {/* Stats Grid */}
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
              <div className="admin-stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Filters */}
      <div className="users-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <FiFilter />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="client">Customers</option>
            <option value="boutique_owner">Boutique Owners</option>
            <option value="delivery_person">Drivers</option>
            <option value="delivery_manager">Delivery Managers</option>
            <option value="boutiques_manager">Boutiques Managers</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {loadError || 'No users found'}
                </td>
              </tr>
            ) : (
              currentUsers.map(user => {
                const roleBadge = getRoleBadge(user.role);
                return (
                  <tr key={user._id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-id">ID: {user._id?.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-email">
                        <FiMail />
                        {user.email}
                      </div>
                       <div className="user-phone">
                        <FiPhone />
                        {user.phone || 'N/A'}
                      </div>
                    </td>
                    
                    <td>
                      <span className={`role-badge ${roleBadge.class}`}>
                        {roleBadge.label}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(user.status)}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div className="user-date">
                        <FiCalendar />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-status"
                          onClick={() => handleStatusToggle(user._id, user.status || 'active')}
                          title={user.status === 'active' ? 'Suspend' : 'Activate'}
                        >
                          <FiShield />
                        </button>
                       
                        <button 
                          className="btn-action btn-delete"
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
    </div>
  );
};

export default AllUsers;
