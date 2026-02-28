import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery' | 'wallet';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transactionId?: string;
  paymentGateway?: string;
  paymentDetails?: {
    cardLast4?: string;
    cardBrand?: string;
    paypalEmail?: string;
    bankName?: string;
  };
  refund?: {
    amount: number;
    reason: string;
    refundedAt: Date;
    transactionId?: string;
  };
  metadata?: Record<string, any>;
  failureReason?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'wallet']
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      index: true
    },
    transactionId: {
      type: String,
      sparse: true,
      unique: true
    },
    paymentGateway: {
      type: String
    },
    paymentDetails: {
      cardLast4: String,
      cardBrand: String,
      paypalEmail: String,
      bankName: String
    },
    refund: {
      amount: Number,
      reason: String,
      refundedAt: Date,
      transactionId: String
    },
    metadata: {
      type: Schema.Types.Mixed
    },
    failureReason: {
      type: String
    },
    paidAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for queries
PaymentSchema.index({ orderId: 1, paymentStatus: 1 });
PaymentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
