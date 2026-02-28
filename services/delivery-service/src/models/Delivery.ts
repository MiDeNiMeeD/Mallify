import mongoose, { Schema, Document } from 'mongoose';

export interface IDelivery extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  trackingNumber: string;
  carrier?: string;
  deliveryMethod: 'standard' | 'express' | 'same_day' | 'pickup';
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  deliveryAttempts: number;
  currentLocation?: {
    coordinates: {
      lat: number;
      lng: number;
    };
    timestamp: Date;
    description?: string;
  };
  trackingHistory: Array<{
    status: string;
    location?: string;
    description: string;
    timestamp: Date;
  }>;
  deliveryNotes?: string;
  recipientName: string;
  recipientPhone: string;
  signatureRequired: boolean;
  signatureUrl?: string;
  deliveryProof?: string;
  failureReason?: string;
  returnReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema: Schema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      index: true
    },
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    carrier: {
      type: String
    },
    deliveryMethod: {
      type: String,
      required: true,
      enum: ['standard', 'express', 'same_day', 'pickup'],
      default: 'standard'
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'],
      default: 'pending',
      index: true
    },
    pickupAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    estimatedDeliveryDate: {
      type: Date
    },
    actualDeliveryDate: {
      type: Date
    },
    deliveryAttempts: {
      type: Number,
      default: 0
    },
    currentLocation: {
      coordinates: {
        lat: Number,
        lng: Number
      },
      timestamp: Date,
      description: String
    },
    trackingHistory: [{
      status: { type: String, required: true },
      location: String,
      description: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }],
    deliveryNotes: {
      type: String
    },
    recipientName: {
      type: String,
      required: true
    },
    recipientPhone: {
      type: String,
      required: true
    },
    signatureRequired: {
      type: Boolean,
      default: false
    },
    signatureUrl: {
      type: String
    },
    deliveryProof: {
      type: String
    },
    failureReason: {
      type: String
    },
    returnReason: {
      type: String
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
DeliverySchema.index({ trackingNumber: 1 });
DeliverySchema.index({ status: 1, createdAt: -1 });
DeliverySchema.index({ driverId: 1, status: 1 });

export default mongoose.model<IDelivery>('Delivery', DeliverySchema);
