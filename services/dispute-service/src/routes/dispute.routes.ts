import { Router } from 'express';
import { body } from 'express-validator';
import {
  getDisputes,
  getDisputeById,
  createDispute,
  updateDisputeStatus,
  addMessage,
  resolveDispute
} from '../controllers/dispute.controller';

const router = Router();

const validateRequest = (req: any, res: any, next: any) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/', getDisputes);
router.get('/:id', getDisputeById);

router.post(
  '/',
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('userId').notEmpty().withMessage('User ID is required'),
    body('boutiqueId').notEmpty().withMessage('Boutique ID is required'),
    body('type').isIn(['order_issue', 'product_quality', 'delivery_issue', 'refund_request', 'other']).withMessage('Valid dispute type is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('description').notEmpty().withMessage('Description is required'),
    validateRequest
  ],
  createDispute
);

router.patch(
  '/:id/status',
  [
    body('status').isIn(['open', 'investigating', 'resolved', 'closed', 'escalated']).withMessage('Valid status is required'),
    validateRequest
  ],
  updateDisputeStatus
);

router.post('/:id/messages', addMessage);

router.post(
  '/:id/resolve',
  [
    body('action').isIn(['refund', 'replacement', 'compensation', 'no_action']).withMessage('Valid action is required'),
    body('description').notEmpty().withMessage('Resolution description is required'),
    validateRequest
  ],
  resolveDispute
);

export default router;
