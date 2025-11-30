const jwt = require("jsonwebtoken");

/**
 * Authentication middleware to verify JWT tokens
 */
const authenticate = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
};

/**
 * Optional authentication - sets user if token is valid but doesn't fail if not
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (error) {
    // Token is invalid or expired, but we don't fail the request
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};
