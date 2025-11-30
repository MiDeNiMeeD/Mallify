const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    boutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      regular: {
        type: Number,
        required: true,
        min: 0,
      },
      sale: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    inventory: {
      quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
      sku: {
        type: String,
        unique: true,
        sparse: true,
      },
      trackInventory: {
        type: Boolean,
        default: true,
      },
      lowStockThreshold: {
        type: Number,
        default: 5,
      },
    },
    images: [
      {
        url: String,
        alt: String,
        isPrimary: Boolean,
      },
    ],
    specifications: [
      {
        name: String,
        value: String,
      },
    ],
    variants: [
      {
        name: String,
        options: [String],
        priceModifier: Number,
      },
    ],
    shipping: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      freeShipping: Boolean,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    stats: {
      views: { type: Number, default: 0 },
      sales: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      reviewCount: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ boutique: 1, isActive: 1 });
productSchema.index({ category: 1 });
productSchema.index({ "price.regular": 1 });

module.exports = mongoose.model("Product", productSchema);

