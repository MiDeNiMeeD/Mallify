import { Router } from 'express';
import { body } from 'express-validator';
import {
  getPromotions,
  getPromotionById,
  getPromotionByCode,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromotion,
  getActivePromotions
} from '../controllers/promotion.controller';

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

// Get all promotions (with filters and pagination)
router.get('/', getPromotions);

// Get active promotions
router.get('/active', getActivePromotions);

// Get promotion by ID
router.get('/:id', getPromotionById);

// Get promotion by code
router.get('/code/:code', getPromotionByCode);

// Validate promotion
router.post(
  '/validate',
  [
    body('code').notEmpty().withMessage('Promotion code is required'),
    body('orderTotal').isFloat({ min: 0 }).withMessage('Valid order total is required'),
    validateRequest
  ],
  validatePromotion
);

// Create promotion
router.post(
  '/',
  [
    body('code').notEmpty().withMessage('Promotion code is required'),
    body('name').notEmpty().withMessage('Promotion name is required'),
    body('type').isIn(['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y']).withMessage('Valid promotion type is required'),
    body('discountValue').isFloat({ min: 0 }).withMessage('Valid discount value is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    validateRequest
  ],
  createPromotion
);

// Update promotion
router.patch('/:id', updatePromotion);

// Delete promotion (deactivate)
router.delete('/:id', deletePromotion);

export default router;
