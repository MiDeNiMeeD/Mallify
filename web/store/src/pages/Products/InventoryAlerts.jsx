import React, { useState } from 'react';
import { Package, AlertTriangle, TrendingDown, RefreshCw } from 'lucide-react';
import { products } from '../../data/mockData';
import '../Dashboard/Dashboard.css';

function InventoryAlerts() {
  const lowStockProducts = products.filter(p => p.stock < 10 && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const handleRestock = (productId) => {
    alert(`Restock request sent for product ${productId}`);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory & Stock Alerts</h1>
          <p className="page-subtitle">Monitor stock levels and manage inventory alerts</p>
        </div>
        <button className="btn-primary">
          <RefreshCw size={18} />
          Sync Inventory
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Products</span>
            <div className="stat-icon pink"><Package size={20} /></div>
          </div>
          <div className="stat-value">{products.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Low Stock</span>
            <div className="stat-icon warning"><AlertTriangle size={20} /></div>
          </div>
          <div className="stat-value">{lowStockProducts.length}</div>
          <div className="stat-trend negative">⚠️ Needs attention</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Out of Stock</span>
            <div className="stat-icon danger"><TrendingDown size={20} /></div>
          </div>
          <div className="stat-value">{outOfStockProducts.length}</div>
          <div className="stat-trend negative">⚠️ Critical</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">In Stock</span>
            <div className="stat-icon success"><Package size={20} /></div>
          </div>
          <div className="stat-value">{products.filter(p => p.stock >= 10).length}</div>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="content-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} style={{ color: 'var(--warning-color)' }} />
              <h2 className="card-title">Low Stock Alerts</h2>
            </div>
            <span className="status-badge" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning-color)' }}>
              {lowStockProducts.length} Items
            </span>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock Level</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td><strong>{product.name}</strong></td>
                    <td>{product.category}</td>
                    <td>
                      <span style={{ 
                        color: product.stock < 5 ? 'var(--danger-color)' : 'var(--warning-color)',
                        fontWeight: 'bold'
                      }}>
                        {product.stock} units
                      </span>
                    </td>
                    <td>${product.price}</td>
                    <td>
                      <span className="status-badge" style={{ 
                        backgroundColor: product.stock < 5 ? 'var(--danger-light)' : 'var(--warning-light)',
                        color: product.stock < 5 ? 'var(--danger-color)' : 'var(--warning-color)'
                      }}>
                        {product.stock < 5 ? 'Critical' : 'Low Stock'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-secondary"
                        onClick={() => handleRestock(product.id)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        <RefreshCw size={14} />
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {outOfStockProducts.length > 0 && (
        <div className="content-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingDown size={20} style={{ color: 'var(--danger-color)' }} />
              <h2 className="card-title">Out of Stock</h2>
            </div>
            <span className="status-badge" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger-color)' }}>
              {outOfStockProducts.length} Items
            </span>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Last Stock Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {outOfStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td><strong>{product.name}</strong></td>
                    <td>{product.category}</td>
                    <td>${product.price}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>2 days ago</td>
                    <td>
                      <button 
                        className="btn-primary"
                        onClick={() => handleRestock(product.id)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        <RefreshCw size={14} />
                        Restock Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Inventory Settings</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Low Stock Threshold</label>
              <input
                type="number"
                className="form-input"
                defaultValue="10"
                min="1"
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Alert when stock falls below this number
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Email Notifications</label>
              <select className="form-select">
                <option>Immediate</option>
                <option>Daily Summary</option>
                <option>Weekly Summary</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <input
              type="checkbox"
              defaultChecked
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: 'var(--primary-color)'
              }}
            />
            <label style={{ margin: 0 }}>Send automatic restock requests to suppliers</label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryAlerts;
