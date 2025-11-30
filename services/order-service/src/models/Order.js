const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    boutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      tax: {
        type: Number,
        default: 0,
      },
      shipping: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    shippingAddress: {
      fullName: String,
      phone: String,
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
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    payment: {
      method: String,
      transactionId: String,
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
    },
    delivery: {
      driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
      },
      trackingNumber: String,
      estimatedDelivery: Date,
      actualDelivery: Date,
    },
    notes: {
      customer: String,
      internal: String,
    },
    timeline: [
      {
        status: String,
        timestamp: Date,
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ boutique: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });

orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);

