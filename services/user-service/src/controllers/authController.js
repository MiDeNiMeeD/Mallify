const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { email, password, role, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create new user
    const user = new User({
      email,
      password,
      role: role || "client",
      profile,
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    // Publish user created event
    const messageBroker = require("../../shared/utils/messageBroker");
    await messageBroker.publish(messageBroker.exchanges.USERS, "user.created", {
      userId: user._id,
      email: user.email,
      role: user.role,
      timestamp: new Date(),
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ error: "Account is deactivated" });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Publish login event
    const messageBroker = require("../../shared/utils/messageBroker");
    await messageBroker.publish(
      messageBroker.exchanges.USERS,
      "user.logged_in",
      {
        userId: user._id,
        email: user.email,
        timestamp: new Date(),
      }
    );

    res.json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.email;
    delete updates.role;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Publish profile updated event
    const messageBroker = require("../../shared/utils/messageBroker");
    await messageBroker.publish(
      messageBroker.exchanges.USERS,
      "user.profile_updated",
      {
        userId: user._id,
        timestamp: new Date(),
      }
    );

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user by ID (for inter-service communication)
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get users by role (admin only)
 */
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find({ role })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments({ role });

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
}
