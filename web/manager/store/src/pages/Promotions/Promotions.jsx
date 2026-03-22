import React, { useMemo, useState } from 'react';
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiGift,
  FiLayers,
  FiSettings,
  FiShield,
  FiTrendingUp,
  FiZap
} from 'react-icons/fi';
import '../../styles/Dashboard.css';
import './Promotions.css';

const initialPlanTiers = [
  {
    id: 'launch',
    name: 'Launch Pass',
    badge: 'Starter',
    price: 39,
    cadence: 'per month',
    tagline: 'Everything a new boutique needs to ship its first orders.',
    bestFor: 'Solo founders and first boutiques',
    limits: ['Up to 80 products', 'Unlimited orders', 'Standard support'],
    features: [
      'Set up branded boutique vitrine and working hours',
      'Manage products, inventory alerts, and low-stock warnings',
      'Receive notifications for new orders and customer chats',
      'Schedule basic promotions and discounts'
    ]
  },
  {
    id: 'growth',
    name: 'Growth Studio',
    badge: 'Most popular',
    price: 79,
    cadence: 'per month',
    tagline: 'Automation and AI guidance for scaling boutiques.',
    bestFor: 'Growing multi-channel teams',
    limits: ['Up to 300 products', 'Priority routing on orders', 'Same-day support'],
    highlighted: true,
    features: [
      'AI-driven inventory forecasting and auto re-order signals',
      'Dynamic pricing suggestions and segmented promotions',
      'Advanced analytics with retention and revenue breakdowns',
      'Customer review management and loyalty nudges'
    ]
  },
  {
    id: 'elite',
    name: 'Elite Commerce',
    badge: 'Enterprise',
    price: 149,
    cadence: 'per month',
    tagline: 'Full-service control room for multi-boutique groups.',
    bestFor: 'Boutiques with regional teams',
    limits: ['Unlimited products', 'Dedicated success partner', '24/7 support'],
    features: [
      'Custom promotions, flash sales, and bundled campaigns',
      'Team permissions, workflow automation, and SLA tracking',
      'AI-powered customer segmentation for hyper-targeted outreach',
      'White-glove onboarding plus quarterly strategy reviews'
    ]
  }
];

const createInitialPlans = () =>
  initialPlanTiers.map((plan) => ({
    ...plan,
    limits: [...plan.limits],
    features: [...plan.features]
  }));

const featureMatrix = [
  { label: 'Boutique vitrine & branding', launch: true, growth: true, elite: true },
  { label: 'Inventory alerts & stock analytics', launch: true, growth: true, elite: true },
  { label: 'AI inventory forecasting', launch: false, growth: true, elite: true },
  { label: 'Dynamic pricing and coupons', launch: true, growth: true, elite: true },
  { label: 'Advanced sales & retention analytics', launch: false, growth: true, elite: true },
  { label: 'Customer review management', launch: true, growth: true, elite: true },
  { label: 'Dedicated success partner', launch: false, growth: false, elite: true },
  { label: 'Automation & workflow rules', launch: false, growth: true, elite: true }
];

const onboardingFlow = [
  {
    title: 'Subscribe to a plan',
    detail: 'Pick the abonnement level that matches your boutique roadmap.',
    icon: FiCheckCircle
  },
  {
    title: 'Configure your vitrine',
    detail: 'Upload branding, set working hours, delivery zones, and policies.',
    icon: FiSettings
  },
  {
    title: 'Connect inventory + catalog',
    detail: 'Import products, enable stock alerts, and draft launch promotions.',
    icon: FiLayers
  },
  {
    title: 'Go live & monitor',
    detail: 'Track orders, respond to customers, and optimize with AI signals.',
    icon: FiTrendingUp
  }
];

const valueHighlights = [
  {
    title: 'Set up & manage boutiques',
    description: 'Handle vitrine design, branding assets, and working hours from one workspace.',
    icon: FiZap
  },
  {
    title: 'Run promotions and coupons',
    description: 'Plan flash sales, loyalty incentives, and targeted discount codes.',
    icon: FiGift
  },
  {
    title: 'Stay in control of orders',
    description: 'View, approve, and prepare orders while syncing with delivery teams.',
    icon: FiClock
  },
  {
    title: 'Protect operations',
    description: 'Manage returns, refunds, and compliance with audit-ready logs.',
    icon: FiShield
  }
];

const Promotions = () => {
  const [plans, setPlans] = useState(createInitialPlans);
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanTiers[1]?.id ?? initialPlanTiers[0].id);
  const [editingPlanId, setEditingPlanId] = useState(initialPlanTiers[0].id);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0],
    [plans, selectedPlanId]
  );

  const editingPlan = useMemo(
    () => plans.find((plan) => plan.id === editingPlanId) ?? plans[0],
    [plans, editingPlanId]
  );

  const featureColumns = useMemo(
    () => {
      const focusedId = selectedPlan ? selectedPlan.id : '';
      return {
        launch: focusedId === 'launch',
        growth: focusedId === 'growth',
        elite: focusedId === 'elite'
      };
    },
    [selectedPlan]
  );

  const handlePlanFieldChange = (field, value) => {
    setPlans((prev) => prev.map((plan) => (plan.id === editingPlanId ? { ...plan, [field]: value } : plan)));
  };

  const handleListFieldChange = (field, rawValue) => {
    const list = rawValue
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
    handlePlanFieldChange(field, list);
  };

  const handleResetPlans = () => {
    setPlans(createInitialPlans());
  };

  return (
    <div className="promotions subscription-plans">
      <div className="page-header">
        <div>
          <h1 className="page-title">Boutique Abonnement Plans</h1>
          <p className="page-subtitle">
            Pick the plan that keeps your boutique launching, scaling, and delivering premium service.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary">
            Download brochure
          </button>
          <button type="button" className="btn btn-primary">
            Talk to success team
          </button>
        </div>
      </div>

      <section className="plan-hero">
        <div>
          <p className="kicker">Mallify commerce suite</p>
          <h2>Create, launch, and scale your boutique abonnement</h2>
          <p>
            Every plan covers the essentials: boutique branding, catalog management, order orchestration, promotions, and
            direct communication with customers. Upgrade to unlock AI-assisted forecasting, targeted campaigns, and
            dedicated success guidance.
          </p>
        </div>
        <div className="hero-summary">
          <div>
            <strong>72%</strong>
            <span>of boutique owners upgrade within two quarters.</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>support available on Elite Commerce.</span>
          </div>
        </div>
      </section>

      <section className="plan-grid">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`plan-card ${plan.highlighted ? 'plan-card--highlighted' : ''}`}
            onMouseEnter={() => setSelectedPlanId(plan.id)}
          >
            <div className="plan-card__header">
              <span className="plan-badge">{plan.badge}</span>
              <h3>{plan.name}</h3>
              <p>{plan.tagline}</p>
            </div>
            <div className="plan-card__price">
              <strong>${plan.price}</strong>
              <span>{plan.cadence}</span>
            </div>
            <ul className="plan-card__limits">
              {plan.limits.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
            <ul className="plan-card__features">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <FiCheckCircle />
                  {feature}
                </li>
              ))}
            </ul>
            <button type="button" className="plan-card__cta">
              Subscribe <FiArrowRight />
            </button>
            <span className="plan-card__footnote">{plan.bestFor}</span>
          </article>
        ))}
      </section>

      <section className="plan-editor content-card">
        <div className="card-header">
          <div>
            <p className="card-kicker">Plan settings</p>
            <h3 className="card-title">Edit abonnement details</h3>
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleResetPlans}>
            Reset to defaults
          </button>
        </div>
        <div className="plan-editor__controls">
          <label htmlFor="planSelector">Plan to edit</label>
          <select id="planSelector" value={editingPlanId} onChange={(e) => setEditingPlanId(e.target.value)}>
            {plans.map((plan) => (
              <option key={`edit-${plan.id}`} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
          <span className="plan-editor__hint">Changes sync instantly to the cards above.</span>
        </div>
        {editingPlan && (
          <div className="plan-editor__grid">
            <div className="plan-editor__field">
              <label htmlFor="planName">Display name</label>
              <input
                id="planName"
                type="text"
                value={editingPlan?.name ?? ''}
                onChange={(e) => handlePlanFieldChange('name', e.target.value)}
              />
            </div>
            <div className="plan-editor__field">
              <label htmlFor="planBadge">Badge</label>
              <input
                id="planBadge"
                type="text"
                value={editingPlan?.badge ?? ''}
                onChange={(e) => handlePlanFieldChange('badge', e.target.value)}
              />
            </div>
            <div className="plan-editor__field">
              <label htmlFor="planPrice">Price (USD)</label>
              <input
                id="planPrice"
                type="number"
                min="0"
                value={editingPlan?.price ?? 0}
                onChange={(e) => handlePlanFieldChange('price', Number(e.target.value) || 0)}
              />
            </div>
            <div className="plan-editor__field">
              <label htmlFor="planCadence">Cadence</label>
              <input
                id="planCadence"
                type="text"
                value={editingPlan?.cadence ?? ''}
                onChange={(e) => handlePlanFieldChange('cadence', e.target.value)}
              />
            </div>
            <div className="plan-editor__field plan-editor__field--full">
              <label htmlFor="planTagline">Tagline</label>
              <input
                id="planTagline"
                type="text"
                value={editingPlan?.tagline ?? ''}
                onChange={(e) => handlePlanFieldChange('tagline', e.target.value)}
              />
            </div>
            <div className="plan-editor__field plan-editor__field--full">
              <label htmlFor="planBestFor">Best for</label>
              <input
                id="planBestFor"
                type="text"
                value={editingPlan?.bestFor ?? ''}
                onChange={(e) => handlePlanFieldChange('bestFor', e.target.value)}
              />
            </div>
            <div className="plan-editor__field plan-editor__field--full">
              <label htmlFor="planLimits">Limits (one per line)</label>
              <textarea
                id="planLimits"
                rows={3}
                value={(editingPlan?.limits ?? []).join('\n')}
                onChange={(e) => handleListFieldChange('limits', e.target.value)}
              />
            </div>
            <div className="plan-editor__field plan-editor__field--full">
              <label htmlFor="planFeatures">Key features (one per line)</label>
              <textarea
                id="planFeatures"
                rows={4}
                value={(editingPlan?.features ?? []).join('\n')}
                onChange={(e) => handleListFieldChange('features', e.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      <section className="value-grid">
        {valueHighlights.map((item) => (
          <article key={item.title} className="value-card">
            <div className="value-icon">
              <item.icon />
            </div>
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="feature-matrix content-card">
        <div className="card-header">
          <div>
            <p className="card-kicker">Plan comparison</p>
            <h3 className="card-title">Capabilities per abonnement</h3>
          </div>
          <span className="report-count">Hover cards to preview column highlight</span>
        </div>
        <div className="card-body">
          <table>
            <thead>
              <tr>
                <th>Capability</th>
                {plans.map((plan) => (
                  <th
                    key={`matrix-${plan.id}`}
                    className={featureColumns[plan.id] ? 'active-column' : ''}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureMatrix.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td className={featureColumns.launch ? 'active-column' : ''}>{row.launch ? 'Yes' : 'No'}</td>
                  <td className={featureColumns.growth ? 'active-column' : ''}>{row.growth ? 'Yes' : 'No'}</td>
                  <td className={featureColumns.elite ? 'active-column' : ''}>{row.elite ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="onboarding content-card">
        <div className="card-header">
          <div>
            <p className="card-kicker">Activation path</p>
            <h3 className="card-title">How boutique owners get onboarded</h3>
          </div>
        </div>
        <div className="card-body onboarding-steps">
          {onboardingFlow.map((step, index) => (
            <div key={step.title} className="onboarding-step">
              <div className="step-icon">
                <step.icon />
              </div>
              <div>
                <span className="step-count">Step {index + 1}</span>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Promotions;
