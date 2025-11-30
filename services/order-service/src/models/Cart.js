const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        price: Number,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totals: {
      subtotal: {
        type: Number,
        default: 0,
      },
      itemCount: {
        type: Number,
        default: 0,
      },
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ customer: 1 });

module.exports = mongoose.model("Cart", cartSchema);

