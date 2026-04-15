import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const hasStripeConfig = Boolean(stripeSecretKey);

export const stripeClient = hasStripeConfig
  ? new Stripe(stripeSecretKey)
  : null;
