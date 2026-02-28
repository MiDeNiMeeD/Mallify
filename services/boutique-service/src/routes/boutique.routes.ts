import { Router } from 'express';
import { body, param } from 'express-validator';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import * as boutiqueController from '../controllers/boutique.controller';

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

const createBoutiqueValidation = [
  body('name').trim().notEmpty().withMessage('Boutique name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('ownerId').notEmpty().withMessage('Owner ID is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
  validateRequest,
];

const updateBoutiqueValidation = [
  param('id').isMongoId().withMessage('Invalid boutique ID'),
  validateRequest,
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid boutique ID'),
  validateRequest,
];

router.get('/', boutiqueController.getBoutiques);
router.get('/featured', boutiqueController.getFeaturedBoutiques);
router.get('/slug/:slug', boutiqueController.getBoutiqueBySlug);
router.get('/:id', idValidation, boutiqueController.getBoutiqueById);
router.post('/', createBoutiqueValidation, boutiqueController.createBoutique);
router.put('/:id', updateBoutiqueValidation, boutiqueController.updateBoutique);
router.delete('/:id', idValidation, boutiqueController.deleteBoutique);

export default router;
