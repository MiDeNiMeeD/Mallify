import { Router } from 'express';
import { body } from 'express-validator';
import {
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage
} from '../controllers/message.controller';

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

// Get messages
router.get('/', getMessages);

// Send message
router.post(
  '/',
  [
    body('conversationId').notEmpty().withMessage('Conversation ID is required'),
    body('senderId').notEmpty().withMessage('Sender ID is required'),
    body('receiverId').notEmpty().withMessage('Receiver ID is required'),
    body('content').notEmpty().withMessage('Message content is required'),
    validateRequest
  ],
  sendMessage
);

// Mark message as read
router.patch('/:id/read', markAsRead);

// Delete message
router.delete('/:id', deleteMessage);

export default router;
