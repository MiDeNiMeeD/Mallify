import { Router } from 'express';
import { body } from 'express-validator';
import {
  getDeliveries,
  getDeliveryById,
  getDeliveryByTracking,
  createDelivery,
  updateDeliveryStatus,
  updateLocation,
  assignDriver
} from '../controllers/delivery.controller';

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

// Get all deliveries (with filters and pagination)
router.get('/', getDeliveries);

// Get delivery by ID
router.get('/:id', getDeliveryById);

// Track delivery by tracking number
router.get('/track/:trackingNumber', getDeliveryByTracking);

// Create delivery
router.post(
  '/',
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('userId').notEmpty().withMessage('User ID is required'),
    body('deliveryMethod').isIn(['standard', 'express', 'same_day', 'pickup']).withMessage('Valid delivery method is required'),
    body('recipientName').notEmpty().withMessage('Recipient name is required'),
    body('recipientPhone').notEmpty().withMessage('Recipient phone is required'),
    validateRequest
  ],
  createDelivery
);

// Update delivery status
router.patch(
  '/:id/status',
  [
    body('status').isIn(['pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned']).withMessage('Valid status is required'),
    validateRequest
  ],
  updateDeliveryStatus
);

// Update current location
router.patch(
  '/:id/location',
  [
    body('lat').isFloat().withMessage('Valid latitude is required'),
    body('lng').isFloat().withMessage('Valid longitude is required'),
    validateRequest
  ],
  updateLocation
);

// Assign driver
router.patch(
  '/:id/assign',
  [
    body('driverId').notEmpty().withMessage('Driver ID is required'),
    validateRequest
  ],
  assignDriver
);

export default router;
