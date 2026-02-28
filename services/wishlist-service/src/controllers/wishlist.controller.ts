import { Request, Response, NextFunction } from 'express';
import { Wishlist } from '../models/Wishlist';
import { createLogger } from '@mallify/shared';

const logger = createLogger('wishlist-controller');

export const getWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
      await wishlist.save();
    }

    res.json({ success: true, data: { wishlist } });
  } catch (error) {
    logger.error('Error retrieving wishlist:', error);
    next(error);
  }
};

export const addToWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [{ productId, addedAt: new Date() }] });
    } else {
      const exists = wishlist.items.some((item) => item.productId.toString() === productId);
      if (!exists) {
        wishlist.items.push({ productId, addedAt: new Date() });
      }
    }

    await wishlist.save();
    res.json({ success: true, message: 'Added to wishlist', data: { wishlist } });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      res.status(404).json({ success: false, message: 'Wishlist not found' });
      return;
    }

    wishlist.items = wishlist.items.filter((item) => item.productId.toString() !== productId);
    await wishlist.save();

    res.json({ success: true, message: 'Removed from wishlist', data: { wishlist } });
  } catch (error) {
    next(error);
  }
};
