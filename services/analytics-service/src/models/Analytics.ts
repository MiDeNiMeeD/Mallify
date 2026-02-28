import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  eventType: 'page_view' | 'product_view' | 'add_to_cart' | 'purchase' | 'search' | 'click' | 'custom';
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  data: Record<string, any>;
  timestamp: Date;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    country?: string;
    city?: string;
  };
  createdAt: Date;
}

const AnalyticsSchema: Schema = new Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: ['page_view', 'product_view', 'add_to_cart', 'purchase', 'search', 'click', 'custom'],
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    sessionId: {
      type: String,
      index: true
    },
    data: {
      type: Schema.Types.Mixed,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    metadata: {
      userAgent: String,
      ipAddress: String,
      referrer: String,
      country: String,
      city: String
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

AnalyticsSchema.index({ eventType: 1, timestamp: -1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
