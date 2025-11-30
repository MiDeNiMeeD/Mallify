const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate, authorize } = require("../../shared/middleware/auth");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);
router.post("/change-password", authenticate, authController.changePassword);

// Internal service routes
router.get("/users/:id", authController.getUserById);
router.get(
  "/users/role/:role",
  authenticate,
  authorize("admin"),
  authController.getUsersByRole
);

module.exports = router;
