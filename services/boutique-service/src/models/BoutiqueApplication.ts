import mongoose, { Schema, Document } from 'mongoose';

export interface IBoutiqueApplication extends Document {
  boutiqueName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  description: string;
  category: string;
  businessLicense: string; // URL to uploaded business license
  taxCertificate: string; // URL to uploaded tax certificate
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  notes?: string;
}

const BoutiqueApplicationSchema: Schema = new Schema(
  {
    boutiqueName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
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
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Fashion & Apparel',
        'Electronics',
        'Home & Garden',
        'Beauty & Cosmetics',
        'Sports & Outdoors',
        'Toys & Games',
        'Books & Media',
        'Food & Beverages',
        'Health & Wellness',
        'Jewelry & Accessories',
        'Other',
      ],
    },
    businessLicense: {
      type: String,
      required: true,
    },
    taxCertificate: {
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
BoutiqueApplicationSchema.index({ email: 1 });
BoutiqueApplicationSchema.index({ status: 1 });
BoutiqueApplicationSchema.index({ submittedAt: -1 });

export default mongoose.model<IBoutiqueApplication>('BoutiqueApplication', BoutiqueApplicationSchema);
