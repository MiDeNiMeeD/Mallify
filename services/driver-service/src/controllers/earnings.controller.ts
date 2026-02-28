import { Request, Response } from 'express';
import Driver from '../models/Driver';
import mongoose from 'mongoose';

/**
 * Driver Earnings Management Controller
 * Manages driver earnings, payouts, and financial tracking
 */

// Earnings model
const Earning = mongoose.model('Earning', new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
    index: true
  },
  deliveryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  amount: {
    type: Number,
    required: true
  },
  breakdown: {
    baseFee: Number,
    distanceFee: Number,
    timeFee: Number,
    bonus: Number,
    tip: Number,
    surcharge: Number
  },
  distance: Number, // in km
  duration: Number, // in minutes
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'disputed'],
    default: 'pending'
  },
  payoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payout'
  },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

// Payout model
const Payout = mongoose.model('Payout', new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
    index: true
  },
  payoutNumber: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  earningsCount: Number,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['bank_transfer', 'mobile_money', 'paypal', 'check'],
    default: 'bank_transfer'
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String
  },
  processedAt: Date,
  transactionId: String,
  failureReason: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

/**
 * Get driver earnings
 */
export const getDriverEarnings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const query: any = { driverId };
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const earnings = await Earning.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('deliveryId', 'trackingNumber status')
      .populate('orderId', 'orderNumber total');
    
    const total = await Earning.countDocuments(query);
    
    // Calculate summary
    const summary = await Earning.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          totalDeliveries: { $sum: 1 },
          avgEarningPerDelivery: { $avg: '$amount' },
          totalDistance: { $sum: '$distance' },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);
    
    res.status(200).json({
      earnings,
      summary: summary[0] || {
        totalEarnings: 0,
        totalDeliveries: 0,
        avgEarningPerDelivery: 0,
        totalDistance: 0,
        totalDuration: 0
      },
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch driver earnings' });
    return;
  }
};

/**
 * Create earning record
 */
export const createEarning = async (req: Request, res: Response): Promise<void> => {
  try {
    const earning = new Earning(req.body);
    await earning.save();
    
    // Update driver's total earnings
    await Driver.findByIdAndUpdate(
      earning.driverId,
      {
        $inc: {
          'earnings.total': earning.amount,
          'earnings.pending': earning.amount,
          'completedDeliveries': 1,
          'totalDeliveries': 1
        }
      }
    );
    
    res.status(201).json(earning);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to create earning record' });
    return;
  }
};

/**
 * Get driver payouts
 */
export const getDriverPayouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    const query: any = { driverId };
    if (status) query.status = status;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const payouts = await Payout.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Payout.countDocuments(query);
    
    res.status(200).json({
      payouts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch driver payouts' });
    return;
  }
};

/**
 * Create payout request
 */
export const createPayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    
    // Get pending earnings
    const pendingEarnings = await Earning.find({
      driverId,
      status: 'approved',
      payoutId: null
    });
    
    if (pendingEarnings.length === 0) {
      res.status(400).json({ error: 'No pending earnings available for payout' });
      return;
    }
    
    const totalAmount = pendingEarnings.reduce((sum, earning) => sum + earning.amount, 0);
    
    // Get driver bank details
    const driver = await Driver.findById(driverId);
    
    if (!driver || !driver.bankDetails) {
      res.status(400).json({ error: 'Driver bank details not found' });
      return;
    }
    
    const payoutNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const payout = new Payout({
      driverId,
      payoutNumber,
      amount: totalAmount,
      earningsCount: pendingEarnings.length,
      bankDetails: driver.bankDetails,
      ...req.body
    });
    
    await payout.save();
    
    // Link earnings to payout
    await Earning.updateMany(
      { _id: { $in: pendingEarnings.map(e => e._id) } },
      { payoutId: payout._id, status: 'paid', updatedAt: new Date() }
    );
    
    // Update driver earnings
    await Driver.findByIdAndUpdate(
      driverId,
      {
        $inc: {
          'earnings.pending': -totalAmount,
          'earnings.paid': totalAmount
        }
      }
    );
    
    res.status(201).json(payout);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payout' });
    return;
  }
};

/**
 * Approve payout (Admin/Manager)
 */
export const approvePayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payoutId } = req.params;
    const { transactionId } = req.body;
    
    const payout = await Payout.findByIdAndUpdate(
      payoutId,
      {
        status: 'completed',
        processedAt: new Date(),
        transactionId,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!payout) {
      res.status(404).json({ error: 'Payout not found' });
      return;
    }
    
    res.status(200).json(payout);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve payout' });
    return;
  }
};

/**
 * Reject payout
 */
export const rejectPayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payoutId } = req.params;
    const { reason } = req.body;
    
    const payout = await Payout.findById(payoutId);
    
    if (!payout) {
      res.status(404).json({ error: 'Payout not found' });
      return;
    }
    
    payout.status = 'failed';
    payout.failureReason = reason;
    payout.updatedAt = new Date();
    await payout.save();
    
    // Unlink earnings from failed payout
    await Earning.updateMany(
      { payoutId: payout._id },
      { payoutId: null, status: 'approved', updatedAt: new Date() }
    );
    
    // Update driver earnings
    await Driver.findByIdAndUpdate(
      payout.driverId,
      {
        $inc: {
          'earnings.pending': payout.amount,
          'earnings.paid': -payout.amount
        }
      }
    );
    
    res.status(200).json(payout);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject payout' });
    return;
  }
};

/**
 * Get earnings summary
 */
export const getEarningsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    const { period = 'week' } = req.query; // week, month, year, all
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }
    
    const summary = await Earning.aggregate([
      {
        $match: {
          driverId: new mongoose.Types.ObjectId(driverId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          totalDeliveries: { $sum: 1 },
          avgEarningPerDelivery: { $avg: '$amount' },
          totalDistance: { $sum: '$distance' },
          totalDuration: { $sum: '$duration' },
          totalBaseFee: { $sum: '$breakdown.baseFee' },
          totalDistanceFee: { $sum: '$breakdown.distanceFee' },
          totalTips: { $sum: '$breakdown.tip' },
          totalBonus: { $sum: '$breakdown.bonus' }
        }
      }
    ]);
    
    // Get status breakdown
    const statusBreakdown = await Earning.aggregate([
      {
        $match: {
          driverId: new mongoose.Types.ObjectId(driverId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);
    
    res.status(200).json({
      period,
      summary: summary[0] || {},
      statusBreakdown
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch earnings summary' });
    return;
  }
};

/**
 * Calculate earning for a delivery
 */
export const calculateEarning = async (req: Request, res: Response): Promise<void> => {
  try {
    const { distance, duration, deliveryMethod, zone } = req.body;
    
    // Base rates (can be configured per zone)
    const rates = {
      baseFee: 5.00,
      perKmRate: 1.50,
      perMinuteRate: 0.25,
      methodMultiplier: {
        standard: 1.0,
        express: 1.3,
        same_day: 1.5,
        pickup: 0.8
      }
    };
    
    const baseFee = rates.baseFee;
    const distanceFee = distance * rates.perKmRate;
    const timeFee = duration * rates.perMinuteRate;
    const methodMultiplier = rates.methodMultiplier[deliveryMethod as keyof typeof rates.methodMultiplier] || 1.0;
    
    const subtotal = (baseFee + distanceFee + timeFee) * methodMultiplier;
    
    // Add bonus for long-distance deliveries
    const bonus = distance > 20 ? 5.00 : 0;
    
    const total = subtotal + bonus;
    
    res.status(200).json({
      breakdown: {
        baseFee,
        distanceFee: Math.round(distanceFee * 100) / 100,
        timeFee: Math.round(timeFee * 100) / 100,
        bonus,
        methodMultiplier
      },
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(total * 100) / 100,
      distance,
      duration,
      deliveryMethod
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate earning' });
    return;
  }
};
