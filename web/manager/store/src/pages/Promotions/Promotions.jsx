import React, { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiPlusCircle, FiRefreshCw, FiTrash2, FiDollarSign, FiPackage, FiCheckCircle, FiXCircle, FiArchive, FiSave, FiList, FiSettings } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';
import './Promotions.css';

const emptyForm = {
  name: '',
  code: '',
  description: '',
  monthlyPrice: 0,
  yearlyPrice: 0,
  currency: 'USD',
  displayOrder: 1,
  isActive: true,
  maxProducts: '',
  prioritySupport: false,
  advancedAnalytics: false,
  featuresText: '',
};

const normalizeForm = (form) => ({
  name: form.name.trim(),
  code: form.code.trim().toLowerCase(),
  description: form.description.trim(),
  monthlyPrice: Number(form.monthlyPrice) || 0,
  yearlyPrice: Number(form.yearlyPrice) || 0,
  currency: (form.currency || 'USD').trim().toUpperCase(),
  displayOrder: Number(form.displayOrder) || 1,
  isActive: Boolean(form.isActive),
  features: form.featuresText
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean),
  limits: {
    maxProducts: form.maxProducts === '' ? null : Number(form.maxProducts),
    prioritySupport: Boolean(form.prioritySupport),
    advancedAnalytics: Boolean(form.advancedAnalytics),
  },
});

const toForm = (plan) => ({
  name: plan.name || '',
  code: plan.code || '',
  description: plan.description || '',
  monthlyPrice: plan.monthlyPrice ?? 0,
  yearlyPrice: plan.yearlyPrice ?? 0,
  currency: plan.currency || 'USD',
  displayOrder: plan.displayOrder ?? 1,
  isActive: Boolean(plan.isActive),
  maxProducts: plan?.limits?.maxProducts ?? '',
  prioritySupport: Boolean(plan?.limits?.prioritySupport),
  advancedAnalytics: Boolean(plan?.limits?.advancedAnalytics),
  featuresText: (plan.features || []).join('\n'),
});

const Promotions = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingPlanId, setEditingPlanId] = useState('new');
  const [form, setForm] = useState(emptyForm);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.getSubscriptionPlans();
      const loaded = response?.data?.plans || [];
      setPlans(loaded);
      if (editingPlanId !== 'new') {
        const selected = loaded.find((item) => item._id === editingPlanId);
        if (!selected) {
          setEditingPlanId('new');
          setForm(emptyForm);
        }
      }
    } catch (loadError) {
      setError(loadError.message || 'Failed to load plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const orderedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      const first = Number(a.displayOrder || 0);
      const second = Number(b.displayOrder || 0);
      return first - second;
    });
  }, [plans]);

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectPlan = (planId) => {
    if (planId === 'new') {
      setEditingPlanId('new');
      setForm(emptyForm);
      return;
    }

    const selected = plans.find((item) => item._id === planId);
    if (!selected) {
      return;
    }

    setEditingPlanId(planId);
    setForm(toForm(selected));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const payload = normalizeForm(form);

      if (editingPlanId === 'new') {
        await apiClient.createSubscriptionPlan(payload);
      } else {
        await apiClient.updateSubscriptionPlan(editingPlanId, payload);
      }

      await loadPlans();
      if (editingPlanId === 'new') {
        setForm(emptyForm);
      }
    } catch (saveError) {
      setError(saveError.message || 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (editingPlanId === 'new') {
      return;
    }

    const confirmed = window.confirm('Archive this plan? Existing subscriptions keep their data, but this plan will no longer be selectable.');
    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      await apiClient.deleteSubscriptionPlan(editingPlanId);
      setEditingPlanId('new');
      setForm(emptyForm);
      await loadPlans();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to archive plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="promotions subscription-plans">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscription Plans Management</h1>
          <p className="page-subtitle">
            Configure the boutique plans from database and control pricing/features from one place.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary" onClick={loadPlans} disabled={loading || saving}>
            <FiRefreshCw /> Refresh
          </button>
          <button type="button" className="btn btn-primary" onClick={() => handleSelectPlan('new')} disabled={saving}>
            <FiPlusCircle /> New Plan
          </button>
        </div>
      </div>

      {error && (
        <section className="content-card" style={{ marginBottom: '1rem', border: '2px solid #FEE2E2', background: '#FFF5F5' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#991B1B' }}>
            <FiXCircle size={20} />
            <span>{error}</span>
          </div>
        </section>
      )}

      {/* Existing Plans Table */}
      <section className="content-card" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
        <div className="card-header" style={{ paddingBottom: '1.25rem', borderBottom: '2px solid #F3F4F6', marginBottom: 0 }}>
          <div>
            <p className="card-kicker" style={{ color: '#7C3AED' }}>Database Records</p>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiList color="#7C3AED" /> Existing Plans
            </h3>
          </div>
          <span className="report-count" style={{ fontSize: '0.85rem', color: '#6B7280', background: '#F9FAFB', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
            {orderedPlans.length} plan{orderedPlans.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <p>Loading plans...</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Code</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Yearly</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'center', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderedPlans.map((plan, i) => (
                  <tr key={plan._id} style={{ 
                    borderBottom: i < orderedPlans.length - 1 ? '1px solid #F3F4F6' : 'none',
                    transition: 'background 0.2s ease',
                    cursor: 'pointer'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{plan.name}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: '#6B7280', fontSize: '0.85rem', fontFamily: 'monospace' }}>{plan.code}</td>
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: '#059669', fontSize: '0.9rem' }}>${plan.monthlyPrice} <span style={{ fontWeight: 400, color: '#9CA3AF', fontSize: '0.75rem' }}>{plan.currency}</span></td>
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: '#2563EB', fontSize: '0.9rem' }}>${plan.yearlyPrice} <span style={{ fontWeight: 400, color: '#9CA3AF', fontSize: '0.75rem' }}>{plan.currency}</span></td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span style={{ 
                        padding: '0.35rem 0.85rem', 
                        borderRadius: '8px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        background: plan.isActive ? '#D1FAE5' : '#FEF3C7',
                        color: plan.isActive ? '#065F46' : '#92400E',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        {plan.isActive ? <FiCheckCircle size={12} /> : <FiArchive size={12} />}
                        {plan.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => handleSelectPlan(plan._id)}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', borderRadius: '8px', background: '#F3F4F6', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: '#374151' }}>
                        <FiEdit2 size={12} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {!orderedPlans.length && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                      <FiPackage size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                      <p>No plans found. Create your first plan to get started.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Plan Editor */}
      <section className="plan-editor content-card" style={{ borderTop: '4px solid #7C3AED' }}>
        <div className="card-header" style={{ paddingBottom: '1.25rem', borderBottom: '2px solid #F3F4F6', marginBottom: '1.5rem' }}>
          <div>
            <p className="card-kicker" style={{ color: '#7C3AED' }}>Plan Editor</p>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiSettings color="#7C3AED" /> {editingPlanId === 'new' ? 'Create New Plan' : 'Update Plan'}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {editingPlanId !== 'new' && (
              <button type="button" className="btn btn-secondary" onClick={handleDelete} disabled={saving}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '10px', background: '#FEE2E2', border: '1px solid #FECACA', color: '#991B1B', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <FiTrash2 size={14} /> Archive
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', borderRadius: '10px', background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: 'white', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
              {saving ? <><FiRefreshCw className="spinning" size={14} /> Saving...</> : <><FiSave size={14} /> Save Plan</>}
            </button>
          </div>
        </div>

        <div className="plan-editor__controls" style={{ marginBottom: '1.75rem' }}>
          <label htmlFor="planSelector" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Select Plan</label>
          <select id="planSelector" value={editingPlanId} onChange={(e) => handleSelectPlan(e.target.value)}
            style={{ borderRadius: '10px', border: '2px solid #E5E7EB', padding: '0.6rem 1rem', fontSize: '0.875rem', background: '#F9FAFB', color: '#111827', outline: 'none', cursor: 'pointer', flex: 1, maxWidth: '300px' }}>
            <option value="new">+ Create new plan</option>
            {orderedPlans.map((plan) => (
              <option key={`edit-${plan._id}`} value={plan._id}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>

        <div className="plan-editor__grid">
          <div className="plan-editor__field">
            <label htmlFor="planName">Plan Name</label>
            <input id="planName" type="text" value={form.name} onChange={(e) => handleFormChange('name', e.target.value)} 
              placeholder="e.g. Premium Plan" />
          </div>
          <div className="plan-editor__field">
            <label htmlFor="planCode">Code</label>
            <input id="planCode" type="text" value={form.code} onChange={(e) => handleFormChange('code', e.target.value)} 
              placeholder="e.g. premium" />
          </div>
          <div className="plan-editor__field">
            <label htmlFor="planMonthly">Monthly Price ($)</label>
            <input id="planMonthly" type="number" min="0" step="0.01" value={form.monthlyPrice} onChange={(e) => handleFormChange('monthlyPrice', e.target.value)} 
              placeholder="0.00" />
          </div>
          <div className="plan-editor__field">
            <label htmlFor="planYearly">Yearly Price ($)</label>
            <input id="planYearly" type="number" min="0" step="0.01" value={form.yearlyPrice} onChange={(e) => handleFormChange('yearlyPrice', e.target.value)} 
              placeholder="0.00" />
          </div>
          <div className="plan-editor__field">
            <label htmlFor="planCurrency">Currency</label>
            <input id="planCurrency" type="text" value={form.currency} onChange={(e) => handleFormChange('currency', e.target.value)} 
              placeholder="USD" />
          </div>
          <div className="plan-editor__field">
            <label htmlFor="planOrder">Display Order</label>
            <input id="planOrder" type="number" min="1" value={form.displayOrder} onChange={(e) => handleFormChange('displayOrder', e.target.value)} />
          </div>
          <div className="plan-editor__field">
            <label htmlFor="planMaxProducts">Max Products</label>
            <input id="planMaxProducts" type="number" min="0" value={form.maxProducts} onChange={(e) => handleFormChange('maxProducts', e.target.value)} 
              placeholder="Blank = unlimited" />
          </div>
          <div className="plan-editor__field">
            <label>Status</label>
            <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: '#F9FAFB', borderRadius: '10px', border: '2px solid #E5E7EB' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => handleFormChange('isActive', e.target.checked)} 
                  style={{ width: '16px', height: '16px', accentColor: '#7C3AED' }} />
                Active
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                <input type="checkbox" checked={form.prioritySupport} onChange={(e) => handleFormChange('prioritySupport', e.target.checked)} 
                  style={{ width: '16px', height: '16px', accentColor: '#7C3AED' }} />
                Priority Support
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                <input type="checkbox" checked={form.advancedAnalytics} onChange={(e) => handleFormChange('advancedAnalytics', e.target.checked)} 
                  style={{ width: '16px', height: '16px', accentColor: '#7C3AED' }} />
                Advanced Analytics
              </label>
            </div>
          </div>
          <div className="plan-editor__field plan-editor__field--full">
            <label htmlFor="planDescription">Description</label>
            <textarea id="planDescription" rows={3} value={form.description} onChange={(e) => handleFormChange('description', e.target.value)} 
              placeholder="Describe what this plan offers..." style={{ minHeight: '80px' }} />
          </div>
          <div className="plan-editor__field plan-editor__field--full">
            <label htmlFor="planFeatures">Features (one per line)</label>
            <textarea id="planFeatures" rows={4} value={form.featuresText} onChange={(e) => handleFormChange('featuresText', e.target.value)} 
              placeholder={`Up to 500 products&#10;Priority support&#10;Advanced analytics`} style={{ minHeight: '120px' }} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Promotions;