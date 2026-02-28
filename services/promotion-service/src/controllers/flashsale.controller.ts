import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Flash Sale Management Controller
 * Manages time-limited flash sales and product launches for boutiques
 */

// Flash Sale model
const FlashSale = mongoose.model('FlashSale', new mongoose.Schema({
  boutiqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['flash_sale', 'product_launch', 'clearance', 'daily_deal'],
    default: 'flash_sale'
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timezone: String
  },
  products: [{
    productId: mongoose.Schema.Types.ObjectId,
    originalPrice: Number,
    salePrice: Number,
    discount: Number, // percentage
    stock: Number,
    sold: { type: Number, default: 0 }
  }],
  rules: {
    minPurchase: Number,
    maxQuantityPerCustomer: Number,
    eligibleTiers: [String], // loyalty tiers
    firstTimeBuyersOnly: Boolean
  },
  visibility: {
    isPublic: { type: Boolean, default: true },
    notifyCustomers: { type: Boolean, default: true },
    featuredOnHomepage: { type: Boolean, default: false }
  },
  performance: {
    views: { type: Number, default: 0 },
    participants: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

/**
 * Get flash sales
 */
export const getFlashSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boutiqueId, status, type, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (boutiqueId) query.boutiqueId = boutiqueId;
    if (status) query.status = status;
    if (type) query.type = type;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const sales = await FlashSale.find(query)
      .sort({ 'schedule.startDate': -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('boutiqueId', 'name logo')
      .populate('products.productId', 'name images');
    
    const total = await FlashSale.countDocuments(query);
    
    res.status(200).json({
      sales,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flash sales' });
    return;
  }
};

/**
 * Get active flash sales
 */
export const getActiveSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    
    const sales = await FlashSale.find({
      status: 'active',
      'schedule.startDate': { $lte: now },
      'schedule.endDate': { $gte: now }
    })
      .populate('boutiqueId', 'name logo')
      .populate('products.productId', 'name images description');
    
    // Add time remaining
    const salesWithTimeRemaining = sales.map(sale => {
      const timeRemaining = sale.schedule.endDate.getTime() - now.getTime();
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      
      return {
        ...sale.toObject(),
        timeRemaining: {
          hours: hoursRemaining,
          minutes: minutesRemaining,
          milliseconds: timeRemaining
        }
      };
    });
    
    res.status(200).json({ sales: salesWithTimeRemaining });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active sales' });
    return;
  }
};

/**
 * Create flash sale
 */
export const createFlashSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const sale = new FlashSale(req.body);
    
    // Validate dates
    if (sale.schedule.startDate >= sale.schedule.endDate) {
      res.status(400).json({ error: 'End date must be after start date' });
      return;
    }
    
    // Auto-activate if start date is now
    if (sale.schedule.startDate <= new Date()) {
      sale.status = 'active';
    }
    
    await sale.save();
    
    // TODO: Schedule notifications for customers
    // TODO: Schedule automatic activation/deactivation
    
    res.status(201).json(sale);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to create flash sale' });
    return;
  }
};

/**
 * Update flash sale
 */
export const updateFlashSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const sale = await FlashSale.findById(id);
    
    if (!sale) {
      res.status(404).json({ error: 'Flash sale not found' });
      return;
    }
    
    // Don't allow updates to active or ended sales
    if (sale.status === 'active' || sale.status === 'ended') {
      res.status(400).json({ error: 'Cannot update active or ended flash sales' });
      return;
    }
    
    Object.assign(sale, req.body);
    sale.updatedAt = new Date();
    await sale.save();
    
    res.status(200).json(sale);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update flash sale' });
    return;
  }
};

/**
 * Cancel flash sale
 */
export const cancelFlashSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const sale = await FlashSale.findById(id);
    
    if (!sale) {
      res.status(404).json({ error: 'Flash sale not found' });
      return;
    }
    
    if (sale.status === 'ended') {
      res.status(400).json({ error: 'Cannot cancel ended flash sale' });
      return;
    }
    
    sale.status = 'cancelled';
    sale.metadata = { ...sale.metadata, cancellationReason: reason, cancelledAt: new Date() };
    sale.updatedAt = new Date();
    await sale.save();
    
    res.status(200).json({ message: 'Flash sale cancelled successfully', sale });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel flash sale' });
    return;
  }
};

/**
 * Add product to flash sale
 */
export const addProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { productId, originalPrice, salePrice, discount, stock } = req.body;
    
    const sale = await FlashSale.findById(id);
    
    if (!sale) {
      res.status(404).json({ error: 'Flash sale not found' });
      return;
    }
    
    // Check if product already exists
    if (sale.products.find((p: any) => p.productId.toString() === productId)) {
      res.status(400).json({ error: 'Product already in flash sale' });
      return;
    }
    
    sale.products.push({
      productId,
      originalPrice,
      salePrice,
      discount: discount || Math.round(((originalPrice - salePrice) / originalPrice) * 100),
      stock,
      sold: 0
    });
    
    sale.updatedAt = new Date();
    await sale.save();
    
    res.status(200).json(sale);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
    return;
  }
};

/**
 * Remove product from flash sale
 */
export const removeProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, productId } = req.params;
    
    const sale = await FlashSale.findById(id);
    
    if (!sale) {
      res.status(404).json({ error: 'Flash sale not found' });
      return;
    }
    
    const productIndex = sale.products.findIndex((p: any) => p.productId.toString() === productId);
    
    if (productIndex === -1) {
      res.status(404).json({ error: 'Product not found in flash sale' });
      return;
    }
    
    sale.products.splice(productIndex, 1);
    sale.updatedAt = new Date();
    await sale.save();
    
    res.status(200).json(sale);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove product' });
    return;
  }
};

/**
 * Record sale purchase
 */
export const recordPurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { productId, quantity, customerId } = req.body;
    
    const sale = await FlashSale.findById(id);
    
    if (!sale) {
      res.status(404).json({ error: 'Flash sale not found' });
      return;
    }
    
    if (sale.status !== 'active') {
      res.status(400).json({ error: 'Flash sale is not active' });
      return;
    }
    
    const product = sale.products.find((p: any) => p.productId.toString() === productId);
    
    if (!product) {
      res.status(404).json({ error: 'Product not found in flash sale' });
      return;
    }
    
    // Check stock
    if (product.stock < quantity) {
      res.status(400).json({ error: 'Insufficient stock' });
      return;
    }
    
    // Check max quantity per customer
    if (sale.rules.maxQuantityPerCustomer && quantity > sale.rules.maxQuantityPerCustomer) {
      res.status(400).json({ 
        error: `Maximum ${sale.rules.maxQuantityPerCustomer} items per customer` 
      });
      return;
    }
    
    // Update sale stats
    product.stock -= quantity;
    product.sold += quantity;
    sale.performance.participants += 1;
    sale.performance.revenue += product.salePrice * quantity;
    sale.updatedAt = new Date();
    
    await sale.save();
    
    res.status(200).json({
      message: 'Purchase recorded successfully',
      remainingStock: product.stock
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to record purchase' });
    return;
  }
};

/**
 * Get flash sale performance
 */
export const getPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const sale = await FlashSale.findById(id)
      .populate('products.productId', 'name');
    
    if (!sale) {
      res.status(404).json({ error: 'Flash sale not found' });
      return;
    }
    
    // Calculate detailed metrics
    const totalProducts = sale.products.length;
    const totalStock = sale.products.reduce((sum: number, p: any) => sum + p.stock, 0);
    const totalSold = sale.products.reduce((sum: number, p: any) => sum + p.sold, 0);
    const sellThroughRate = totalStock > 0 ? (totalSold / (totalStock + totalSold)) * 100 : 0;
    
    const topProducts = sale.products
      .map((p: any) => ({
        productId: p.productId,
        sold: p.sold,
        revenue: p.salePrice * p.sold
      }))
      .sort((a: any, b: any) => b.sold - a.sold)
      .slice(0, 5);
    
    const performance = {
      sale: {
        id: sale._id,
        name: sale.name,
        status: sale.status,
        duration: {
          start: sale.schedule.startDate,
          end: sale.schedule.endDate,
          totalHours: Math.round((sale.schedule.endDate.getTime() - sale.schedule.startDate.getTime()) / (1000 * 60 * 60))
        }
      },
      metrics: {
        totalViews: sale.performance.views,
        totalParticipants: sale.performance.participants,
        totalRevenue: Math.round(sale.performance.revenue * 100) / 100,
        conversionRate: sale.performance.views > 0 
          ? Math.round((sale.performance.participants / sale.performance.views) * 10000) / 100 
          : 0
      },
      inventory: {
        totalProducts,
        totalStock,
        totalSold,
        sellThroughRate: Math.round(sellThroughRate * 100) / 100
      },
      topProducts
    };
    
    res.status(200).json(performance);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance' });
    return;
  }
};

/**
 * Schedule automatic status updates (cron job endpoint)
 */
export const updateSaleStatuses = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    
    // Activate scheduled sales
    const toActivate = await FlashSale.updateMany(
      {
        status: 'scheduled',
        'schedule.startDate': { $lte: now }
      },
      {
        status: 'active',
        updatedAt: now
      }
    );
    
    // End active sales
    const toEnd = await FlashSale.updateMany(
      {
        status: 'active',
        'schedule.endDate': { $lte: now }
      },
      {
        status: 'ended',
        updatedAt: now
      }
    );
    
    res.status(200).json({
      message: 'Sale statuses updated',
      activated: toActivate.modifiedCount,
      ended: toEnd.modifiedCount
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sale statuses' });
    return;
  }
};
