const mongoose = require("mongoose");

const boutiqueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Boutique name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    logo: String,
    banner: String,
    contact: {
      email: String,
      phone: String,
      website: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ["basic", "premium", "enterprise"],
        default: "basic",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "suspended", "cancelled"],
        default: "inactive",
      },
      startDate: Date,
      endDate: Date,
      paymentMethod: String,
      autoRenew: {
        type: Boolean,
        default: true,
      },
    },
    settings: {
      theme: {
        primaryColor: String,
        secondaryColor: String,
      },
      businessHours: {
        monday: { open: String, close: String, isOpen: Boolean },
        tuesday: { open: String, close: String, isOpen: Boolean },
        wednesday: { open: String, close: String, isOpen: Boolean },
        thursday: { open: String, close: String, isOpen: Boolean },
        friday: { open: String, close: String, isOpen: Boolean },
        saturday: { open: String, close: String, isOpen: Boolean },
        sunday: { open: String, close: String, isOpen: Boolean },
      },
      acceptedPaymentMethods: [String],
      shippingOptions: [String],
    },
    stats: {
      totalProducts: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      reviewCount: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

boutiqueSchema.index({ owner: 1 });
boutiqueSchema.index({ name: "text", description: "text" });
boutiqueSchema.index({ "subscription.status": 1 });

module.exports = mongoose.model("Boutique", boutiqueSchema);

