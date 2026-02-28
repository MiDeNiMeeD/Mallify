import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '@mallify/shared';

// Address subdocument schema
const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

// Base User interface
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  addresses: typeof AddressSchema[];
  isEmailVerified: boolean;
  isActive: boolean;
  googleId?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Base User Schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    addresses: [AddressSchema],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    profileImage: {
      type: String,
    },
  },
  {
    timestamps: true,
    discriminatorKey: 'role',
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ googleId: 1 }, { sparse: true });

// Create the base User model
export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

// Client-specific interface
export interface IClient extends IUser {
  wishlist: mongoose.Types.ObjectId[];
  orderHistory: mongoose.Types.ObjectId[];
  loyaltyPoints: number;
}

// Client Schema
const ClientSchema = new Schema<IClient>({
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  orderHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  loyaltyPoints: { type: Number, default: 0 },
});

export const Client = User.discriminator<IClient>('client', ClientSchema);

// BoutiqueOwner-specific interface
export interface IBoutiqueOwner extends IUser {
  boutiqueList: mongoose.Types.ObjectId[];
  subscriptionStatus: mongoose.Types.ObjectId;
}

// BoutiqueOwner Schema
const BoutiqueOwnerSchema = new Schema<IBoutiqueOwner>({
  boutiqueList: [{ type: Schema.Types.ObjectId, ref: 'Boutique' }],
  subscriptionStatus: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
});

export const BoutiqueOwner = User.discriminator<IBoutiqueOwner>(
  'boutique_owner',
  BoutiqueOwnerSchema
);

// DeliveryPerson-specific interface
export interface IDeliveryPerson extends IUser {
  availability: boolean;
  assignedDeliveries: mongoose.Types.ObjectId[];
  earnings: number;
  applicationStatus: 'pending' | 'approved' | 'rejected';
  documents: {
    driverLicense?: string;
    vehicleRegistration?: string;
    insurance?: string;
  };
}

// DeliveryPerson Schema
const DeliveryPersonSchema = new Schema<IDeliveryPerson>({
  availability: { type: Boolean, default: false },
  assignedDeliveries: [{ type: Schema.Types.ObjectId, ref: 'Delivery' }],
  earnings: { type: Number, default: 0 },
  applicationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  documents: {
    driverLicense: String,
    vehicleRegistration: String,
    insurance: String,
  },
});

export const DeliveryPerson = User.discriminator<IDeliveryPerson>(
  'delivery_person',
  DeliveryPersonSchema
);

// Admin-specific interface
export interface IAdmin extends IUser {
  permissions: string[];
  activityLogs: string[];
}

// Admin Schema
const AdminSchema = new Schema<IAdmin>({
  permissions: [{ type: String }],
  activityLogs: [{ type: String }],
});

export const Admin = User.discriminator<IAdmin>('admin', AdminSchema);

// DeliveryManager-specific interface
export interface IDeliveryManager extends IUser {
  managedDeliveries: mongoose.Types.ObjectId[];
  managedPersonnel: mongoose.Types.ObjectId[];
}

// DeliveryManager Schema
const DeliveryManagerSchema = new Schema<IDeliveryManager>({
  managedDeliveries: [{ type: Schema.Types.ObjectId, ref: 'Delivery' }],
  managedPersonnel: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export const DeliveryManager = User.discriminator<IDeliveryManager>(
  'delivery_manager',
  DeliveryManagerSchema
);

// AllBoutiquesManager-specific interface
export interface IAllBoutiquesManager extends IUser {
  managedBoutiques: mongoose.Types.ObjectId[];
  complianceReports: mongoose.Types.ObjectId[];
}

// AllBoutiquesManager Schema
const AllBoutiquesManagerSchema = new Schema<IAllBoutiquesManager>({
  managedBoutiques: [{ type: Schema.Types.ObjectId, ref: 'Boutique' }],
  complianceReports: [{ type: Schema.Types.ObjectId, ref: 'Report' }],
});

export const AllBoutiquesManager = User.discriminator<IAllBoutiquesManager>(
  'boutiques_manager',
  AllBoutiquesManagerSchema
);
