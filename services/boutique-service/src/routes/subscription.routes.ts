import { Router } from 'express';
import { body, param } from 'express-validator';
import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import {
  activateSubscription,
  cancelSubscription,
  createCheckoutSession,
  createPlan,
  deletePlan,
  getPlans,
  getSubscription,
  getSubscriptionAccess,
  stripeWebhook,
  updatePlan,
} from '../controllers/subscription.controller';

const router = Router();

const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
    return;
  }
  next();
};

const planValidation = [
  body('name').trim().notEmpty().withMessage('Plan name is required'),
  body('code').trim().notEmpty().withMessage('Plan code is required'),
  body('monthlyPrice').isFloat({ min: 0 }).withMessage('monthlyPrice must be a positive number'),
  body('yearlyPrice').isFloat({ min: 0 }).withMessage('yearlyPrice must be a positive number'),
  validateRequest,
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid plan ID'),
  validateRequest,
];

const boutiqueValidation = [
  param('boutiqueId').isMongoId().withMessage('Invalid boutique ID'),
  validateRequest,
];

router.get('/subscription-plans', getPlans);
router.post('/subscription-plans', planValidation, createPlan);
router.put('/subscription-plans/:id', idValidation, updatePlan);
router.delete('/subscription-plans/:id', idValidation, deletePlan);

router.post('/subscription/webhook', stripeWebhook);

router.get('/:boutiqueId/subscription', boutiqueValidation, getSubscription);
router.get('/:boutiqueId/subscription/access', boutiqueValidation, getSubscriptionAccess);
router.post(
  '/:boutiqueId/subscription/checkout-session',
  [
    ...boutiqueValidation,
    body('planId').isMongoId().withMessage('Valid planId is required'),
    body('billingInterval').optional().isIn(['monthly', 'yearly']).withMessage('billingInterval must be monthly or yearly'),
    validateRequest,
  ],
  createCheckoutSession
);
router.post(
  '/:boutiqueId/subscription/activate',
  [
    ...boutiqueValidation,
    body('planId').isMongoId().withMessage('Valid planId is required'),
    body('billingInterval').optional().isIn(['monthly', 'yearly']).withMessage('billingInterval must be monthly or yearly'),
    validateRequest,
  ],
  activateSubscription
);
router.patch('/:boutiqueId/subscription/cancel', boutiqueValidation, cancelSubscription);
export default router;
