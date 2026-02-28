import React, { useState } from 'react';
import { Truck, Save, Plus } from 'lucide-react';
import { deliveryOptions } from '../../data/mockData';
import '../Dashboard/Dashboard.css';

function BoutiqueDelivery() {
  const [options, setOptions] = useState(deliveryOptions);

  const handleToggle = (id) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
    ));
  };

  const handleOptionChange = (id, field, value) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, [field]: value } : opt
    ));
  };

  const handleSave = () => {
    alert('Delivery options updated successfully!');
  };

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
          <h1 className="page-title">Delivery Options</h1>
          <p className="page-subtitle">Configure shipping methods and delivery rates</p>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          <Save size={18} />
          Save Settings
        </button>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={20} />
            <h2 className="card-title">Shipping Methods</h2>
          </div>
          <button className="btn-secondary">
            <Plus size={18} />
            Add Method
          </button>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {options.map((option) => (
              <div 
                key={option.id}
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--light-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={option.enabled}
                        onChange={() => handleToggle(option.id)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: 'var(--primary-color)'
                        }}
                      />
                      <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{option.name}</h3>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: '0 0 0 1.875rem', fontSize: '0.875rem' }}>
                      {option.description}
                    </p>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '1rem',
                  marginLeft: '1.875rem'
                }}>
                  <div className="form-group">
                    <label className="form-label">Cost</label>
                    <input
                      type="number"
                      className="form-input"
                      value={option.cost}
                      onChange={(e) => handleOptionChange(option.id, 'cost', parseFloat(e.target.value))}
                      disabled={!option.enabled}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Days</label>
                    <input
                      type="text"
                      className="form-input"
                      value={option.estimatedDays}
                      onChange={(e) => handleOptionChange(option.id, 'estimatedDays', e.target.value)}
                      disabled={!option.enabled}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{
                      padding: '0.625rem 1rem',
                      backgroundColor: option.enabled ? 'var(--success-light)' : 'var(--border-color)',
                      color: option.enabled ? 'var(--success-color)' : 'var(--text-secondary)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {option.enabled ? 'Active' : 'Disabled'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Free Shipping</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Minimum Order Amount</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g., 50.00"
                step="0.01"
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Orders above this amount qualify for free shipping
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--primary-color)'
                }}
              />
              <label style={{ margin: 0 }}>Enable free shipping promotions</label>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Delivery Zones</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Service Areas</label>
              <textarea
                className="form-textarea"
                placeholder="e.g., New York, New Jersey, Connecticut"
                rows="3"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              <label style={{ margin: 0 }}>Allow nationwide shipping</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoutiqueDelivery;
