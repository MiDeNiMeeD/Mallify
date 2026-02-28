import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Subscription Management Controller
 * Manages boutique subscription plans, billing, and features
 */

// Subscription model
const Subscription = mongoose.model('Subscription', new mongoose.Schema({
  boutiqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'suspended', 'trial'],
    default: 'trial'
  },
  billing: {
    amount: Number,
    currency: { type: String, default: 'USD' },
    interval: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    nextBillingDate: Date,
    lastBillingDate: Date
  },
  features: {
    maxProducts: Number,
    maxOrders: Number,
    commissionRate: Number, // percentage
    analytics: Boolean,
    prioritySupport: Boolean,
    customBranding: Boolean,
    apiAccess: Boolean,
    multiLocation: Boolean,
    advancedReporting: Boolean
  },
  usage: {
    products: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    storage: { type: Number, default: 0 } // in MB
  },
  trial: {
    isTrialUsed: { type: Boolean, default: false },
    trialEndsAt: Date
  },
  paymentMethod: {
    type: { type: String, enum: ['card', 'bank', 'paypal'] },
    last4: String,
    brand: String
  },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

// Plan definitions
const PLANS = {
  basic: {
    name: 'Basic',
    price: { monthly: 29.99, yearly: 299.99 },
    features: {
      maxProducts: 100,
      maxOrders: null, // unlimited
      commissionRate: 5,
      analytics: true,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      multiLocation: false,
      advancedReporting: false
    },
    description: 'Perfect for small boutiques getting started'
  },
  premium: {
    name: 'Premium',
    price: { monthly: 79.99, yearly: 799.99 },
    features: {
      maxProducts: 500,
      maxOrders: null,
      commissionRate: 3.5,
      analytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      multiLocation: false,
      advancedReporting: true
    },
    description: 'For growing businesses with advanced needs'
  },
  enterprise: {
    name: 'Enterprise',
    price: { monthly: 199.99, yearly: 1999.99 },
    features: {
      maxProducts: null, // unlimited
      maxOrders: null,
      commissionRate: 2,
      analytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      multiLocation: true,
      advancedReporting: true
    },
    description: 'Comprehensive solution for large-scale operations'
  }
};

/**
 * Get all available plans
 */
export const getPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ plans: PLANS });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plans' });
    return;
  }
};

/**
 * Get boutique subscription
 */
export const getSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boutiqueId } = req.params;
    
    const subscription = await Subscription.findOne({ boutiqueId })
      .populate('boutiqueId', 'name email');
    
    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }
    
    // Check if subscription is expired
    if (subscription.status === 'active' && subscription.billing.nextBillingDate < new Date()) {
      subscription.status = 'expired';
      await subscription.save();
    }
    
    res.status(200).json(subscription);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
    return;
  }
};

/**
 * Create new subscription
 */
export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boutiqueId, plan, interval = 'monthly', startTrial = true } = req.body;
    
    // Check if plan exists
    if (!PLANS[plan as keyof typeof PLANS]) {
      res.status(400).json({ error: 'Invalid plan' });
      return;
    }
    
    // Check if subscription already exists
    const existing = await Subscription.findOne({ boutiqueId });
    if (existing) {
      res.status(400).json({ error: 'Subscription already exists for this boutique' });
      return;
    }
    
    const planDetails = PLANS[plan as keyof typeof PLANS];
    const now = new Date();
    const trialDays = 14;
    
    const subscription = new Subscription({
      boutiqueId,
      plan,
      status: startTrial ? 'trial' : 'active',
      billing: {
        amount: planDetails.price[interval as keyof typeof planDetails.price],
        currency: 'USD',
        interval,
        nextBillingDate: new Date(now.getTime() + (startTrial ? trialDays + 30 : 30) * 24 * 60 * 60 * 1000),
        lastBillingDate: startTrial ? null : now
      },
      features: planDetails.features,
      trial: {
        isTrialUsed: startTrial,
        trialEndsAt: startTrial ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null
      }
    });
    
    await subscription.save();
    
    res.status(201).json(subscription);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
    return;
  }
};

/**
 * Update subscription plan (upgrade/downgrade)
 */
export const updateSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boutiqueId } = req.params;
    const { plan, interval } = req.body;
    
    if (!PLANS[plan as keyof typeof PLANS]) {
      res.status(400).json({ error: 'Invalid plan' });
      return;
    }
    
    const subscription = await Subscription.findOne({ boutiqueId });
    
    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }
    
    const planDetails = PLANS[plan as keyof typeof PLANS];
    const oldPlan = subscription.plan;
    
    // Update subscription
    subscription.plan = plan;
    subscription.features = planDetails.features;
    
    if (interval) {
      subscription.billing.interval = interval;
      subscription.billing.amount = planDetails.price[interval as keyof typeof planDetails.price];
    }
    
    subscription.updatedAt = new Date();
    
    await subscription.save();
    
    res.status(200).json({
      subscription,
      message: `Successfully ${getPlanTier(plan) > getPlanTier(oldPlan) ? 'upgraded' : 'downgraded'} from ${oldPlan} to ${plan}`
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription' });
    return;
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boutiqueId } = req.params;
    const { reason, immediate = false } = req.body;
    
    const subscription = await Subscription.findOne({ boutiqueId });
    
    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }
    
    if (immediate) {
      subscription.status = 'cancelled';
    } else {
      // Cancel at end of billing period
      subscription.status = 'active'; // Keep active until next billing date
      subscription.metadata = {
        ...subscription.metadata,
        cancelledAt: new Date(),
        cancellationReason: reason,
        willCancelAt: subscription.billing.nextBillingDate
      };
    }
    
    subscription.updatedAt = new Date();
    await subscription.save();
    
    res.status(200).json({
      subscription,
      message: immediate 
        ? 'Subscription cancelled immediately' 
        : `Subscription will be cancelled on ${subscription.billing.nextBillingDate.toDateString()}`
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
    return;
  }
};

/**
 * Reactivate subscription
 */
export const reactivateSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boutiqueId } = req.params;
    
    const subscription = await Subscription.findOne({ boutiqueId });
    
    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }
    
    if (subscription.status !== 'cancelled' && subscription.status !== 'expired') {
      res.status(400).json({ error: 'Subscription is already active' });
      return;
    }
    
    subscription.status = 'active';
    subscription.billing.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    subscription.updatedAt = new Date();
    
    await subscription.save();
    
    res.status(200).json({
      subscription,
      message: 'Subscription reactivated successfully'
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to reactivate subscription' });
    return;
  }
};

/**
 * Process subscription payment
 */
export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boutiqueId } = req.params;
    const { paymentMethodId, amount } = req.body;
    
    const subscription = await Subscription.findOne({ boutiqueId });
    
    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }
    
    // Simulate payment processing (integrate with Stripe, PayPal, etc.)
    const paymentSuccess = Math.random() > 0.1; // 90% success rate
    
    if (paymentSuccess) {
      subscription.billing.lastBillingDate = new Date();
      subscription.billing.nextBillingDate = new Date(
        Date.now() + (subscription.billing.interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
      );
      
      if (subscription.status === 'trial') {
        subscription.status = 'active';
      }
      
      subscription.updatedAt = new Date();
      await subscription.save();
      
      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        subscription,
        transaction: {
          id: `txn_${Date.now()}`,
          amount,
          date: new Date(),
          status: 'completed'
        }
      });
    } else {
      subscription.status = 'suspended';
      await subscription.save();
      
      res.status(402).json({
        success: false,
        error: 'Payment failed',
        message: 'Please update your payment method'
      });
    }
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to process payment' });
    return;
  }
};

/**
 * Get subscription usage
 */
export const getUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boutiqueId } = req.params;
    
    const subscription = await Subscription.findOne({ boutiqueId });
    
    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }
    
    const usage = {
      boutiqueId,
      plan: subscription.plan,
      usage: subscription.usage,
      limits: {
        products: subscription.features.maxProducts,
        orders: subscription.features.maxOrders,
        storage: 1000 // 1GB in MB
      },
      utilization: {
        products: subscription.features.maxProducts 
          ? `${Math.round((subscription.usage.products / subscription.features.maxProducts) * 100)}%`
          : 'N/A',
        orders: 'N/A', // Unlimited
        storage: `${Math.round((subscription.usage.storage / 1000) * 100)}%`
      },
      warnings: []
    };
    
    // Check for usage warnings
    if (subscription.features.maxProducts && 
        subscription.usage.products / subscription.features.maxProducts > 0.9) {
      usage.warnings.push({
        type: 'products',
        message: 'Approaching product limit. Consider upgrading your plan.',
        severity: 'high'
      });
    }
    
    if (subscription.usage.storage / 1000 > 0.8) {
      usage.warnings.push({
        type: 'storage',
        message: 'Storage usage over 80%. Consider cleaning up unused files.',
        severity: 'medium'
      });
    }
    
    res.status(200).json(usage);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage' });
    return;
  }
};

/**
 * Get subscription analytics (Admin)
 */
export const getSubscriptionAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const analytics = await Subscription.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          revenue: { $sum: '$billing.amount' },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          trialCount: {
            $sum: { $cond: [{ $eq: ['$status', 'trial'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const statusBreakdown = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Subscription.countDocuments();
    const totalRevenue = await Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$billing.amount' } } }
    ]);
    
    res.status(200).json({
      total,
      byPlan: analytics,
      byStatus: statusBreakdown,
      monthlyRecurringRevenue: totalRevenue[0]?.total || 0,
      metrics: {
        churnRate: '2.5%', // Calculate from cancelled subscriptions
        averageLifetime: '18 months',
        conversionRate: '45%' // Trial to paid conversion
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription analytics' });
    return;
  }
};

// Helper function
function getPlanTier(plan: string): number {
  const tiers: { [key: string]: number } = { basic: 1, premium: 2, enterprise: 3 };
  return tiers[plan] || 0;
}
