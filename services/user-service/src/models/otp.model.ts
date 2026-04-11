import mongoose, { Schema, Document } from 'mongoose';

export interface IOTPCode extends Document {
  email: string;
  code: string;
  type: 'verification' | 'password_reset';
  pendingRegistration?: {
    name: string;
    password: string;
    phone?: string;
    role: string;
  };
  expiresAt: Date;
  createdAt: Date;
}

const OTPCodeSchema = new Schema<IOTPCode>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['verification', 'password_reset'],
      required: true,
    },
    pendingRegistration: {
      name: { type: String },
      password: { type: String },
      phone: { type: String },
      role: { type: String },
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - automatically delete expired documents
    },
  },
  { timestamps: true }
);

// Index for faster lookups
OTPCodeSchema.index({ email: 1, type: 1 });

export const OTPCode = mongoose.model<IOTPCode>('OTPCode', OTPCodeSchema);
