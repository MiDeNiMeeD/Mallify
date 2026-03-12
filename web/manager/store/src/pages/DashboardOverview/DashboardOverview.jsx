import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiCheckCircle, FiClock, FiDollarSign, FiShoppingCart, FiPackage, FiSearch, FiEye } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBoutiques: 0,
    activeBoutiques: 0,
    pendingApprovals: 0,
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
  });
  const [recentBoutiques, setRecentBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch both boutiques and applications
      const [boutiquesResponse, applicationsResponse] = await Promise.all([
        apiClient.getBoutiques({ limit: 100 }),
        apiClient.getBoutiqueApplications({ limit: 100 })
      ]);
      
      const boutiques = boutiquesResponse.data?.boutiques || [];
      const applications = applicationsResponse.data?.applications || [];
      
      // Map applications to match boutique structure
      const mappedApplications = applications.map(app => ({
        _id: app._id,
        name: app.boutiqueName,
        email: app.email,
        status: app.status,
        createdAt: app.submittedAt || app.createdAt,
        productCount: 0,
        totalSales: 0,
        totalOrders: 0,
        isApplication: true,
        ownerName: app.ownerName,
        phone: app.phone
      }));
      
      // Combine boutiques and applications
      const allItems = [...boutiques, ...mappedApplications];
      
      const activeBoutiques = boutiques.filter(b => b.status === 'active').length;
      const pendingItems = allItems.filter(b => b.status === 'pending').length;
      const totalSales = boutiques.reduce((sum, b) => sum + (b.totalSales || 0), 0);
      const totalOrders = boutiques.reduce((sum, b) => sum + (b.totalOrders || 0), 0);
      
      setStats({
        totalBoutiques: boutiques.length,
        activeBoutiques,
        pendingApprovals: pendingItems,
        totalSales,
        totalOrders,
        totalProducts: boutiques.reduce((sum, b) => sum + (b.productCount || 0), 0),
      });

      setRecentBoutiques(allItems);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredBoutiques = recentBoutiques
    .filter(boutique => {
      const matchesSearch = boutique.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           boutique.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || boutique.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Monitor platform performance and manage boutiques</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Boutiques</span>
            <div className="stat-icon pink">
              <FiShoppingBag />
            </div>
          </div>
          <div className="stat-value">{stats.totalBoutiques}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active Boutiques</span>
            <div className="stat-icon success">
              <FiCheckCircle />
            </div>
          </div>
          <div className="stat-value">{stats.activeBoutiques}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pending Approvals</span>
            <div className="stat-icon warning">
              <FiClock />
            </div>
          </div>
          <div className="stat-value">{stats.pendingApprovals}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Platform Sales</span>
            <div className="stat-icon success">
              <FiDollarSign />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(stats.totalSales)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Orders</span>
            <div className="stat-icon info">
              <FiShoppingCart />
            </div>
          </div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Products</span>
            <div className="stat-icon warning">
              <FiPackage />
            </div>
          </div>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title" style={{ margin: 0 }}>Recent Boutiques (Last 5)</h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="search-bar" style={{ marginBottom: 0 }}>
              <FiSearch className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search boutiques..."
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
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          {filteredBoutiques.length === 0 ? (
            <div className="empty-state">
              <FiShoppingBag className="empty-state-icon" />
              <div className="empty-state-title">No boutiques found</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: '100%', width: 'max-content' }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: '250px' }}>Boutique</th>
                    <th style={{ minWidth: '120px' }}>Status</th>
                    <th style={{ minWidth: '100px' }}>Products</th>
                    <th style={{ minWidth: '120px' }}>Sales</th>
                    <th style={{ minWidth: '100px' }}>Orders</th>
                    <th style={{ minWidth: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBoutiques.map((boutique) => (
                    <tr key={boutique._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {boutique.logo ? (
                            <img 
                              src={boutique.logo} 
                              alt="" 
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '8px', 
                                objectFit: 'cover',
                                border: '1px solid var(--border-color)'
                              }} 
                            />
                          ) : (
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '8px', 
                              background: 'var(--bg-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <FiShoppingBag size={20} color="var(--text-secondary)" />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {boutique.name || 'Unnamed Boutique'}
                              {boutique.isApplication && (
                                <span style={{ 
                                  fontSize: '0.65rem', 
                                  padding: '0.15rem 0.4rem', 
                                  background: 'var(--warning-color)',
                                  color: 'white',
                                  borderRadius: '4px',
                                  fontWeight: 500
                                }}>
                                  NEW APPLICATION
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {boutique.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${boutique.status}`}>
                          {boutique.status || 'pending'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{boutique.status === 'pending' ? '—' : (boutique.productCount || 0)}</td>
                      <td style={{ fontWeight: 600, color: boutique.status === 'pending' ? 'var(--warning-color)' : (boutique.totalSales > 0 ? 'var(--success-color)' : 'var(--text-secondary)') }}>
                        {boutique.status === 'pending' ? 'Pending' : formatCurrency(boutique.totalSales || 0)}
                      </td>
                      <td style={{ color: boutique.status === 'pending' ? 'var(--warning-color)' : 'inherit' }}>
                        {boutique.status === 'pending' ? 'Pending' : (boutique.totalOrders || 0)}
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary" 
                          style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
                          onClick={() => navigate(`/boutiques/${boutique._id}`)}
                        >
                          <FiEye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
