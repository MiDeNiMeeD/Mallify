import React, { useState } from 'react';
import { Zap, Plus, Clock, Edit2, Trash2 } from 'lucide-react';
import '../Dashboard/Dashboard.css';

function FlashSales() {
  const flashSales = [
    { id: 1, name: 'Weekend Flash Sale', discount: '40%', startTime: '2026-02-15 09:00', endTime: '2026-02-16 23:59', products: 15, status: 'scheduled' },
    { id: 2, name: 'Valentine\'s Day Special', discount: '35%', startTime: '2026-02-14 00:00', endTime: '2026-02-14 23:59', products: 20, status: 'active' },
    { id: 3, name: 'Limited Time Offer', discount: '50%', startTime: '2026-02-10 12:00', endTime: '2026-02-12 12:00', products: 8, status: 'ended' },
  ];

  const getTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Flash Sales</h1>
          <p className="page-subtitle">Create time-limited promotional sales events</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          Create Flash Sale
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active Sales</span>
            <div className="stat-icon success"><Zap size={20} /></div>
          </div>
          <div className="stat-value">{flashSales.filter(s => s.status === 'active').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Scheduled</span>
            <div className="stat-icon info"><Clock size={20} /></div>
          </div>
          <div className="stat-value">{flashSales.filter(s => s.status === 'scheduled').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Products</span>
            <div className="stat-icon pink"><Zap size={20} /></div>
          </div>
          <div className="stat-value">{flashSales.reduce((sum, s) => sum + s.products, 0)}</div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} />
            <h2 className="card-title">All Flash Sales</h2>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {flashSales.map((sale) => (
              <div 
                key={sale.id}
                style={{
                  padding: '1.5rem',
                  backgroundColor: sale.status === 'active' ? 'var(--success-light)' : 'var(--light-bg)',
                  borderRadius: '8px',
                  border: `2px solid ${sale.status === 'active' ? 'var(--success-color)' : 'var(--border-color)'}`,
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{sale.name}</h3>
                      <span className={`status-badge ${sale.status === 'active' ? 'completed' : sale.status === 'scheduled' ? 'pending' : 'cancelled'}`}>
                        {sale.status}
                      </span>
                      {sale.status === 'active' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger-color)', fontSize: '0.875rem' }}>
                          <Clock size={16} />
                          <span>{getTimeRemaining(sale.endTime)}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                      <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>Discount</p>
                        <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{sale.discount}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>Start Time</p>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>{new Date(sale.startTime).toLocaleString()}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>End Time</p>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>{new Date(sale.endTime).toLocaleString()}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>Products</p>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>{sale.products} items</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-icon" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon" title="Delete" style={{ color: 'var(--danger-color)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Quick Create Flash Sale</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Sale Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Weekend Sale"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Discount %</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g., 40"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Date/Time</label>
              <input
                type="datetime-local"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date/Time</label>
              <input
                type="datetime-local"
                className="form-input"
              />
            </div>
          </div>
          <button className="btn-primary">
            <Plus size={18} />
            Create Quick Sale
          </button>
        </div>
      </div>
    </div>
  );
}

export default FlashSales;
