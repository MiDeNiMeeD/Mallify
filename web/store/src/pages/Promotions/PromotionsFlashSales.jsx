import React, { useState, useEffect } from 'react';
import { Zap, Plus, Clock, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../Dashboard/Dashboard.css';

function PromotionsFlashSales() {
  const { user } = useAuth();
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSale, setNewSale] = useState({
    name: '',
    discount: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    fetchFlashSales();
  }, [user]);

  const fetchFlashSales = async () => {
    if (!user || !user.boutiqueList || user.boutiqueList.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const boutiqueId = user.boutiqueList[0];
      const response = await apiClient.getPromotions({ boutiqueId });
      
      if (response.success) {
        // Filter for flash sales (short duration promotions)
        const sales = (response.data || []).map(promo => {
          const status = getFlashSaleStatus(promo);
          return {
            ...promo,
            status
          };
        });
        setFlashSales(sales);
      }
    } catch (err) {
      console.error('Error fetching flash sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFlashSaleStatus = (sale) => {
    const now = new Date();
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);
    
    if (now < start) return 'scheduled';
    if (now > end) return 'ended';
    return 'active';
  };

  const handleCreateFlashSale = async (e) => {
    e.preventDefault();
    
    if (!user || !user.boutiqueList || user.boutiqueList.length === 0) {
      alert('No boutique found');
      return;
    }

    try {
      const boutiqueId = user.boutiqueList[0];
      const promotionData = {
        boutiqueId,
        name: newSale.name,
        code: newSale.name.toUpperCase().replace(/\s+/g, ''),
        type: 'percentage',
        value: parseFloat(newSale.discount),
        startDate: newSale.startTime,
        endDate: newSale.endTime,
        isActive: true,
        maxUses: 0
      };

      const response = await apiClient.createPromotion(promotionData);
      
      if (response.success) {
        alert(`Flash sale "${newSale.name}" created successfully!`);
        setNewSale({ name: '', discount: '', startTime: '', endTime: '' });
        fetchFlashSales();
      }
    } catch (err) {
      alert('Failed to create flash sale: ' + err.message);
    }
  };

  const handleDeleteFlashSale = async (id) => {
    if (!window.confirm('Are you sure you want to delete this flash sale?')) return;

    try {
      const response = await apiClient.deletePromotion(id);
      if (response.success) {
        setFlashSales(flashSales.filter(s => s._id !== id));
        alert('Flash sale deleted successfully');
      }
    } catch (err) {
      alert('Failed to delete flash sale: ' + err.message);
    }
  };

  const getTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading flash sales...</p>
        </div>
      </div>
    );
  }

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
          {flashSales.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
              <p>No flash sales yet. Create one below!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {flashSales.map((sale) => {
                const discountDisplay = sale.type === 'percentage' ? `${sale.value}%` : `$${sale.value}`;
                
                return (
                  <div 
                    key={sale._id}
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
                              <span>{getTimeRemaining(sale.endDate)}</span>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                          <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>Discount</p>
                            <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{discountDisplay}</p>
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>Start Time</p>
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>{new Date(sale.startDate).toLocaleString()}</p>
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>End Time</p>
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>{new Date(sale.endDate).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Delete" 
                          style={{ color: 'var(--danger-color)' }}
                          onClick={() => handleDeleteFlashSale(sale._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Quick Create Flash Sale</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreateFlashSale}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Sale Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Weekend Sale"
                  value={newSale.name}
                  onChange={(e) => setNewSale({...newSale, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Discount %</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g., 40"
                  value={newSale.discount}
                  onChange={(e) => setNewSale({...newSale, discount: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date/Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={newSale.startTime}
                  onChange={(e) => setNewSale({...newSale, startTime: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date/Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={newSale.endTime}
                  onChange={(e) => setNewSale({...newSale, endTime: e.target.value})}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              <Plus size={18} />
              Create Quick Sale
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PromotionsFlashSales;
