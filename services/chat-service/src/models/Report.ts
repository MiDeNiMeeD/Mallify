import mongoose, { Schema, Document, Types } from 'mongoose';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'nudity'
  | 'violence'
  | 'scam'
  | 'illegal'
  | 'other';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export interface IReport extends Document {
  reporterId: Types.ObjectId;
  reportedUserId: Types.ObjectId;
  messageId?: Types.ObjectId;
  conversationId?: Types.ObjectId;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reportedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', index: true },
    reason: {
      type: String,
      required: true,
      enum: ['spam', 'harassment', 'hate_speech', 'nudity', 'violence', 'scam', 'illegal', 'other'],
    },
    description: { type: String, maxlength: 2000 },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IReport>('Report', ReportSchema);
