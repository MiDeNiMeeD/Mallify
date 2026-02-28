import mongoose, { Schema, Document } from 'mongoose';

export interface IDispute extends Document {
  disputeNumber: string;
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  boutiqueId: mongoose.Types.ObjectId;
  type: 'order_issue' | 'product_quality' | 'delivery_issue' | 'refund_request' | 'other';
  status: 'open' | 'investigating' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  evidence?: Array<{
    type: 'image' | 'document';
    url: string;
    description?: string;
  }>;
  messages: Array<{
    senderId: mongoose.Types.ObjectId;
    senderType: 'user' | 'boutique' | 'admin';
    message: string;
    timestamp: Date;
  }>;
  resolution?: {
    action: 'refund' | 'replacement' | 'compensation' | 'no_action';
    amount?: number;
    description: string;
    resolvedBy: mongoose.Types.ObjectId;
    resolvedAt: Date;
  };
  assignedTo?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema: Schema = new Schema(
  {
    disputeNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
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
    boutiqueId: {
      type: Schema.Types.ObjectId,
      ref: 'Boutique',
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ['order_issue', 'product_quality', 'delivery_issue', 'refund_request', 'other']
    },
    status: {
      type: String,
      required: true,
      enum: ['open', 'investigating', 'resolved', 'closed', 'escalated'],
      default: 'open',
      index: true
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },
    subject: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    evidence: [{
      type: { type: String, enum: ['image', 'document'] },
      url: String,
      description: String
    }],
    messages: [{
      senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      senderType: { type: String, required: true, enum: ['user', 'boutique', 'admin'] },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }],
    resolution: {
      action: { type: String, enum: ['refund', 'replacement', 'compensation', 'no_action'] },
      amount: Number,
      description: String,
      resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      resolvedAt: Date
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

DisputeSchema.index({ status: 1, priority: 1, createdAt: -1 });

export default mongoose.model<IDispute>('Dispute', DisputeSchema);
