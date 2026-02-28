import { Router } from 'express';
import { body, param } from 'express-validator';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import * as productController from '../controllers/product.controller';

const router = Router();

// Validation middleware
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

// Validation schemas
const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('boutiqueId').notEmpty().withMessage('Boutique ID is required'),
  validateRequest,
];

const updateProductValidation = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be non-negative'),
  validateRequest,
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  validateRequest,
];

const stockUpdateValidation = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  validateRequest,
];

// Routes

// Get all products (with filters and pagination)
router.get('/', productController.getProducts);

// Get featured products
router.get('/featured', productController.getFeaturedProducts);

// Get products by boutique
router.get('/boutique/:boutiqueId', productController.getProductsByBoutique);

// Get product by slug
router.get('/slug/:slug', productController.getProductBySlug);

// Get product by ID
router.get('/:id', idValidation, productController.getProductById);

// Create product
router.post('/', createProductValidation, productController.createProduct);

// Update product
router.put('/:id', updateProductValidation, productController.updateProduct);

// Update stock
router.patch('/:id/stock', stockUpdateValidation, productController.updateProductStock);

// Delete product (archive)
router.delete('/:id', idValidation, productController.deleteProduct);

export default router;
