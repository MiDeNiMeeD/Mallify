import mongoose, { Schema } from 'mongoose';

interface IBoutiqueAccess {
  _id: mongoose.Types.ObjectId;
  status: 'pending' | 'active' | 'suspended' | 'closed';
  verified: boolean;
}

interface IBoutiqueSubscriptionAccess {
  boutiqueId: mongoose.Types.ObjectId;
  status: 'pending_payment' | 'active' | 'past_due' | 'canceled' | 'expired';
  currentPeriodEnd?: Date;
}

const BoutiqueAccessSchema = new Schema<IBoutiqueAccess>(
  {
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'closed'],
      required: true,
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    collection: 'boutiques',
    versionKey: false,
  }
);

const BoutiqueSubscriptionAccessSchema = new Schema<IBoutiqueSubscriptionAccess>(
  {
    boutiqueId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending_payment', 'active', 'past_due', 'canceled', 'expired'],
      required: true,
      index: true,
    },
    currentPeriodEnd: {
      type: Date,
      index: true,
    },
  },
  {
    collection: 'boutiquesubscriptions',
    versionKey: false,
  }
);

export const BoutiqueAccess = mongoose.model<IBoutiqueAccess>('BoutiqueAccess', BoutiqueAccessSchema);

export const BoutiqueSubscriptionAccess = mongoose.model<IBoutiqueSubscriptionAccess>(
  'BoutiqueSubscriptionAccess',
  BoutiqueSubscriptionAccessSchema
);
