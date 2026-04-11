import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  orderType: 'parent' | 'store';
  parentOrderId?: mongoose.Types.ObjectId;
  storeOrderIds?: mongoose.Types.ObjectId[];
  userId: mongoose.Types.ObjectId | string;
  boutiqueId?: mongoose.Types.ObjectId | string;
  storeId?: string;
  
  items: Array<{
    productId: mongoose.Types.ObjectId;
    name: string;
    sku: string;
    boutiqueId?: string;
    storeId?: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
    color?: string;
    size?: string;
  }>;

  storeOrders?: Array<{
    _id?: mongoose.Types.ObjectId;
    storeId: string;
    boutiqueId?: string;
    status:
      | 'pending'
      | 'confirmed'
      | 'rejected'
      | 'cancelled'
      | 'processing'
      | 'shipped'
      | 'delivered';
    items: Array<{
      productId: mongoose.Types.ObjectId;
      name: string;
      sku: string;
      boutiqueId?: string;
      storeId?: string;
      quantity: number;
      price: number;
      total: number;
      image?: string;
      color?: string;
      size?: string;
    }>;
    subtotal: number;
    tax: number;
    shippingCost: number;
    discount: number;
    total: number;
    originalTotal?: number;
    payableTotal?: number;
  }>;
  
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  
  originalTotal?: number;
  payableTotal?: number;
  totalStores?: number;
  confirmedStores?: number;
  rejectedStores?: number;
  pendingStores?: number;
  confirmationPercent?: number;
  status:
    | 'pending'
    | 'partially_confirmed'
    | 'confirmed'
    | 'partially_rejected'
    | 'rejected'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';
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
    orderType: { type: String, enum: ['parent', 'store'], default: 'store', index: true },
    parentOrderId: { type: Schema.Types.ObjectId, index: true },
    storeOrderIds: [{ type: Schema.Types.ObjectId }],
    userId: { type: String, required: true, index: true },
    boutiqueId: { type: String, index: true },
    storeId: { type: String, index: true },
    items: [{
      productId: String,
      name: String,
      sku: String,
      boutiqueId: String,
      storeId: String,
      quantity: Number,
      price: Number,
      total: Number,
      image: String,
      color: String,
      size: String,
    }],
    storeOrders: [
      {
        storeId: { type: String, required: true, index: true },
        boutiqueId: { type: String, index: true },
        status: {
          type: String,
          enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'processing', 'shipped', 'delivered'],
          default: 'pending',
        },
        items: [
          {
            productId: String,
            name: String,
            sku: String,
            boutiqueId: String,
            storeId: String,
            quantity: Number,
            price: Number,
            total: Number,
            image: String,
            color: String,
            size: String,
          },
        ],
        subtotal: { type: Number, required: true, default: 0 },
        tax: { type: Number, default: 0 },
        shippingCost: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true, default: 0 },
        originalTotal: { type: Number },
        payableTotal: { type: Number },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    originalTotal: { type: Number },
    payableTotal: { type: Number },
    totalStores: { type: Number, default: 0 },
    confirmedStores: { type: Number, default: 0 },
    rejectedStores: { type: Number, default: 0 },
    pendingStores: { type: Number, default: 0 },
    confirmationPercent: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        'pending',
        'partially_confirmed',
        'confirmed',
        'partially_rejected',
        'rejected',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
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
OrderSchema.index({ storeId: 1, status: 1 });
OrderSchema.index({ parentOrderId: 1 });
OrderSchema.index({ orderType: 1, createdAt: -1 });
OrderSchema.index({ 'storeOrders.storeId': 1 });
OrderSchema.index({ 'storeOrders.status': 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
