import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiCheckCircle, FiRefreshCw, FiStar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import Toast from '../../components/Toast';
import './SubscriptionPlans.css';

const SubscriptionPlans = () => {
  const { user, subscriptionAccess, refreshSubscriptionAccess } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [interval, setInterval] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const refreshSubscriptionAccessRef = useRef(refreshSubscriptionAccess);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ show: true, message, type });
  }, []);

  const boutiqueId = user?.boutiqueList?.[0] || null;

  useEffect(() => {
    refreshSubscriptionAccessRef.current = refreshSubscriptionAccess;
  }, [refreshSubscriptionAccess]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setToast((prev) => ({ ...prev, show: false }));
      const response = await apiClient.getSubscriptionPlans();
      const fetchedPlans = response?.data?.plans || [];
      setPlans(fetchedPlans);
      if (fetchedPlans.length) {
        const sortedPlans = [...fetchedPlans].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
        const defaultPlanId = sortedPlans[1]?._id || sortedPlans[0]._id;
        setSelectedPlanId((prev) => prev || defaultPlanId);
      }
      if (typeof refreshSubscriptionAccessRef.current === 'function') {
        await refreshSubscriptionAccessRef.current();
      }
    } catch (loadError) {
      showToast(loadError.message || 'Failed to load subscription plans.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');

    if (!checkoutStatus) {
      return;
    }

    if (checkoutStatus === 'success') {
      showToast('Payment completed. We are confirming your subscription now.', 'success');
      refreshSubscriptionAccess();
    } else if (checkoutStatus === 'cancel') {
      showToast('Checkout canceled. No charge was made.', 'info');
    }

    params.delete('checkout');
    params.delete('session_id');
    params.delete('boutiqueId');

    const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, document.title, next);
  }, [refreshSubscriptionAccess, showToast]);

  const orderedPlans = useMemo(
    () => [...plans].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
    [plans]
  );

  const formatLongDate = (value) => {
    if (!value) {
      return 'Not active';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Not active';
    }

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDaysLeft = (value) => {
    if (!value) {
      return null;
    }

    const endDate = new Date(value);
    if (Number.isNaN(endDate.getTime())) {
      return null;
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / msPerDay));
    return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
  };

  // Identify the user's current active plan
  const activeSub = subscriptionAccess?.hasManagementAccess ? subscriptionAccess?.subscription : null;
  const currentPlanId = activeSub?.planId ? String(activeSub.planId) : null;
  const currentPlan = currentPlanId ? orderedPlans.find((p) => String(p._id) === currentPlanId) : null;
  const currentDisplayOrder = currentPlan ? Number(currentPlan.displayOrder || 0) : -1;

  // Proration credit for display: unused value remaining in the current period
  const prorationCredit = useMemo(() => {
    if (!activeSub?.currentPeriodStart || !activeSub?.currentPeriodEnd) return null;
    const now = Date.now();
    const start = new Date(activeSub.currentPeriodStart).getTime();
    const end = new Date(activeSub.currentPeriodEnd).getTime();
    const totalMs = end - start;
    const remainingMs = Math.max(0, end - now);
    if (totalMs <= 0 || remainingMs <= 0) return null;
    const credit = ((remainingMs / totalMs) * (activeSub.amount || 0));
    const daysLeft = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    return { credit: credit.toFixed(2), daysLeft };
  }, [activeSub]);

  const handleSubscribe = async (planId = selectedPlanId) => {
    if (!boutiqueId || !planId) {
      showToast('Boutique profile is missing. Please contact support.', 'error');
      return;
    }

    try {
      setProcessing(true);
      setToast((prev) => ({ ...prev, show: false }));

      const checkout = await apiClient.createSubscriptionCheckoutSession(boutiqueId, {
        planId,
        billingInterval: interval,
      });

      const checkoutUrl = checkout?.data?.checkoutUrl;
      if (!checkoutUrl) {
        showToast('Stripe checkout URL was not returned. Please try again.', 'error');
        return;
      }

      window.location.href = checkoutUrl;
    } catch (subscribeError) {
      showToast(subscribeError.message || 'Subscription activation failed.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpgrade = async (planId) => {
    if (!boutiqueId || !planId) {
      showToast('Boutique profile is missing. Please contact support.', 'error');
      return;
    }

    try {
      setProcessing(true);
      setToast((prev) => ({ ...prev, show: false }));
      await apiClient.upgradeBoutiqueSubscription(boutiqueId, planId);
      showToast('Plan upgraded successfully! Your remaining days have been credited.', 'success');
      await loadData();
    } catch (upgradeError) {
      showToast(upgradeError.message || 'Upgrade failed. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="dashboard-page subscription-page">
      <div className="subscription-header">
        <div>
          <h1>Choose Your Subscription Plan</h1>
          <p className="page-subtitle">Your boutique management tools are unlocked only with an active subscription.</p>
        </div>
        <button type="button" className="subscription-btn-secondary" onClick={loadData} disabled={loading || processing}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="subscription-status-grid">
        <div className="stat-card">
          <div className="stat-label">Management Access</div>
          <div className={`stat-value ${subscriptionAccess?.hasManagementAccess ? 'ok' : 'blocked'}`}>
            {subscriptionAccess?.hasManagementAccess ? 'Active' : 'Blocked'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Period End</div>
          <div className="stat-value-subtle">
            {formatLongDate(subscriptionAccess?.subscription?.currentPeriodEnd)}
          </div>
          {formatDaysLeft(subscriptionAccess?.subscription?.currentPeriodEnd) && (
            <div className="stat-label" style={{ marginTop: '0.35rem' }}>
              {formatDaysLeft(subscriptionAccess?.subscription?.currentPeriodEnd)}
            </div>
          )}
        </div>
      </div>

      <div className="content-card subscription-card-shell">
        <div className="card-header subscription-controls">
          <div>
            <h2 className="card-title">Available Plans</h2>
            <p className="subscription-helper">Select monthly or yearly billing, then choose your plan.</p>
          </div>
          <div className="subscription-billing-toggle" role="group" aria-label="Billing interval">
            <label className={interval === 'monthly' ? 'active' : ''}>
              <input
                type="radio"
                name="billing"
                value="monthly"
                checked={interval === 'monthly'}
                onChange={(e) => setInterval(e.target.value)}
              />
              Monthly
            </label>
            <label className={interval === 'yearly' ? 'active' : ''}>
              <input
                type="radio"
                name="billing"
                value="yearly"
                checked={interval === 'yearly'}
                onChange={(e) => setInterval(e.target.value)}
              />
              Yearly
            </label>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="subscription-loading">Loading plans...</div>
          ) : (
            <div className="subscription-grid">
              {orderedPlans.map((plan, index) => {
                const price = interval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
                const selected = selectedPlanId === plan._id;
                const isFeaturedPlan = index === 1;
                const toneClass = isFeaturedPlan ? 'tone-featured' : index === 0 ? 'tone-dark' : 'tone-light';
                const positionClass = index === 1 ? 'plan-center' : index === 0 ? 'plan-left' : 'plan-right';

                const planOrder = Number(plan.displayOrder || 0);
                const isCurrentPlan = currentPlanId && String(plan._id) === currentPlanId;
                const isUpgradeable = currentPlanId && planOrder > currentDisplayOrder;
                const isLowerTier = currentPlanId && planOrder < currentDisplayOrder;

                return (
                  <article
                    key={plan._id}
                    className={`subscription-card ${toneClass} ${positionClass} ${selected ? 'is-selected' : ''} ${isCurrentPlan ? 'is-current' : ''}`}
                  >
                    {isCurrentPlan ? (
                      <div className="subscription-card__badge subscription-card__badge--current" aria-label="Current plan">
                        Current Plan
                      </div>
                    ) : isFeaturedPlan && !currentPlanId ? (
                      <div className="subscription-card__badge" aria-label="Recommended plan">
                        <FiStar />
                      </div>
                    ) : null}

                    <h3>{plan.name}</h3>
                    <p className="subscription-card__description">{plan.description}</p>
                    {isUpgradeable && prorationCredit ? (
                      <div className="subscription-card__price-block">
                        <span className="subscription-card__price subscription-card__price--strikethrough">{price} DT</span>
                        <span className="subscription-card__price subscription-card__price--net">
                          {Math.max(0, price - parseFloat(prorationCredit.credit)).toFixed(2)} DT
                        </span>
                        <div className="subscription-card__proration">
                          ~{prorationCredit.credit} DT credit · {prorationCredit.daysLeft} day{prorationCredit.daysLeft === 1 ? '' : 's'} remaining
                        </div>
                      </div>
                    ) : (
                      <div className="subscription-card__price">{price} DT</div>
                    )}
                    <div className="subscription-card__period">per user / {interval}</div>

                    {!isCurrentPlan && !isLowerTier && (
                      <button
                        type="button"
                        className="subscription-card__cta"
                        onClick={() => {
                          setSelectedPlanId(plan._id);
                          if (isUpgradeable) {
                            handleUpgrade(plan._id);
                          } else {
                            handleSubscribe(plan._id);
                          }
                        }}
                        disabled={processing || !boutiqueId}
                      >
                        {processing && selected
                          ? 'Processing...'
                          : isUpgradeable
                          ? 'Upgrade'
                          : 'Get started'}
                      </button>
                    )}

                    {isCurrentPlan && (
                      <button type="button" className="subscription-card__cta subscription-card__cta--disabled" disabled>
                        Current Plan
                      </button>
                    )}

                    <ul>
                      {(plan.features || []).map((feature) => (
                        <li key={`${plan._id}-${feature}`}>
                          <FiCheckCircle /> {feature}
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
