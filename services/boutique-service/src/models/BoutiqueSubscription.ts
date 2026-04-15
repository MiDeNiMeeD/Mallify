import mongoose, { Document, Schema } from 'mongoose';

export type SubscriptionStatus = 'pending_payment' | 'active' | 'past_due' | 'canceled' | 'expired';
export type BillingInterval = 'monthly' | 'yearly';

export interface IBoutiqueSubscription extends Document {
  boutiqueId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  amount: number;
  currency: string;
  provider: 'stripe' | 'manual';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeCheckoutSessionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const BoutiqueSubscriptionSchema = new Schema<IBoutiqueSubscription>(
  {
    boutiqueId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'Boutique',
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'SubscriptionPlan',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending_payment', 'active', 'past_due', 'canceled', 'expired'],
      default: 'pending_payment',
      index: true,
    },
    billingInterval: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ['stripe', 'manual'],
      default: 'stripe',
    },
    stripeCustomerId: {
      type: String,
      trim: true,
    },
    stripeSubscriptionId: {
      type: String,
      trim: true,
    },
    stripeCheckoutSessionId: {
      type: String,
      trim: true,
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
      index: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

BoutiqueSubscriptionSchema.index({ boutiqueId: 1 }, { unique: true });
BoutiqueSubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });

export const BoutiqueSubscription = mongoose.model<IBoutiqueSubscription>(
  'BoutiqueSubscription',
  BoutiqueSubscriptionSchema
);
