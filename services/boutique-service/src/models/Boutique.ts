import mongoose, { Document, Schema } from 'mongoose';

export interface IBoutique extends Document {
  name: string;
  description: string;
  ownerId: mongoose.Types.ObjectId;
  
  // Contact
  email: string;
  phone?: string;
  website?: string;
  
  // Address
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Business info
  businessType: 'retail' | 'wholesale' | 'both';
  categories: string[];
  tags: string[];
  
  // Media
  logo?: string;
  banner?: string;
  images: string[];
  
  // Operating hours
  hours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  
  // Settings
  currency: string;
  timezone: string;
  language: string;
  
  // Status
  status: 'pending' | 'active' | 'suspended' | 'closed';
  verified: boolean;
  featured: boolean;
  
  // Stats
  rating: number;
  reviewCount: number;
  totalSales: number;
  totalOrders: number;
  
  // SEO
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const BoutiqueSchema = new Schema<IBoutique>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: String,
    website: String,
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    businessType: {
      type: String,
      enum: ['retail', 'wholesale', 'both'],
      default: 'retail',
    },
    categories: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    logo: String,
    banner: String,
    images: {
      type: [String],
      default: [],
    },
    hours: {
      type: Schema.Types.Mixed,
      default: {},
    },
    currency: {
      type: String,
      default: 'USD',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    language: {
      type: String,
      default: 'en',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'closed'],
      default: 'pending',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    metaTitle: String,
    metaDescription: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
BoutiqueSchema.index({ ownerId: 1, status: 1 });
BoutiqueSchema.index({ slug: 1 });
BoutiqueSchema.index({ status: 1, featured: 1 });
BoutiqueSchema.index({ 'address.city': 1, 'address.country': 1 });
BoutiqueSchema.index({ name: 'text', description: 'text' });

export const Boutique = mongoose.model<IBoutique>('Boutique', BoutiqueSchema);
