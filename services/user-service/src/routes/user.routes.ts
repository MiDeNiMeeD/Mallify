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
 * @route   GET /api/users
 * @desc    Get all users (admin/manager view)
 * @access  Private (Admin, Managers)
 */
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DELIVERY_MANAGER, UserRole.BOUTIQUES_MANAGER),
  userController.getUsers
);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @route   GET /api/users/buyers/:userId/basic
 * @desc    Get buyer basic profile (name/email/phone) for order views
 * @access  Private (Admin, Managers, Boutique Owner)
 */
router.get(
  '/buyers/:userId/basic',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DELIVERY_MANAGER, UserRole.BOUTIQUES_MANAGER, UserRole.BOUTIQUE_OWNER),
  userController.getBuyerBasicById
);

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
 * @route   PUT /api/users/:userId
 * @desc    Update user (admin/manager)
 * @access  Private (Admin, Managers)
 */
router.put(
  '/:userId',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DELIVERY_MANAGER, UserRole.BOUTIQUES_MANAGER),
  userController.updateUserById
);

/**
 * @route   DELETE /api/users/:userId
 * @desc    Delete user (admin/manager)
 * @access  Private (Admin, Managers)
 */
router.delete(
  '/:userId',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DELIVERY_MANAGER, UserRole.BOUTIQUES_MANAGER),
  userController.deleteUserById
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

/**
 * @route   DELETE /api/users/email/:email
 * @desc    Delete user by email (for cleanup after application rejection)
 * @access  Service to Service (no auth required for internal services)
 */
router.delete('/email/:email', userController.deleteUserByEmail);

/**
 * @route   GET /api/users/by-email/:email
 * @desc    Get user by email (for service-to-service calls)
 * @access  Service to Service (no auth required for internal services)
 */
router.get('/by-email/:email', userController.getUserByEmail);

/**
 * @route   PUT /api/users/:userId/boutiques
 * @desc    Add boutique to user's boutiqueList (for service-to-service calls)
 * @access  Service to Service (no auth required for internal services)
 */
router.put('/:userId/boutiques', userController.addBoutique);

export default router;
