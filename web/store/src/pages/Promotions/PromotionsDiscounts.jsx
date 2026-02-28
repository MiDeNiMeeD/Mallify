import React, { useState, useEffect } from 'react';
import { Percent, Plus, Copy, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../Dashboard/Dashboard.css';

function PromotionsDiscounts() {
  const { user } = useAuth();
  const [discountCode, setDiscountCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, [user]);

  const fetchCoupons = async () => {
    if (!user || !user.boutiqueList || user.boutiqueList.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const boutiqueId = user.boutiqueList[0];
      const response = await apiClient.getPromotions({ boutiqueId, type: ['percentage', 'fixed_amount'] });
      
      if (response.success) {
        const now = new Date();
        const active = (response.data || []).filter(promo => {
          const end = new Date(promo.endDate);
          return promo.isActive && now <= end;
        });
        setActiveCoupons(active);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!user || !user.boutiqueList || user.boutiqueList.length === 0) {
      alert('No boutique found');
      return;
    }

    try {
      const boutiqueId = user.boutiqueList[0];
      const promotionData = {
        boutiqueId,
        name: `${discountCode} Coupon`,
        code: discountCode,
        type: discountType === 'percentage' ? 'percentage' : 'fixed_amount',
        value: parseFloat(discountValue),
        maxUses: maxUses ? parseInt(maxUses) : 0,
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      };

      const response = await apiClient.createPromotion(promotionData);
      
      if (response.success) {
        alert(`Coupon code "${discountCode}" created successfully!`);
        setDiscountCode('');
        setDiscountValue('');
        setMaxUses('');
        setStartDate('');
        setEndDate('');
        fetchCoupons();
      }
    } catch (err) {
      alert('Failed to create coupon: ' + err.message);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Code "${code}" copied to clipboard!`);
  };

  const formatCouponValue = (coupon) => {
    return coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`;
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Discounts & Coupons</h1>
          <p className="page-subtitle">Create and manage discount codes for your customers</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="content-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} />
              <h2 className="card-title">Create New Coupon</h2>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Coupon Code *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., SAVE20"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  required
                />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Use uppercase letters and numbers only
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">Discount Type *</label>
                <select 
                  className="form-select"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Discount Value *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder={discountType === 'percentage' ? 'e.g., 20' : 'e.g., 50'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Uses</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Leave empty for unlimited"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary">
                <Plus size={18} />
                Create Coupon
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="content-card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Percent size={20} />
                <h2 className="card-title">Active Coupons</h2>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <p>Loading coupons...</p>
              ) : activeCoupons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  <AlertCircle size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <p>No active coupons yet. Create one to get started!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeCoupons.map((coupon) => (
                    <div 
                      key={coupon._id}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--light-bg)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <code style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: 'var(--primary-color)',
                              color: 'white',
                              borderRadius: '4px',
                              fontFamily: 'monospace',
                              fontWeight: 'bold'
                            }}>
                              {coupon.code}
                            </code>
                            <button 
                              className="btn-icon"
                              onClick={() => handleCopyCode(coupon.code)}
                              title="Copy code"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                            {coupon.type === 'percentage' ? 'Percentage' : 'Fixed Amount'} - {formatCouponValue(coupon)}
                          </p>
                        </div>
                        <span className="status-badge completed">active</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <span>Uses: {coupon.usedCount || 0} {coupon.maxUses > 0 ? `/ ${coupon.maxUses}` : ''}</span>
                        {coupon.maxUses > 0 && (
                          <span>{Math.round(((coupon.usedCount || 0) / coupon.maxUses) * 100)}% used</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">Coupon Stats</h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: '6px' }}>
                  <span>Total Active Coupons</span>
                  <strong>{activeCoupons.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: '6px' }}>
                  <span>Total Uses This Month</span>
                  <strong>{activeCoupons.reduce((sum, c) => sum + c.uses, 0)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: '6px' }}>
                  <span>Total Discount Given</span>
                  <strong>$12,450</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromotionsDiscounts;
