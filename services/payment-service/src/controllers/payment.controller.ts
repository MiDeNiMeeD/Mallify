import { Request, Response } from 'express';
import Payment from '../models/Payment';

export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, userId, orderId, method, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (status) query.paymentStatus = status;
    if (userId) query.userId = userId;
    if (orderId) query.orderId = orderId;
    if (method) query.paymentMethod = method;

    const skip = (Number(page) - 1) * Number(limit);
    
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email')
      .populate('orderId', 'orderNumber total');
    
    const total = await Payment.countDocuments(query);
    
    res.status(200).json({
      payments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
    return;
  }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('orderId', 'orderNumber total items');
    
    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }
    
    res.status(200).json(payment);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment' });
    return;
  }
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    
    res.status(201).json(payment);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment' });
    return;
  }
};

export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, transactionId, failureReason, paymentGateway } = req.body;
    
    const updateData: any = {
      paymentStatus: status
    };
    
    if (transactionId) updateData.transactionId = transactionId;
    if (failureReason) updateData.failureReason = failureReason;
    if (paymentGateway) updateData.paymentGateway = paymentGateway;
    
    if (status === 'completed') {
      updateData.paidAt = new Date();
    }
    
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }
    
    res.status(200).json(payment);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment status' });
    return;
  }
};

export const processRefund = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, reason, transactionId } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }
    
    if (payment.paymentStatus !== 'completed') {
      res.status(400).json({ error: 'Can only refund completed payments' });
      return;
    }
    
    payment.paymentStatus = 'refunded';
    payment.refund = {
      amount,
      reason,
      refundedAt: new Date(),
      transactionId
    };
    
    await payment.save();
    
    res.status(200).json(payment);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to process refund' });
    return;
  }
};

export const getPaymentsByOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find({ orderId: req.params.orderId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(payments);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order payments' });
    return;
  }
};
