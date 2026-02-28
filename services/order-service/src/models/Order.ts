import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  boutiqueId: mongoose.Types.ObjectId;
  
  items: Array<{
    productId: mongoose.Types.ObjectId;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
  };
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    boutiqueId: { type: Schema.Types.ObjectId, required: true, index: true },
    items: [{
      productId: Schema.Types.ObjectId,
      name: String,
      sku: String,
      quantity: Number,
      price: Number,
      total: Number,
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    shippingAddress: {
      name: String,
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      phone: String,
    },
    notes: String,
  },
  { timestamps: true }
);

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ boutiqueId: 1, status: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
