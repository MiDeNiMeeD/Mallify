import { Router } from 'express';
import { body } from 'express-validator';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotificationStatus,
  markAsRead,
  getUserNotifications,
  sendOTP,
  sendApprovalEmail,
  sendRejectionEmail
} from '../controllers/notification.controller';

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

// Get all notifications (with filters and pagination)
router.get('/', getNotifications);

// Get notification by ID
router.get('/:id', getNotificationById);

// Get user notifications
router.get('/user/:userId', getUserNotifications);

// Create notification
router.post(
  '/',
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('type').isIn(['email', 'sms', 'push', 'in_app']).withMessage('Valid notification type is required'),
    body('channel').notEmpty().withMessage('Channel is required'),
    body('message').notEmpty().withMessage('Message is required'),
    validateRequest
  ],
  createNotification
);

// Update notification status
router.patch(
  '/:id/status',
  [
    body('status').isIn(['pending', 'sent', 'failed', 'delivered', 'read']).withMessage('Valid status is required'),
    validateRequest
  ],
  updateNotificationStatus
);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Send OTP email
router.post(
  '/send-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').notEmpty().withMessage('OTP is required'),
    validateRequest
  ],
  sendOTP
);

// Send approval email
router.post(
  '/send-approval',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('boutiqueName').notEmpty().withMessage('Boutique name is required'),
    validateRequest
  ],
  sendApprovalEmail
);

// Send rejection email
router.post(
  '/send-rejection',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('boutiqueName').notEmpty().withMessage('Boutique name is required'),
    body('reason').notEmpty().withMessage('Rejection reason is required'),
    validateRequest
  ],
  sendRejectionEmail
);

export default router;
