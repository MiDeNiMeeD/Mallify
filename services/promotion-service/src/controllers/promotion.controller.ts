import { Request, Response } from 'express';
import Promotion from '../models/Promotion';

export const getPromotions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    
    const promotions = await Promotion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Promotion.countDocuments(query);
    
    res.status(200).json({
      promotions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promotions' });
    return;
  }
};

export const getPromotionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    
    if (!promotion) {
      res.status(404).json({ error: 'Promotion not found' });
      return;
    }
    
    res.status(200).json(promotion);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promotion' });
    return;
  }
};

export const getPromotionByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const promotion = await Promotion.findOne({ 
      code: req.params.code.toUpperCase(),
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    if (!promotion) {
      res.status(404).json({ error: 'Promotion not found or not valid' });
      return;
    }
    
    res.status(200).json(promotion);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promotion' });
    return;
  }
};

export const createPromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const promotion = new Promotion(req.body);
    
    // Set status based on dates
    const now = new Date();
    if (promotion.startDate > now) {
      promotion.status = 'scheduled';
    } else if (promotion.endDate < now) {
      promotion.status = 'expired';
    }
    
    await promotion.save();
    
    res.status(201).json(promotion);
    return;
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Promotion code already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create promotion' });
    return;
  }
};

export const updatePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!promotion) {
      res.status(404).json({ error: 'Promotion not found' });
      return;
    }
    
    res.status(200).json(promotion);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update promotion' });
    return;
  }
};

export const deletePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    
    if (!promotion) {
      res.status(404).json({ error: 'Promotion not found' });
      return;
    }
    
    res.status(200).json({ message: 'Promotion deactivated successfully' });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete promotion' });
    return;
  }
};

export const validatePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, userId, orderTotal, productIds } = req.body;
    
    const promotion = await Promotion.findOne({ 
      code: code.toUpperCase(),
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    if (!promotion) {
      res.status(404).json({ valid: false, error: 'Invalid or expired promotion code' });
      return;
    }
    
    // Check usage limit
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      res.status(400).json({ valid: false, error: 'Promotion usage limit reached' });
      return;
    }
    
    // Check minimum purchase
    if (promotion.minimumPurchase && orderTotal < promotion.minimumPurchase) {
      res.status(400).json({ valid: false, error: `Minimum purchase of ${promotion.minimumPurchase} required` });
      return;
    }
    
    res.status(200).json({ valid: true, promotion });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate promotion' });
    return;
  }
};

export const getActivePromotions = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ createdAt: -1 });
    
    res.status(200).json(promotions);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active promotions' });
    return;
  }
};
