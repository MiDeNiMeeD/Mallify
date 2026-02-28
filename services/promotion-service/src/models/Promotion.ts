import mongoose, { Schema, Document } from 'mongoose';

export interface IPromotion extends Document {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  discountValue: number;
  minimumPurchase?: number;
  maximumDiscount?: number;
  applicableTo: 'all' | 'specific_products' | 'specific_categories' | 'specific_boutiques';
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: string[];
  applicableBoutiques?: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usageCount: number;
  usagePerUser?: number;
  status: 'active' | 'inactive' | 'expired' | 'scheduled';
  conditions?: {
    firstOrderOnly?: boolean;
    minItems?: number;
    buyQuantity?: number;
    getQuantity?: number;
  };
  createdBy?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    type: {
      type: String,
      required: true,
      enum: ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y']
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    minimumPurchase: {
      type: Number,
      min: 0
    },
    maximumDiscount: {
      type: Number,
      min: 0
    },
    applicableTo: {
      type: String,
      required: true,
      enum: ['all', 'specific_products', 'specific_categories', 'specific_boutiques'],
      default: 'all'
    },
    applicableProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    applicableCategories: [{
      type: String
    }],
    applicableBoutiques: [{
      type: Schema.Types.ObjectId,
      ref: 'Boutique'
    }],
    startDate: {
      type: Date,
      required: true,
      index: true
    },
    endDate: {
      type: Date,
      required: true,
      index: true
    },
    usageLimit: {
      type: Number,
      min: 1
    },
    usageCount: {
      type: Number,
      default: 0
    },
    usagePerUser: {
      type: Number,
      min: 1
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'expired', 'scheduled'],
      default: 'scheduled',
      index: true
    },
    conditions: {
      firstOrderOnly: Boolean,
      minItems: Number,
      buyQuantity: Number,
      getQuantity: Number
    },
    createdBy: {
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

// Indexes
PromotionSchema.index({ status: 1, startDate: 1, endDate: 1 });
PromotionSchema.index({ code: 'text', name: 'text' });

export default mongoose.model<IPromotion>('Promotion', PromotionSchema);
