import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Boutique } from '../models/Boutique';
import { BoutiqueSubscription } from '../models/BoutiqueSubscription';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { hasStripeConfig, stripeClient } from '../lib/stripe';

type Role = 'admin' | 'boutiques_manager' | 'boutique_owner' | 'client' | 'delivery_manager' | 'delivery_person' | '';

const DEFAULT_PLANS = [
  {
    name: 'Launch',
    code: 'launch',
    description: 'Starter plan for new boutiques.',
    monthlyPrice: 39,
    yearlyPrice: 399,
    currency: 'USD',
    features: ['Up to 80 products', 'Basic promotions', 'Standard support'],
    limits: { maxProducts: 80, prioritySupport: false, advancedAnalytics: false },
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Growth',
    code: 'growth',
    description: 'Scale with advanced promotions and analytics.',
    monthlyPrice: 79,
    yearlyPrice: 799,
    currency: 'USD',
    features: ['Up to 300 products', 'Advanced promotions', 'Priority support'],
    limits: { maxProducts: 300, prioritySupport: true, advancedAnalytics: true },
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Elite',
    code: 'elite',
    description: 'For multi-boutique businesses.',
    monthlyPrice: 149,
    yearlyPrice: 1499,
    currency: 'USD',
    features: ['Unlimited products', 'Full promotions', '24/7 support'],
    limits: { maxProducts: null, prioritySupport: true, advancedAnalytics: true },
    displayOrder: 3,
    isActive: true,
  },
];

const getRole = (req: Request): Role => {
  const role = (req.header('x-user-role') || '').toLowerCase();
  if (
    role === 'admin' ||
    role === 'boutiques_manager' ||
    role === 'boutique_owner' ||
    role === 'client' ||
    role === 'delivery_manager' ||
    role === 'delivery_person'
  ) {
    return role;
  }
  return '';
};

const canManagePlans = (req: Request) => {
  const role = getRole(req);
  return role === 'admin' || role === 'boutiques_manager';
};

const toObjectId = (value: string) => {
  return mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null;
};

const mapStripeSubscriptionStatus = (status: Stripe.Subscription.Status) => {
  if (status === 'active' || status === 'trialing') {
    return 'active' as const;
  }

  if (status === 'canceled') {
    return 'canceled' as const;
  }

  if (status === 'past_due' || status === 'unpaid' || status === 'paused') {
    return 'past_due' as const;
  }

  return 'pending_payment' as const;
};

const getRequestOrigin = (req: Request) => {
  const headerOrigin = req.header('origin');
  if (headerOrigin) {
    return headerOrigin;
  }

  const forwardedProto = (req.header('x-forwarded-proto') || req.protocol || 'http').split(',')[0].trim();
  const forwardedHost = (req.header('x-forwarded-host') || req.get('host') || 'localhost:3000').split(',')[0].trim();
  return `${forwardedProto}://${forwardedHost}`;
};

const appendQuery = (base: string, query: string) => {
  return `${base}${base.includes('?') ? '&' : '?'}${query}`;
};

const buildSuccessUrl = (req: Request, boutiqueId: string) => {
  const fallback = `${getRequestOrigin(req)}/subscription`;
  const base = process.env.STRIPE_SUCCESS_URL || fallback;
  return appendQuery(
    base,
    `checkout=success&boutiqueId=${encodeURIComponent(boutiqueId)}&session_id={CHECKOUT_SESSION_ID}`
  );
};

const buildCancelUrl = (req: Request, boutiqueId: string) => {
  const fallback = `${getRequestOrigin(req)}/subscription`;
  const base = process.env.STRIPE_CANCEL_URL || fallback;
  return appendQuery(base, `checkout=cancel&boutiqueId=${encodeURIComponent(boutiqueId)}`);
};

const unixToDate = (value?: number | null) => (typeof value === 'number' ? new Date(value * 1000) : undefined);

const getStripePeriodStart = (subscription: Stripe.Subscription) => {
  const raw = (subscription as any).current_period_start;
  if (typeof raw === 'number') {
    return raw;
  }

  const itemRaw = (subscription as any)?.items?.data?.[0]?.current_period_start;
  return typeof itemRaw === 'number' ? itemRaw : null;
};

const getStripePeriodEnd = (subscription: Stripe.Subscription) => {
  const raw = (subscription as any).current_period_end;
  if (typeof raw === 'number') {
    return raw;
  }

  const itemRaw = (subscription as any)?.items?.data?.[0]?.current_period_end;
  return typeof itemRaw === 'number' ? itemRaw : null;
};

const getInvoiceSubscriptionId = (invoice: Stripe.Invoice) => {
  const raw = (invoice as any).subscription;
  return typeof raw === 'string' ? raw : null;
};

const getSessionSubscriptionId = (session: Stripe.Checkout.Session) => {
  const raw = session.subscription as unknown;
  if (typeof raw === 'string') {
    return raw;
  }
  if (raw && typeof raw === 'object' && 'id' in (raw as Record<string, unknown>)) {
    const id = (raw as Record<string, unknown>).id;
    return typeof id === 'string' ? id : null;
  }
  return null;
};

const syncStripeSubscriptionToLocal = async (
  stripeSubscription: Stripe.Subscription,
  fallback: { boutiqueId?: string; planId?: string; ownerId?: string; billingInterval?: 'monthly' | 'yearly'; sessionId?: string }
) => {
  const metadata = stripeSubscription.metadata || {};
  let boutiqueIdRaw = metadata.boutiqueId || fallback.boutiqueId;
  let planIdRaw = metadata.planId || fallback.planId;
  let ownerIdRaw = metadata.ownerId || fallback.ownerId;
  let billingIntervalRaw = metadata.billingInterval || fallback.billingInterval || 'monthly';

  if (!boutiqueIdRaw || !planIdRaw || !ownerIdRaw) {
    const existing = await BoutiqueSubscription.findOne({
      $or: [
        ...(fallback.sessionId ? [{ stripeCheckoutSessionId: fallback.sessionId }] : []),
        { stripeSubscriptionId: stripeSubscription.id },
      ],
    }).lean();

    if (existing) {
      boutiqueIdRaw = boutiqueIdRaw || String(existing.boutiqueId);
      planIdRaw = planIdRaw || String(existing.planId);
      ownerIdRaw = ownerIdRaw || String(existing.ownerId);
      billingIntervalRaw = billingIntervalRaw || existing.billingInterval;
    }
  }

  if (!boutiqueIdRaw || !planIdRaw || !ownerIdRaw) {
    const customerId = typeof stripeSubscription.customer === 'string' ? stripeSubscription.customer : null;
    if (customerId) {
      const existingByCustomer = await BoutiqueSubscription.findOne({
        stripeCustomerId: customerId,
      })
        .sort({ updatedAt: -1 })
        .lean();

      if (existingByCustomer) {
        boutiqueIdRaw = boutiqueIdRaw || String(existingByCustomer.boutiqueId);
        planIdRaw = planIdRaw || String(existingByCustomer.planId);
        ownerIdRaw = ownerIdRaw || String(existingByCustomer.ownerId);
        billingIntervalRaw = billingIntervalRaw || existingByCustomer.billingInterval;
      }
    }
  }

  if (!boutiqueIdRaw || !planIdRaw || !ownerIdRaw) {
    return;
  }

  const boutiqueId = toObjectId(String(boutiqueIdRaw));
  const planId = toObjectId(String(planIdRaw));
  const ownerId = toObjectId(String(ownerIdRaw));

  if (!boutiqueId || !planId || !ownerId) {
    return;
  }

  const billingInterval = billingIntervalRaw === 'yearly' ? 'yearly' : 'monthly';
  const amount = typeof stripeSubscription.items.data[0]?.price?.unit_amount === 'number'
    ? stripeSubscription.items.data[0].price.unit_amount / 100
    : 0;
  const currency = (stripeSubscription.currency || 'usd').toUpperCase();

  await BoutiqueSubscription.findOneAndUpdate(
    { boutiqueId },
    {
      $set: {
        boutiqueId,
        ownerId,
        planId,
        status: mapStripeSubscriptionStatus(stripeSubscription.status),
        billingInterval,
        amount,
        currency,
        provider: 'stripe',
        stripeCustomerId: typeof stripeSubscription.customer === 'string' ? stripeSubscription.customer : undefined,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCheckoutSessionId: fallback.sessionId,
        currentPeriodStart: unixToDate(getStripePeriodStart(stripeSubscription)),
        currentPeriodEnd: unixToDate(getStripePeriodEnd(stripeSubscription)),
        cancelAtPeriodEnd: Boolean(stripeSubscription.cancel_at_period_end),
        canceledAt: stripeSubscription.canceled_at ? unixToDate(stripeSubscription.canceled_at) : null,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const isSubscriptionActiveNow = (subscription: { status: string; currentPeriodEnd?: Date | null }) => {
  if (subscription.status !== 'active') {
    return false;
  }

  if (!subscription.currentPeriodEnd) {
    return false;
  }

  return subscription.currentPeriodEnd > new Date();
};

const ensureDefaultPlans = async () => {
  const count = await SubscriptionPlan.countDocuments();
  if (count > 0) {
    return;
  }

  await SubscriptionPlan.insertMany(DEFAULT_PLANS);
};

export const getPlans = async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureDefaultPlans();
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 }).lean();

    res.status(200).json({ success: true, data: { plans } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch plans' });
  }
};

export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!canManagePlans(req)) {
      res.status(403).json({ success: false, message: 'Only boutiques managers can create plans.' });
      return;
    }

    const payload = req.body;
    const plan = new SubscriptionPlan(payload);
    await plan.save();

    res.status(201).json({ success: true, data: { plan } });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Plan code already exists.' });
      return;
    }

    res.status(500).json({ success: false, message: 'Failed to create plan' });
  }
};

export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!canManagePlans(req)) {
      res.status(403).json({ success: false, message: 'Only boutiques managers can update plans.' });
      return;
    }

    const id = req.params.id;
    const updates = req.body;

    delete updates._id;
    delete updates.createdAt;

    const plan = await SubscriptionPlan.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });

    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found.' });
      return;
    }

    res.status(200).json({ success: true, data: { plan } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update plan' });
  }
};

export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!canManagePlans(req)) {
      res.status(403).json({ success: false, message: 'Only boutiques managers can delete plans.' });
      return;
    }

    const id = req.params.id;
    const plan = await SubscriptionPlan.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });

    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Plan archived successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete plan' });
  }
};

export const getSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const boutiqueId = toObjectId(req.params.boutiqueId);
    if (!boutiqueId) {
      res.status(400).json({ success: false, message: 'Invalid boutique ID.' });
      return;
    }

    const subscription = await BoutiqueSubscription.findOne({ boutiqueId }).populate('planId').lean();

    if (!subscription) {
      res.status(200).json({ success: true, data: { subscription: null } });
      return;
    }

    res.status(200).json({ success: true, data: { subscription } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscription' });
  }
};

export const getSubscriptionAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const boutiqueId = toObjectId(req.params.boutiqueId);
    if (!boutiqueId) {
      res.status(400).json({ success: false, message: 'Invalid boutique ID.' });
      return;
    }

    const subscription = await BoutiqueSubscription.findOne({ boutiqueId }).lean();

    if (!subscription) {
      res.status(200).json({
        success: true,
        data: {
          hasManagementAccess: false,
          reason: 'subscription_required',
          subscription: null,
        },
      });
      return;
    }

    let normalizedSubscription = subscription;

    // Self-heal: if Stripe marks it active but current period is missing, fetch and sync from Stripe.
    if (
      normalizedSubscription.status === 'active' &&
      !normalizedSubscription.currentPeriodEnd &&
      normalizedSubscription.provider === 'stripe' &&
      normalizedSubscription.stripeSubscriptionId &&
      hasStripeConfig &&
      stripeClient
    ) {
      const stripeSubscription = await stripeClient.subscriptions.retrieve(normalizedSubscription.stripeSubscriptionId);
      await syncStripeSubscriptionToLocal(stripeSubscription, {
        boutiqueId: String(normalizedSubscription.boutiqueId),
        planId: String(normalizedSubscription.planId),
        ownerId: String(normalizedSubscription.ownerId),
      });

      const refreshed = await BoutiqueSubscription.findOne({ boutiqueId }).lean();
      if (refreshed) {
        normalizedSubscription = refreshed;
      }
    }

    // Self-heal: if the record is stuck on pending_payment but Stripe already collected the payment
    // (webhook delivery failed / not configured), reconcile by retrieving the checkout session.
    if (
      normalizedSubscription.status === 'pending_payment' &&
      normalizedSubscription.provider === 'stripe' &&
      normalizedSubscription.stripeCheckoutSessionId &&
      hasStripeConfig &&
      stripeClient
    ) {
      const session = await stripeClient.checkout.sessions.retrieve(normalizedSubscription.stripeCheckoutSessionId);
      const subscriptionId = getSessionSubscriptionId(session);

      if (session.payment_status === 'paid' && subscriptionId) {
        const stripeSubscription = await stripeClient.subscriptions.retrieve(subscriptionId);
        await syncStripeSubscriptionToLocal(stripeSubscription, {
          boutiqueId: String(normalizedSubscription.boutiqueId),
          planId: String(normalizedSubscription.planId),
          ownerId: String(normalizedSubscription.ownerId),
          billingInterval: normalizedSubscription.billingInterval,
          sessionId: session.id,
        });

        const refreshed = await BoutiqueSubscription.findOne({ boutiqueId }).lean();
        if (refreshed) {
          normalizedSubscription = refreshed;
        }
      }
    }

    const hasManagementAccess = isSubscriptionActiveNow(normalizedSubscription);
    const reason = hasManagementAccess ? 'active' : normalizedSubscription.status === 'expired' ? 'expired' : 'inactive';

    res.status(200).json({
      success: true,
      data: {
        hasManagementAccess,
        reason,
        subscription: normalizedSubscription,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscription access' });
  }
};

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const boutiqueId = toObjectId(req.params.boutiqueId);
    const { planId, billingInterval = 'monthly' } = req.body as {
      planId?: string;
      billingInterval?: 'monthly' | 'yearly';
    };

    if (!boutiqueId || !planId) {
      res.status(400).json({ success: false, message: 'Boutique ID and plan ID are required.' });
      return;
    }

    const plan = await SubscriptionPlan.findOne({ _id: planId, isActive: true }).lean();
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found.' });
      return;
    }

    const selectedAmount = billingInterval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    const boutique = await Boutique.findById(boutiqueId).lean();

    if (!boutique) {
      res.status(404).json({ success: false, message: 'Boutique not found.' });
      return;
    }

    if (!hasStripeConfig || !stripeClient) {
      res.status(500).json({ success: false, message: 'Stripe is not configured. Set STRIPE_SECRET_KEY in boutique-service.' });
      return;
    }

    const stripeInterval: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.Recurring.Interval =
      billingInterval === 'yearly' ? 'year' : 'month';

    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      customer_email: boutique.email,
      success_url: buildSuccessUrl(req, String(boutiqueId)),
      cancel_url: buildCancelUrl(req, String(boutiqueId)),
      client_reference_id: String(boutiqueId),
      metadata: {
        boutiqueId: String(boutiqueId),
        ownerId: String(boutique.ownerId),
        planId: String(plan._id),
        billingInterval,
      },
      subscription_data: {
        metadata: {
          boutiqueId: String(boutiqueId),
          ownerId: String(boutique.ownerId),
          planId: String(plan._id),
          billingInterval,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: plan.currency.toLowerCase(),
            unit_amount: Math.round(selectedAmount * 100),
            recurring: { interval: stripeInterval },
            product_data: {
              name: `${plan.name} plan`,
              description: plan.description || undefined,
            },
          },
        },
      ],
    });

    await BoutiqueSubscription.findOneAndUpdate(
      { boutiqueId },
      {
        $set: {
          boutiqueId,
          ownerId: boutique.ownerId,
          planId: new mongoose.Types.ObjectId(plan._id),
          status: 'pending_payment',
          billingInterval,
          amount: selectedAmount,
          currency: plan.currency,
          provider: 'stripe',
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
          stripeCheckoutSessionId: session.id,
          metadata: {
            ...(typeof req.body.metadata === 'object' && req.body.metadata ? req.body.metadata : {}),
            stripeMode: 'checkout',
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!session.url) {
      res.status(500).json({ success: false, message: 'Failed to create Stripe Checkout URL.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        provider: 'stripe',
        sessionId: session.id,
        checkoutUrl: session.url,
        amount: selectedAmount,
        currency: plan.currency,
        message: 'Stripe checkout session created successfully.',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create checkout session' });
  }
};

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!hasStripeConfig || !stripeClient) {
      res.status(500).json({ success: false, message: 'Stripe is not configured.' });
      return;
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      res.status(500).json({ success: false, message: 'Missing STRIPE_WEBHOOK_SECRET.' });
      return;
    }

    const signature = req.header('stripe-signature');
    if (!signature) {
      res.status(400).json({ success: false, message: 'Missing stripe-signature header.' });
      return;
    }

    if (!Buffer.isBuffer(req.body)) {
      res.status(400).json({ success: false, message: 'Invalid webhook payload type.' });
      return;
    }

    const event = stripeClient.webhooks.constructEvent(req.body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = getSessionSubscriptionId(session);
        if (session.mode === 'subscription' && subscriptionId) {
          const stripeSubscription = await stripeClient.subscriptions.retrieve(subscriptionId);
          await syncStripeSubscriptionToLocal(stripeSubscription, {
            boutiqueId: session.metadata?.boutiqueId,
            planId: session.metadata?.planId,
            ownerId: session.metadata?.ownerId,
            billingInterval: session.metadata?.billingInterval === 'yearly' ? 'yearly' : 'monthly',
            sessionId: session.id,
          });

          // Safety net: if payment is already confirmed at checkout, don't leave local state pending.
          if (session.payment_status === 'paid') {
            await BoutiqueSubscription.findOneAndUpdate(
              { stripeCheckoutSessionId: session.id },
              {
                $set: {
                  status: 'active',
                  stripeSubscriptionId: subscriptionId,
                },
              }
            );
          }
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncStripeSubscriptionToLocal(subscription, {});
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await BoutiqueSubscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            $set: {
              status: 'canceled',
              cancelAtPeriodEnd: false,
              canceledAt: new Date(),
              currentPeriodEnd: unixToDate(getStripePeriodEnd(subscription)),
            },
          }
        );
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubscriptionId = getInvoiceSubscriptionId(invoice);
        if (stripeSubscriptionId) {
          await BoutiqueSubscription.findOneAndUpdate(
            { stripeSubscriptionId },
            {
              $set: {
                status: 'past_due',
              },
            }
          );
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubscriptionId = getInvoiceSubscriptionId(invoice);
        if (stripeSubscriptionId) {
          const subscription = await stripeClient.subscriptions.retrieve(stripeSubscriptionId);
          await syncStripeSubscriptionToLocal(subscription, {});
        }
        break;
      }
      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Stripe webhook processing failed.' });
  }
};

export const activateSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const boutiqueId = toObjectId(req.params.boutiqueId);
    const { planId, billingInterval = 'monthly', paymentSessionId } = req.body as {
      planId?: string;
      billingInterval?: 'monthly' | 'yearly';
      paymentSessionId?: string;
    };

    if (!boutiqueId || !planId) {
      res.status(400).json({ success: false, message: 'Boutique ID and plan ID are required.' });
      return;
    }

    const plan = await SubscriptionPlan.findOne({ _id: planId, isActive: true }).lean();
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found.' });
      return;
    }

    const now = new Date();
    const endDate = addMonths(now, billingInterval === 'yearly' ? 12 : 1);
    const selectedAmount = billingInterval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

    const boutique = await Boutique.findById(boutiqueId).lean();
    if (!boutique) {
      res.status(404).json({ success: false, message: 'Boutique not found.' });
      return;
    }

    const subscription = await BoutiqueSubscription.findOneAndUpdate(
      { boutiqueId },
      {
        $set: {
          boutiqueId,
          ownerId: boutique.ownerId,
          planId: new mongoose.Types.ObjectId(plan._id),
          status: 'active',
          billingInterval,
          amount: selectedAmount,
          currency: plan.currency,
          provider: 'stripe',
          stripeCheckoutSessionId: paymentSessionId || undefined,
          currentPeriodStart: now,
          currentPeriodEnd: endDate,
          cancelAtPeriodEnd: false,
          canceledAt: null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('planId');

    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully.',
      data: { subscription },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to activate subscription' });
  }
};

export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const boutiqueId = toObjectId(req.params.boutiqueId);
    if (!boutiqueId) {
      res.status(400).json({ success: false, message: 'Invalid boutique ID.' });
      return;
    }

    const subscription = await BoutiqueSubscription.findOne({ boutiqueId });
    if (!subscription) {
      res.status(404).json({ success: false, message: 'Subscription not found.' });
      return;
    }

    if (subscription.provider === 'stripe' && subscription.stripeSubscriptionId && hasStripeConfig && stripeClient) {
      await stripeClient.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    subscription.cancelAtPeriodEnd = true;
    subscription.canceledAt = new Date();
    await subscription.save();

    res.status(200).json({ success: true, message: 'Subscription will cancel at period end.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel subscription' });
  }
};

export const expireEndedSubscriptions = async (): Promise<number> => {
  const now = new Date();
  const result = await BoutiqueSubscription.updateMany(
    {
      status: 'active',
      currentPeriodEnd: { $lte: now },
    },
    {
      $set: {
        status: 'expired',
      },
    }
  );

  return result.modifiedCount;
};
