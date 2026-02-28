import { Request, Response } from 'express';
import Driver from '../models/Driver';
import mongoose from 'mongoose';

/**
 * Driver Performance Tracking Controller
 * Manages driver performance metrics, ratings, and analytics
 */

// Performance model
const Performance = mongoose.model('Performance', new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
    index: true
  },
  period: {
    start: Date,
    end: Date
  },
  metrics: {
    totalDeliveries: { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },
    cancelledDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    onTimeDeliveries: { type: Number, default: 0 },
    lateDeliveries: { type: Number, default: 0 },
    avgDeliveryTime: Number, // in minutes
    avgRating: Number,
    totalRatings: Number,
    totalDistance: Number, // in km
    totalEarnings: Number,
    activeHours: Number,
    customerCompliments: { type: Number, default: 0 },
    customerComplaints: { type: Number, default: 0 }
  },
  ratings: {
    overall: Number,
    communication: Number,
    professionalism: Number,
    timeliness: Number,
    packagingCare: Number
  },
  efficiency: {
    deliveriesPerHour: Number,
    earningsPerHour: Number,
    earningsPerKm: Number,
    acceptanceRate: Number, // % of accepted deliveries
    completionRate: Number  // % of completed deliveries
  },
  badges: [{
    name: String,
    earnedAt: Date,
    icon: String
  }],
  rank: {
    current: String, // bronze, silver, gold, platinum, diamond
    pointsToNextRank: Number
  },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

/**
 * Get driver performance
 */
export const getDriverPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    const performance = await Performance.findOne({
      driverId,
      'period.start': { $gte: startDate },
      'period.end': { $lte: now }
    });
    
    if (!performance) {
      // Generate performance data if not exists
      const newPerformance = await generatePerformanceData(driverId, startDate, now);
      res.status(200).json(newPerformance);
      return;
    }
    
    res.status(200).json(performance);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch driver performance' });
    return;
  }
};

/**
 * Update driver rating
 */
export const updateDriverRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    const { rating, categories, review, deliveryId } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }
    
    const driver = await Driver.findById(driverId);
    
    if (!driver) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }
    
    // Update driver's overall rating
    const newTotalRatings = (driver.rating * driver.totalDeliveries + rating) / (driver.totalDeliveries + 1);
    
    await Driver.findByIdAndUpdate(
      driverId,
      {
        rating: Math.round(newTotalRatings * 10) / 10,
        $inc: { totalDeliveries: 1 }
      }
    );
    
    // Store detailed rating
    const Rating = mongoose.model('Rating', new mongoose.Schema({
      driverId: mongoose.Schema.Types.ObjectId,
      deliveryId: mongoose.Schema.Types.ObjectId,
      customerId: mongoose.Schema.Types.ObjectId,
      rating: Number,
      categories: {
        communication: Number,
        professionalism: Number,
        timeliness: Number,
        packagingCare: Number
      },
      review: String,
      createdAt: { type: Date, default: Date.now }
    }));
    
    const newRating = new Rating({
      driverId,
      deliveryId,
      rating,
      categories,
      review,
      customerId: req.body.customerId
    });
    
    await newRating.save();
    
    res.status(200).json({
      message: 'Rating updated successfully',
      newRating: Math.round(newTotalRatings * 10) / 10
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update driver rating' });
    return;
  }
};

/**
 * Get driver analytics
 */
export const getDriverAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    // This would aggregate data from Delivery and Earning collections
    // For now, return mock analytics structure
    const analytics = {
      overview: {
        totalDeliveries: 0,
        completionRate: 0,
        avgRating: 0,
        totalEarnings: 0
      },
      trends: {
        daily: [],
        weekly: []
      },
      performance: {
        onTimePercentage: 0,
        avgDeliveryTime: 0,
        avgDeliveriesPerDay: 0
      },
      comparison: {
        vsLastPeriod: {
          deliveries: '+0%',
          earnings: '+0%',
          rating: '+0'
        },
        vsAverage: {
          completionRate: 'equal',
          earnings: 'above'
        }
      }
    };
    
    res.status(200).json(analytics);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch driver analytics' });
    return;
  }
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'month', limit = 10, metric = 'deliveries' } = req.query;
    
    let sortField = 'completedDeliveries';
    
    switch (metric) {
      case 'earnings':
        sortField = 'earnings.total';
        break;
      case 'rating':
        sortField = 'rating';
        break;
      case 'deliveries':
      default:
        sortField = 'completedDeliveries';
    }
    
    const drivers = await Driver.find({ status: 'active' })
      .sort({ [sortField]: -1 })
      .limit(Number(limit))
      .select('firstName lastName rating completedDeliveries earnings.total');
    
    const leaderboard = drivers.map((driver, index) => ({
      rank: index + 1,
      driverId: driver._id,
      name: `${driver.firstName} ${driver.lastName}`,
      rating: driver.rating,
      completedDeliveries: driver.completedDeliveries,
      totalEarnings: driver.earnings.total,
      badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
    }));
    
    res.status(200).json({ period, metric, leaderboard });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
    return;
  }
};

/**
 * Award badge to driver
 */
export const awardBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    const { badgeName, icon } = req.body;
    
    const performance = await Performance.findOne({ driverId }).sort({ createdAt: -1 });
    
    if (!performance) {
      res.status(404).json({ error: 'Performance record not found' });
      return;
    }
    
    // Check if badge already exists
    const existingBadge = performance.badges.find(b => b.name === badgeName);
    
    if (existingBadge) {
      res.status(400).json({ error: 'Badge already awarded' });
      return;
    }
    
    performance.badges.push({
      name: badgeName,
      earnedAt: new Date(),
      icon: icon || '🏆'
    });
    
    await performance.save();
    
    res.status(200).json({
      message: 'Badge awarded successfully',
      badge: { name: badgeName, icon }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to award badge' });
    return;
  }
};

/**
 * Get driver rankings
 */
export const getDriverRanking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    
    const driver = await Driver.findById(driverId);
    
    if (!driver) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }
    
    // Calculate rank based on points system
    const points = (driver.completedDeliveries * 10) + (driver.rating * 100);
    
    let rank = 'bronze';
    let pointsToNext = 1000 - points;
    
    if (points >= 5000) {
      rank = 'diamond';
      pointsToNext = 0;
    } else if (points >= 3000) {
      rank = 'platinum';
      pointsToNext = 5000 - points;
    } else if (points >= 2000) {
      rank = 'gold';
      pointsToNext = 3000 - points;
    } else if (points >= 1000) {
      rank = 'silver';
      pointsToNext = 2000 - points;
    }
    
    // Find driver's position in overall rankings
    const allDrivers = await Driver.find({ status: 'active' })
      .select('completedDeliveries rating');
    
    const driverScores = allDrivers.map(d => ({
      id: d._id,
      score: (d.completedDeliveries * 10) + (d.rating * 100)
    })).sort((a, b) => b.score - a.score);
    
    const position = driverScores.findIndex(d => d.id.toString() === driverId) + 1;
    
    res.status(200).json({
      driverId,
      rank,
      points: Math.round(points),
      pointsToNext: Math.max(0, pointsToNext),
      position,
      totalDrivers: allDrivers.length,
      percentile: Math.round((1 - position / allDrivers.length) * 100)
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to get driver ranking' });
    return;
  }
};

/**
 * Get performance insights
 */
export const getPerformanceInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    
    const driver = await Driver.findById(driverId);
    
    if (!driver) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }
    
    const insights = [];
    
    // Completion rate insight
    const completionRate = driver.totalDeliveries > 0 
      ? (driver.completedDeliveries / driver.totalDeliveries) * 100 
      : 0;
    
    if (completionRate < 80) {
      insights.push({
        type: 'warning',
        category: 'completion_rate',
        message: 'Your completion rate is below 80%. Try to accept deliveries you can complete.',
        impact: 'high'
      });
    } else if (completionRate >= 95) {
      insights.push({
        type: 'positive',
        category: 'completion_rate',
        message: 'Excellent completion rate! Keep up the great work.',
        impact: 'positive'
      });
    }
    
    // Rating insight
    if (driver.rating < 4.0) {
      insights.push({
        type: 'warning',
        category: 'rating',
        message: 'Your rating needs improvement. Focus on communication and timeliness.',
        impact: 'high'
      });
    } else if (driver.rating >= 4.8) {
      insights.push({
        type: 'positive',
        category: 'rating',
        message: 'Outstanding rating! Customers love your service.',
        impact: 'positive'
      });
    }
    
    // Earnings insight
    const avgEarningsPerDelivery = driver.completedDeliveries > 0 
      ? driver.earnings.total / driver.completedDeliveries 
      : 0;
    
    if (avgEarningsPerDelivery > 0) {
      insights.push({
        type: 'info',
        category: 'earnings',
        message: `Your average earnings per delivery is $${avgEarningsPerDelivery.toFixed(2)}`,
        impact: 'medium'
      });
    }
    
    res.status(200).json({ insights });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to get performance insights' });
    return;
  }
};

// Helper function to generate performance data
async function generatePerformanceData(driverId: string, startDate: Date, endDate: Date) {
  // This would aggregate real data from Delivery collection
  // For now, return basic structure
  return {
    driverId,
    period: { start: startDate, end: endDate },
    metrics: {
      totalDeliveries: 0,
      completedDeliveries: 0,
      cancelledDeliveries: 0,
      failedDeliveries: 0,
      onTimeDeliveries: 0,
      lateDeliveries: 0,
      avgDeliveryTime: 0,
      avgRating: 0,
      totalRatings: 0,
      totalDistance: 0,
      totalEarnings: 0,
      activeHours: 0,
      customerCompliments: 0,
      customerComplaints: 0
    },
    efficiency: {
      deliveriesPerHour: 0,
      earningsPerHour: 0,
      earningsPerKm: 0,
      acceptanceRate: 0,
      completionRate: 0
    }
  };
}
