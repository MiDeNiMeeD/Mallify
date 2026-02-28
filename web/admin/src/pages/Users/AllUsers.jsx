import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiEdit2, FiTrash2, FiMail, FiPhone, FiCalendar, FiUser, FiShield } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import './AllUsers.css';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
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
      const response = await apiClient.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiClient.deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await apiClient.updateUser(userId, { status: newStatus });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
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

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    customers: users.filter(u => u.role === 'customer').length,
    boutiques: users.filter(u => u.role === 'boutique_owner').length,
    drivers: users.filter(u => u.role === 'driver').length,
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Admin', class: 'badge-admin' },
      customer: { label: 'Customer', class: 'badge-customer' },
      boutique_owner: { label: 'Boutique', class: 'badge-boutique' },
      driver: { label: 'Driver', class: 'badge-driver' },
      delivery_manager: { label: 'Manager', class: 'badge-manager' },
    };
    return badges[role] || { label: role, class: 'badge-default' };
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? 'status-active' : 'status-suspended';
  };

  if (loading) {
    return (
      <div className="all-users-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-users-page">
      <div className="page-header">
        <div>
          <h1><FiUser /> All Users</h1>
          <p>Manage and monitor all platform users</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="users-stats">
        <div className="stat-card">
          <FiUser className="stat-icon" />
          <div className="stat-details">
            <h3>{stats.total}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <FiShield className="stat-icon active" />
          <div className="stat-details">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card">
          <FiUser className="stat-icon customer" />
          <div className="stat-details">
            <h3>{stats.customers}</h3>
            <p>Customers</p>
          </div>
        </div>
        <div className="stat-card">
          <FiUser className="stat-icon boutique" />
          <div className="stat-details">
            <h3>{stats.boutiques}</h3>
            <p>Boutiques</p>
          </div>
        </div>
        <div className="stat-card">
          <FiUser className="stat-icon driver" />
          <div className="stat-details">
            <h3>{stats.drivers}</h3>
            <p>Drivers</p>
          </div>
        </div>
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
            <option value="customer">Customers</option>
            <option value="boutique_owner">Boutiques</option>
            <option value="driver">Drivers</option>
            <option value="delivery_manager">Managers</option>
            <option value="admin">Admins</option>
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
              <th>Email</th>
              <th>Phone</th>
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
                  No users found
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
                    </td>
                    <td>
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
                        <button className="btn-action btn-edit" title="Edit">
                          <FiEdit2 />
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
