import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { createLogger } from '@mallify/shared';

const logger = createLogger('order-controller');

export const getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20, status, userId, boutiqueId } = req.query;
    const query: any = {};
    
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (boutiqueId) query.boutiqueId = boutiqueId;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort('-createdAt').skip(skip).limit(limitNum).lean(),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
      },
    });
  } catch (error) {
    logger.error('Error retrieving orders:', error);
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orderData = req.body;
    orderData.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const order = new Order(orderData);
    await order.save();
    
    logger.info('Order created:', { orderId: order._id, orderNumber: order.orderNumber });
    res.status(201).json({ success: true, message: 'Order created successfully', data: { order } });
  } catch (error) {
    logger.error('Error creating order:', error);
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    
    res.json({ success: true, message: 'Order status updated', data: { order } });
  } catch (error) {
    next(error);
  }
};
