import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  quantity: number;
  lowStockThreshold: number;
  
  // Relationships
  boutiqueId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  
  // Media
  images: string[];
  thumbnail?: string;
  
  // Product details
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  
  // Variants
  hasVariants: boolean;
  variants?: Array<{
    name: string;
    sku: string;
    price: number;
    quantity: number;
    attributes: { [key: string]: string };
  }>;
  
  // Attributes
  attributes: { [key: string]: string | number | boolean };
  tags: string[];
  
  // Status
  status: 'draft' | 'active' | 'archived';
  featured: boolean;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
  
  // Stats
  viewCount: number;
  salesCount: number;
  rating: number;
  reviewCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    cost: {
      type: Number,
      min: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    boutiqueId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 10,
        message: 'Maximum 10 images allowed',
      },
    },
    thumbnail: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm',
      },
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variants: [
      {
        name: String,
        sku: String,
        price: Number,
        quantity: Number,
        attributes: Schema.Types.Mixed,
      },
    ],
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    metaTitle: String,
    metaDescription: String,
    slug: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
ProductSchema.index({ boutiqueId: 1, status: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ 'variants.sku': 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ featured: 1, status: 1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtuals
ProductSchema.virtual('inStock').get(function () {
  return this.quantity > 0;
});

ProductSchema.virtual('lowStock').get(function () {
  return this.quantity > 0 && this.quantity <= this.lowStockThreshold;
});

ProductSchema.virtual('discount').get(function () {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Methods
ProductSchema.methods.incrementViewCount = async function () {
  this.viewCount += 1;
  return this.save();
};

ProductSchema.methods.updateStock = async function (quantity: number) {
  this.quantity = Math.max(0, this.quantity + quantity);
  return this.save();
};

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
