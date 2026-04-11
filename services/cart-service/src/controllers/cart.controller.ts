import { Request, Response, NextFunction } from 'express';
import { Cart } from '../models/Cart';
import { createLogger } from '@mallify/shared';

const logger = createLogger('cart-controller');

export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    res.json({ success: true, data: { cart } });
  } catch (error) {
    logger.error('Error retrieving cart:', error);
    next(error);
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const {
      productId,
      boutiqueId = '',
      storeId = '',
      name,
      image,
      price,
      quantity = 1,
      color = '',
      size = '',
    } = req.body;

    if (!productId || !name || !image || !Number.isFinite(Number(price))) {
      res.status(400).json({ success: false, message: 'Invalid cart item payload' });
      return;
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.productId === String(productId) &&
        (item.color || '') === String(color || '') &&
        (item.size || '') === String(size || '')
    );

    if (existingItem) {
      existingItem.quantity += Math.max(1, Number(quantity));
      existingItem.name = String(name);
      existingItem.image = String(image);
      existingItem.price = Number(price);
      existingItem.boutiqueId = String(boutiqueId || existingItem.boutiqueId || '');
      existingItem.storeId = String(storeId || boutiqueId || existingItem.storeId || '');
    } else {
      cart.items.push({
        productId: String(productId),
        boutiqueId: String(boutiqueId || ''),
        storeId: String(storeId || boutiqueId || ''),
        name: String(name),
        image: String(image),
        price: Number(price),
        quantity: Math.max(1, Number(quantity)),
        color: String(color || ''),
        size: String(size || ''),
        addedAt: new Date(),
      });
    }

    await cart.save();
    res.json({ success: true, message: 'Added to cart', data: { cart } });
  } catch (error) {
    logger.error('Error adding to cart:', error);
    next(error);
  }
};

export const updateCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, productId } = req.params;
    const { quantity, color = '', size = '' } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    const item = cart.items.find(
      (entry) =>
        entry.productId === productId &&
        (entry.color || '') === String(color || '') &&
        (entry.size || '') === String(size || '')
    );

    if (!item) {
      res.status(404).json({ success: false, message: 'Cart item not found' });
      return;
    }

    item.quantity = Math.max(1, Number(quantity || 1));
    await cart.save();

    res.json({ success: true, message: 'Cart item updated', data: { cart } });
  } catch (error) {
    logger.error('Error updating cart item:', error);
    next(error);
  }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, productId } = req.params;
    const { color = '', size = '' } = req.query;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId === productId &&
          (item.color || '') === String(color || '') &&
          (item.size || '') === String(size || '')
        )
    );

    await cart.save();
    res.json({ success: true, message: 'Removed from cart', data: { cart } });
  } catch (error) {
    logger.error('Error removing from cart:', error);
    next(error);
  }
};
