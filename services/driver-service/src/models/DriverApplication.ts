import mongoose, { Schema, Document } from 'mongoose';

export interface IDriverApplication extends Document {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  cinDocument: string; // URL to uploaded CIN
  licenseDocument: string; // URL to uploaded license
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  notes?: string;
}

const DriverApplicationSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    cinDocument: {
      type: String,
      required: true,
    },
    licenseDocument: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'under_review'],
      default: 'pending',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
DriverApplicationSchema.index({ email: 1 });
DriverApplicationSchema.index({ status: 1 });
DriverApplicationSchema.index({ submittedAt: -1 });

export default mongoose.model<IDriverApplication>('DriverApplication', DriverApplicationSchema);
