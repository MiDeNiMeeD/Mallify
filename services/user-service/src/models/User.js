const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: function () {
        return !this.socialProvider; // Password required if not social login
      },
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: [
        "admin",
        "delivery_manager",
        "boutique_manager",
        "boutique_owner",
        "client",
        "driver",
      ],
      default: "client",
    },
    profile: {
      firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
      },
      lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      avatar: {
        type: String,
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
    },
    socialProvider: {
      provider: {
        type: String,
        enum: ["google", "facebook", null],
      },
      providerId: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
      language: {
        type: String,
        default: "en",
      },
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({
  "socialProvider.provider": 1,
  "socialProvider.providerId": 1,
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual("profile.fullName").get(function () {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

const User = mongoose.model("User", userSchema);

module.exports = User;
