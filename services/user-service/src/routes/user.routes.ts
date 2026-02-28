import { Router } from 'express';
import { authenticate, authorize, validate } from '@mallify/shared';
import { UserRole } from '@mallify/shared';
import userController from '../controllers/user.controller';
import {
  updateProfileSchema,
  addAddressSchema,
  updateAddressSchema,
  updateApplicationStatusSchema,
} from '../validators/user.validator';

const router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID (for admins/managers)
 * @access  Private (Admin, Managers)
 */
router.get(
  '/:userId',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DELIVERY_MANAGER, UserRole.BOUTIQUES_MANAGER),
  userController.getUserById
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);

/**
 * @route   POST /api/users/addresses
 * @desc    Add new address
 * @access  Private
 */
router.post('/addresses', authenticate, validate(addAddressSchema), userController.addAddress);

/**
 * @route   PUT /api/users/addresses/:addressId
 * @desc    Update address
 * @access  Private
 */
router.put('/addresses/:addressId', authenticate, validate(updateAddressSchema), userController.updateAddress);

/**
 * @route   DELETE /api/users/addresses/:addressId
 * @desc    Delete address
 * @access  Private
 */
router.delete('/addresses/:addressId', authenticate, userController.deleteAddress);

/**
 * @route   POST /api/users/deactivate
 * @desc    Deactivate user account
 * @access  Private
 */
router.post('/deactivate', authenticate, userController.deactivateAccount);

/**
 * @route   PUT /api/users/:userId/application-status
 * @desc    Update delivery person application status
 * @access  Private (Admin, Delivery Manager)
 */
router.put(
  '/:userId/application-status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DELIVERY_MANAGER),
  validate(updateApplicationStatusSchema),
  userController.updateApplicationStatus
);

export default router;
