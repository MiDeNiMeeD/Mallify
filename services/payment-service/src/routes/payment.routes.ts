import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  processRefund,
  getPaymentsByOrder
} from '../controllers/payment.controller';

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

// Get all payments (with filters and pagination)
router.get('/', getPayments);

// Get payment by ID
router.get('/:id', getPaymentById);

// Get payments by order ID
router.get('/order/:orderId', getPaymentsByOrder);

// Create payment
router.post(
  '/',
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('userId').notEmpty().withMessage('User ID is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
    body('paymentMethod').isIn(['card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'wallet']).withMessage('Valid payment method is required'),
    validateRequest
  ],
  createPayment
);

// Update payment status
router.patch(
  '/:id/status',
  [
    body('status').isIn(['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']).withMessage('Valid status is required'),
    validateRequest
  ],
  updatePaymentStatus
);

// Process refund
router.post(
  '/:id/refund',
  [
    body('amount').isFloat({ min: 0 }).withMessage('Valid refund amount is required'),
    body('reason').notEmpty().withMessage('Refund reason is required'),
    validateRequest
  ],
  processRefund
);

export default router;
