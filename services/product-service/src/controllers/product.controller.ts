import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { createLogger } from '@mallify/shared';

const logger = createLogger('product-controller');

// Get all products with pagination and filtering
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      boutiqueId,
      categoryId,
      minPrice,
      maxPrice,
      featured,
      inStock,
      search,
      sort = '-createdAt',
    } = req.query;

    const query: any = {};

    // Filters
    if (status) query.status = status;
    if (boutiqueId) query.boutiqueId = boutiqueId;
    if (categoryId) query.categoryId = categoryId;
    if (featured !== undefined) query.featured = featured === 'true';
    if (inStock === 'true') query.quantity = { $gt: 0 };
    
    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search
    if (search) {
      query.$text = { $search: search as string };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
      },
    });
  } catch (error) {
    logger.error('Error retrieving products:', error);
    next(error);
  }
};

// Get single product by ID
export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Increment view count asynchronously
    (product as any).incrementViewCount().catch((err: any) => {
      logger.error('Failed to increment view count:', err);
    });

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: { product },
    });
  } catch (error) {
    logger.error('Error retrieving product:', error);
    next(error);
  }
};

// Get product by slug
export const getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Increment view count
    (product as any).incrementViewCount().catch((err: any) => {
      logger.error('Failed to increment view count:', err);
    });

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: { product },
    });
  } catch (error) {
    logger.error('Error retrieving product:', error);
    next(error);
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productData = req.body;

    // Generate slug from name if not provided
    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const product = new Product(productData);
    await product.save();

    logger.info('Product created:', { productId: product._id, sku: product.sku });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        success: false,
        message: `Product with this ${field} already exists`,
      });
      return;
    }
    logger.error('Error creating product:', error);
    next(error);
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating certain fields
    delete updates._id;
    delete updates.createdAt;
    delete updates.viewCount;
    delete updates.salesCount;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    logger.info('Product updated:', { productId: product._id });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        success: false,
        message: `Product with this ${field} already exists`,
      });
      return;
    }
    logger.error('Error updating product:', error);
    next(error);
  }
};

// Delete product (soft delete by archiving)
export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { status: 'archived' } },
      { new: true }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    logger.info('Product archived:', { productId: product._id });

    res.json({
      success: true,
      message: 'Product archived successfully',
      data: { product },
    });
  } catch (error) {
    logger.error('Error deleting product:', error);
    next(error);
  }
};

// Update stock quantity
export const updateProductStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number') {
      res.status(400).json({
        success: false,
        message: 'Quantity must be a number',
      });
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    await (product as any).updateStock(quantity);

    logger.info('Product stock updated:', { 
      productId: product._id, 
      newQuantity: product.quantity 
    });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: { product },
    });
  } catch (error) {
    logger.error('Error updating stock:', error);
    next(error);
  }
};

// Get featured products
export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const products = await Product.find({
      featured: true,
      status: 'active',
      quantity: { $gt: 0 },
    })
      .sort({ salesCount: -1, rating: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      message: 'Featured products retrieved successfully',
      data: { products },
    });
  } catch (error) {
    logger.error('Error retrieving featured products:', error);
    next(error);
  }
};

// Get products by boutique
export const getProductsByBoutique = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boutiqueId } = req.params;
    const { page = 1, limit = 20, status = 'active' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query: any = { boutiqueId };
    if (status) query.status = status;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: 'Boutique products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
      },
    });
  } catch (error) {
    logger.error('Error retrieving boutique products:', error);
    next(error);
  }
};
