import React, { useState } from 'react';
import { Percent, Plus, Copy } from 'lucide-react';
import '../Dashboard/Dashboard.css';

function Discounts() {
  const [discountCode, setDiscountCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');

  const activeCoupons = [
    { code: 'SAVE20', type: 'Percentage', value: '20%', uses: 145, maxUses: 500, status: 'active' },
    { code: 'WINTER50', type: 'Fixed Amount', value: '$50', uses: 78, maxUses: 200, status: 'active' },
    { code: 'NEWMEMBER', type: 'Percentage', value: '15%', uses: 234, maxUses: 0, status: 'active' },
    { code: 'FLASH30', type: 'Percentage', value: '30%', uses: 56, maxUses: 100, status: 'active' },
  ];

  const handleCreate = (e) => {
    e.preventDefault();
    alert(`Coupon code "${discountCode}" created successfully!`);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Code "${code}" copied to clipboard!`);
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
                  <option value="fixed">Fixed Amount</option>
                  <option value="bogo">Buy One Get One</option>
                  <option value="free-shipping">Free Shipping</option>
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
                />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeCoupons.map((coupon, idx) => (
                  <div 
                    key={idx}
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
                          {coupon.type} - {coupon.value}
                        </p>
                      </div>
                      <span className="status-badge completed">{coupon.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span>Uses: {coupon.uses} {coupon.maxUses > 0 ? `/ ${coupon.maxUses}` : ''}</span>
                      {coupon.maxUses > 0 && (
                        <span>{Math.round((coupon.uses / coupon.maxUses) * 100)}% used</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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

export default Discounts;
