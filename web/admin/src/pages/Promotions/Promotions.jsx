import React, { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiPlusCircle, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
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

    const confirmed = window.confirm(
      'Archive this plan? Existing subscriptions keep their data, but this plan will no longer be selectable.'
    );
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
            Configure the 3 boutique plans from database and control pricing/features from one place.
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
        <section className="content-card" style={{ marginBottom: '1rem' }}>
          <div className="card-body" style={{ color: '#b91c1c' }}>{error}</div>
        </section>
      )}

      <section className="content-card" style={{ marginBottom: '1rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Existing Plans</h3>
            <p className="card-kicker">Loaded from database</p>
          </div>
        </div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          {loading ? (
            <p>Loading plans...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Monthly</th>
                  <th>Yearly</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderedPlans.map((plan) => (
                  <tr key={plan._id}>
                    <td>{plan.name}</td>
                    <td>{plan.code}</td>
                    <td>{plan.monthlyPrice} {plan.currency}</td>
                    <td>{plan.yearlyPrice} {plan.currency}</td>
                    <td>{plan.isActive ? 'Active' : 'Archived'}</td>
                    <td>
                      <button type="button" className="btn btn-secondary" onClick={() => handleSelectPlan(plan._id)}>
                        <FiEdit2 /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {!orderedPlans.length && (
                  <tr>
                    <td colSpan={6}>No plans found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="plan-editor content-card">
        <div className="card-header">
          <div>
            <p className="card-kicker">Plan Editor</p>
            <h3 className="card-title">{editingPlanId === 'new' ? 'Create Plan' : 'Update Plan'}</h3>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
        <div className="plan-editor__controls">
          <label htmlFor="planSelector">Plan</label>
          <select id="planSelector" value={editingPlanId} onChange={(e) => handleSelectPlan(e.target.value)}>
            <option value="new">+ Create new plan</option>
            {orderedPlans.map((plan) => (
              <option key={`edit-${plan._id}`} value={plan._id}>
                {plan.name}
              </option>
            ))}
          </select>
          {editingPlanId !== 'new' && (
            <button type="button" className="btn btn-secondary" onClick={handleDelete} disabled={saving}>
              <FiTrash2 /> Archive Plan
            </button>
          )}
        </div>
        <div className="plan-editor__grid">
          <div className="plan-editor__field">
            <label htmlFor="planName">Name</label>
            <input id="planName" type="text" value={form.name} onChange={(e) => handleFormChange('name', e.target.value)} />
          </div>
          <div className="plan-editor__field">
            <label htmlFor="planCode">Code</label>
            <input id="planCode" type="text" value={form.code} onChange={(e) => handleFormChange('code', e.target.value)} />
          </div>
          <div className="plan-editor__field">
            <label htmlFor="planMonthly">Monthly Price</label>
            <input id="planMonthly" type="number" min="0" value={form.monthlyPrice} onChange={(e) => handleFormChange('monthlyPrice', e.target.value)} />
          </div>
          <div className="plan-editor__field">
            <label htmlFor="planYearly">Yearly Price</label>
            <input id="planYearly" type="number" min="0" value={form.yearlyPrice} onChange={(e) => handleFormChange('yearlyPrice', e.target.value)} />
          </div>
          <div className="plan-editor__field">
            <label htmlFor="planCurrency">Currency</label>
            <input id="planCurrency" type="text" value={form.currency} onChange={(e) => handleFormChange('currency', e.target.value)} />
          </div>
          <div className="plan-editor__field">
            <label htmlFor="planOrder">Display Order</label>
            <input id="planOrder" type="number" min="1" value={form.displayOrder} onChange={(e) => handleFormChange('displayOrder', e.target.value)} />
          </div>
          <div className="plan-editor__field">
            <label htmlFor="planMaxProducts">Max Products (blank = unlimited)</label>
            <input id="planMaxProducts" type="number" min="0" value={form.maxProducts} onChange={(e) => handleFormChange('maxProducts', e.target.value)} />
          </div>
          <div className="plan-editor__field plan-editor__field--full">
            <label htmlFor="planDescription">Description</label>
            <textarea id="planDescription" rows={3} value={form.description} onChange={(e) => handleFormChange('description', e.target.value)} />
          </div>
          <div className="plan-editor__field plan-editor__field--full">
            <label htmlFor="planFeatures">Features (one per line)</label>
            <textarea id="planFeatures" rows={4} value={form.featuresText} onChange={(e) => handleFormChange('featuresText', e.target.value)} />
          </div>
          <div className="plan-editor__field">
            <label>
              <input type="checkbox" checked={form.prioritySupport} onChange={(e) => handleFormChange('prioritySupport', e.target.checked)} />
              Priority Support
            </label>
          </div>
          <div className="plan-editor__field">
            <label>
              <input type="checkbox" checked={form.advancedAnalytics} onChange={(e) => handleFormChange('advancedAnalytics', e.target.checked)} />
              Advanced Analytics
            </label>
          </div>
          <div className="plan-editor__field">
            <label>
              <input type="checkbox" checked={form.isActive} onChange={(e) => handleFormChange('isActive', e.target.checked)} />
              Active
            </label>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Promotions;
