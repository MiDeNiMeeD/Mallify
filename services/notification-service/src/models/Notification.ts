import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'email' | 'sms' | 'push' | 'in_app';
  channel: string;
  subject?: string;
  message: string;
  data?: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  templateId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  deviceToken?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failureReason?: string;
  retryCount: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ['email', 'sms', 'push', 'in_app'],
      index: true
    },
    channel: {
      type: String,
      required: true
    },
    subject: {
      type: String
    },
    message: {
      type: String,
      required: true
    },
    data: {
      type: Schema.Types.Mixed
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'sent', 'failed', 'delivered', 'read'],
      default: 'pending',
      index: true
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    templateId: {
      type: String
    },
    recipientEmail: {
      type: String
    },
    recipientPhone: {
      type: String
    },
    deviceToken: {
      type: String
    },
    sentAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    readAt: {
      type: Date
    },
    failureReason: {
      type: String
    },
    retryCount: {
      type: Number,
      default: 0
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Indexes
NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, status: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
