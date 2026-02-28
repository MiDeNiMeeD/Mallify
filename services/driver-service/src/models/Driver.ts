import mongoose, { Schema, Document } from 'mongoose';

export interface IDriver extends Document {
  userId: mongoose.Types.ObjectId;
  driverNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  licenseNumber: string;
  licenseExpiry: Date;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    plateNumber: string;
    color: string;
    type: 'car' | 'motorcycle' | 'van' | 'truck';
  };
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  availability: 'available' | 'busy' | 'offline';
  currentLocation?: {
    coordinates: {
      lat: number;
      lng: number;
    };
    timestamp: Date;
  };
  rating: number;
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  earnings: {
    total: number;
    pending: number;
    paid: number;
  };
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
  };
  documents: {
    licenseUrl?: string;
    vehicleRegistrationUrl?: string;
    insuranceUrl?: string;
    photoUrl?: string;
  };
  workingHours?: {
    start: string;
    end: string;
  };
  verificationDate?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    driverNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: Date
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true
    },
    licenseExpiry: {
      type: Date,
      required: true
    },
    vehicleInfo: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: Number, required: true },
      plateNumber: { type: String, required: true },
      color: { type: String, required: true },
      type: {
        type: String,
        required: true,
        enum: ['car', 'motorcycle', 'van', 'truck']
      }
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'suspended', 'pending_verification'],
      default: 'pending_verification',
      index: true
    },
    availability: {
      type: String,
      required: true,
      enum: ['available', 'busy', 'offline'],
      default: 'offline',
      index: true
    },
    currentLocation: {
      coordinates: {
        lat: Number,
        lng: Number
      },
      timestamp: Date
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    totalDeliveries: {
      type: Number,
      default: 0
    },
    completedDeliveries: {
      type: Number,
      default: 0
    },
    cancelledDeliveries: {
      type: Number,
      default: 0
    },
    earnings: {
      total: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      paid: { type: Number, default: 0 }
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      routingNumber: String
    },
    documents: {
      licenseUrl: String,
      vehicleRegistrationUrl: String,
      insuranceUrl: String,
      photoUrl: String
    },
    workingHours: {
      start: String,
      end: String
    },
    verificationDate: {
      type: Date
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
DriverSchema.index({ status: 1, availability: 1 });
DriverSchema.index({ rating: -1 });

export default mongoose.model<IDriver>('Driver', DriverSchema);
