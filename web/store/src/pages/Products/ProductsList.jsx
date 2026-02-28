import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye, Package } from 'lucide-react';
import { products } from '../../data/mockData';
import '../Dashboard/Dashboard.css';

function ProductsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product inventory and pricing</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/products/add')}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Products</span>
            <div className="stat-icon pink">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{products.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active</span>
            <div className="stat-icon success">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{products.filter(p => p.status === 'active').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Low Stock</span>
            <div className="stat-icon warning">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{products.filter(p => p.stock > 0 && p.stock <= 10).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Out of Stock</span>
            <div className="stat-icon pink">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{products.filter(p => p.stock === 0).length}</div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-body">
          <div className="filters-bar">
            <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: '200px' }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sales</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td><strong>{product.id}</strong></td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td><strong>{formatCurrency(product.price)}</strong></td>
                    <td>
                      <span style={{ 
                        color: product.stock === 0 ? 'var(--danger-color)' : 
                               product.stock <= 10 ? 'var(--warning-color)' : 
                               'var(--success-color)'
                      }}>
                        {product.stock} units
                      </span>
                    </td>
                    <td>{product.sales}</td>
                    <td>
                      <span className={`status-badge ${product.status}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" title="View">
                          <Eye size={16} />
                        </button>
                        <button className="btn-icon" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state-icon">📦</div>
                      <div className="empty-state-title">No products found</div>
                      <p>Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProductsList;
