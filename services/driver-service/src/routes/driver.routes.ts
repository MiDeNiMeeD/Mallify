import { Router } from 'express';
import { body } from 'express-validator';
import {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  updateAvailability,
  updateLocation,
  getAvailableDrivers
} from '../controllers/driver.controller';

const router = Router();

// Validation middleware
const validateRequest = (req: any, res: any, next: any) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all drivers (with filters and pagination)
router.get('/', getDrivers);

// Get available drivers
router.get('/available', getAvailableDrivers);

// Get driver by ID
router.get('/:id', getDriverById);

// Create driver
router.post(
  '/',
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('licenseNumber').notEmpty().withMessage('License number is required'),
    body('licenseExpiry').isISO8601().withMessage('Valid license expiry date is required'),
    validateRequest
  ],
  createDriver
);

// Update driver
router.patch('/:id', updateDriver);

// Update availability
router.patch(
  '/:id/availability',
  [
    body('availability').isIn(['available', 'busy', 'offline']).withMessage('Valid availability status is required'),
    validateRequest
  ],
  updateAvailability
);

// Update location
router.patch(
  '/:id/location',
  [
    body('lat').isFloat().withMessage('Valid latitude is required'),
    body('lng').isFloat().withMessage('Valid longitude is required'),
    validateRequest
  ],
  updateLocation
);

export default router;
