import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Loyalty and Rewards Program Controller
 * Manages customer loyalty points, rewards, tiers, and redemptions
 */

// Loyalty account model
const LoyaltyAccount = mongoose.model('LoyaltyAccount', new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  points: {
    available: { type: Number, default: 0 },
    earned: { type: Number, default: 0 },
    redeemed: { type: Number, default: 0 },
    expired: { type: Number, default: 0 }
  },
  tier: {
    current: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
    pointsToNextTier: Number,
    benefits: [String]
  },
  lifetime: {
    totalSpent: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    memberSince: { type: Date, default: Date.now }
  },
  referrals: {
    code: String,
    referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    earnings: { type: Number, default: 0 }
  },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

// Transaction model for points
const PointsTransaction = mongoose.model('PointsTransaction', new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['earn', 'redeem', 'expire', 'bonus', 'refund', 'referral'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  balance: Number, // Balance after transaction
  reason: String,
  relatedId: mongoose.Schema.Types.ObjectId, // Order ID, Reward ID, etc.
  relatedType: String, // 'order', 'reward', 'referral'
  expiresAt: Date,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
}));

// Rewards catalog
const Reward = mongoose.model('Reward', new mongoose.Schema({
  name: String,
  description: String,
  type: {
    type: String,
    enum: ['discount', 'free_shipping', 'gift', 'voucher', 'upgrade'],
    required: true
  },
  pointsCost: Number,
  value: mongoose.Schema.Types.Mixed, // e.g., { percentage: 10, maxAmount: 50 }
  terms: [String],
  availability: {
    stock: Number,
    unlimited: { type: Boolean, default: false },
    validFrom: Date,
    validUntil: Date
  },
  tierRestriction: [String], // ['gold', 'platinum']
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  redemptionCount: { type: Number, default: 0 },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

// Redemption history
const Redemption = mongoose.model('Redemption', new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rewardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true
  },
  pointsUsed: Number,
  code: String, // Unique redemption code
  status: {
    type: String,
    enum: ['pending', 'active', 'used', 'expired', 'cancelled'],
    default: 'active'
  },
  usedAt: Date,
  expiresAt: Date,
  orderId: mongoose.Schema.Types.ObjectId,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
}));

// Tier configuration
const TIERS = {
  bronze: {
    name: 'Bronze',
    minSpend: 0,
    pointsMultiplier: 1,
    benefits: ['Earn 1 point per $1 spent', 'Birthday bonus', 'Special promotions']
  },
  silver: {
    name: 'Silver',
    minSpend: 500,
    pointsMultiplier: 1.25,
    benefits: ['Earn 1.25 points per $1 spent', 'Free shipping on orders $50+', 'Early sale access', 'Birthday bonus']
  },
  gold: {
    name: 'Gold',
    minSpend: 2000,
    pointsMultiplier: 1.5,
    benefits: ['Earn 1.5 points per $1 spent', 'Free shipping on all orders', 'Priority customer support', 'Exclusive rewards', 'Birthday bonus']
  },
  platinum: {
    name: 'Platinum',
    minSpend: 5000,
    pointsMultiplier: 2,
    benefits: ['Earn 2 points per $1 spent', 'Free express shipping', 'VIP customer support', 'Exclusive rewards', 'Personal shopper', 'Birthday bonus']
  }
};

/**
 * Get loyalty account
 */
export const getLoyaltyAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    let account = await LoyaltyAccount.findOne({ userId });
    
    // Create account if doesn't exist
    if (!account) {
      const referralCode = `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      account = new LoyaltyAccount({
        userId,
        referrals: { code: referralCode }
      });
      await account.save();
    }
    
    // Update tier benefits
    account.tier.benefits = TIERS[account.tier.current as keyof typeof TIERS].benefits;
    
    // Calculate points to next tier
    const nextTier = getNextTier(account.tier.current);
    if (nextTier) {
      account.tier.pointsToNextTier = TIERS[nextTier as keyof typeof TIERS].minSpend - account.lifetime.totalSpent;
    }
    
    res.status(200).json(account);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch loyalty account' });
    return;
  }
};

/**
 * Earn points
 */
export const earnPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { points, reason, orderId, orderAmount } = req.body;
    
    const account = await LoyaltyAccount.findOne({ userId });
    
    if (!account) {
      res.status(404).json({ error: 'Loyalty account not found' });
      return;
    }
    
    // Calculate points with tier multiplier
    const tierMultiplier = TIERS[account.tier.current as keyof typeof TIERS].pointsMultiplier;
    const earnedPoints = Math.round(points * tierMultiplier);
    
    // Update account
    account.points.available += earnedPoints;
    account.points.earned += earnedPoints;
    
    if (orderAmount) {
      account.lifetime.totalSpent += orderAmount;
      account.lifetime.totalOrders += 1;
      
      // Check for tier upgrade
      const newTier = calculateTier(account.lifetime.totalSpent);
      if (newTier !== account.tier.current) {
        account.tier.current = newTier;
      }
    }
    
    account.updatedAt = new Date();
    await account.save();
    
    // Create transaction record
    const transaction = new PointsTransaction({
      userId,
      type: 'earn',
      points: earnedPoints,
      balance: account.points.available,
      reason: reason || 'Purchase reward',
      relatedId: orderId,
      relatedType: 'order',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
    });
    
    await transaction.save();
    
    res.status(200).json({
      message: 'Points earned successfully',
      pointsEarned: earnedPoints,
      newBalance: account.points.available,
      tier: account.tier.current,
      transaction
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to earn points' });
    return;
  }
};

/**
 * Get available rewards
 */
export const getRewards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { type, affordable } = req.query;
    
    const account = await LoyaltyAccount.findOne({ userId });
    
    const query: any = { isActive: true };
    if (type) query.type = type;
    
    // Filter by tier restriction
    query.$or = [
      { tierRestriction: { $size: 0 } },
      { tierRestriction: account?.tier.current },
      { tierRestriction: null }
    ];
    
    // Filter by validity
    query.$and = [
      { $or: [{ 'availability.validFrom': { $lte: new Date() } }, { 'availability.validFrom': null }] },
      { $or: [{ 'availability.validUntil': { $gte: new Date() } }, { 'availability.validUntil': null }] }
    ];
    
    let rewards = await Reward.find(query).sort({ pointsCost: 1 });
    
    // Filter affordable rewards
    if (affordable === 'true' && account) {
      rewards = rewards.filter(r => r.pointsCost <= account.points.available);
    }
    
    // Add affordability info
    const rewardsWithInfo = rewards.map(reward => ({
      ...reward.toObject(),
      canAfford: account ? account.points.available >= reward.pointsCost : false,
      pointsNeeded: account && account.points.available < reward.pointsCost 
        ? reward.pointsCost - account.points.available 
        : 0
    }));
    
    res.status(200).json({
      rewards: rewardsWithInfo,
      userPoints: account?.points.available || 0
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rewards' });
    return;
  }
};

/**
 * Redeem reward
 */
export const redeemReward = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { rewardId } = req.body;
    
    const account = await LoyaltyAccount.findOne({ userId });
    const reward = await Reward.findById(rewardId);
    
    if (!account) {
      res.status(404).json({ error: 'Loyalty account not found' });
      return;
    }
    
    if (!reward || !reward.isActive) {
      res.status(404).json({ error: 'Reward not found or inactive' });
      return;
    }
    
    // Check if user has enough points
    if (account.points.available < reward.pointsCost) {
      res.status(400).json({ 
        error: 'Insufficient points',
        required: reward.pointsCost,
        available: account.points.available
      });
      return;
    }
    
    // Check tier restriction
    if (reward.tierRestriction && reward.tierRestriction.length > 0) {
      if (!reward.tierRestriction.includes(account.tier.current)) {
        res.status(403).json({ error: 'This reward is not available for your tier' });
        return;
      }
    }
    
    // Check availability
    if (!reward.availability.unlimited && reward.availability.stock <= 0) {
      res.status(400).json({ error: 'Reward is out of stock' });
      return;
    }
    
    // Deduct points
    account.points.available -= reward.pointsCost;
    account.points.redeemed += reward.pointsCost;
    account.updatedAt = new Date();
    await account.save();
    
    // Create redemption record
    const redemptionCode = `RWD${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const redemption = new Redemption({
      userId,
      rewardId,
      pointsUsed: reward.pointsCost,
      code: redemptionCode,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days validity
    });
    
    await redemption.save();
    
    // Update reward stats
    if (!reward.availability.unlimited) {
      reward.availability.stock -= 1;
    }
    reward.redemptionCount += 1;
    await reward.save();
    
    // Create transaction record
    const transaction = new PointsTransaction({
      userId,
      type: 'redeem',
      points: -reward.pointsCost,
      balance: account.points.available,
      reason: `Redeemed: ${reward.name}`,
      relatedId: redemption._id,
      relatedType: 'reward'
    });
    
    await transaction.save();
    
    res.status(200).json({
      message: 'Reward redeemed successfully',
      redemption,
      remainingPoints: account.points.available
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to redeem reward' });
    return;
  }
};

/**
 * Get redemption history
 */
export const getRedemptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    const query: any = { userId };
    if (status) query.status = status;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const redemptions = await Redemption.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('rewardId', 'name type value');
    
    const total = await Redemption.countDocuments(query);
    
    res.status(200).json({
      redemptions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch redemptions' });
    return;
  }
};

/**
 * Get points history
 */
export const getPointsHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { type, page = 1, limit = 20 } = req.query;
    
    const query: any = { userId };
    if (type) query.type = type;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const transactions = await PointsTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await PointsTransaction.countDocuments(query);
    
    res.status(200).json({
      transactions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch points history' });
    return;
  }
};

/**
 * Process referral
 */
export const processReferral = async (req: Request, res: Response): Promise<void> => {
  try {
    const { referralCode, newUserId } = req.body;
    
    // Find referrer
    const referrer = await LoyaltyAccount.findOne({ 'referrals.code': referralCode });
    
    if (!referrer) {
      res.status(404).json({ error: 'Invalid referral code' });
      return;
    }
    
    // Check if user already referred
    if (referrer.referrals.referredUsers.includes(newUserId)) {
      res.status(400).json({ error: 'User already referred' });
      return;
    }
    
    const referralBonus = 500; // Points for successful referral
    const newUserBonus = 250; // Welcome bonus for new user
    
    // Reward referrer
    referrer.points.available += referralBonus;
    referrer.points.earned += referralBonus;
    referrer.referrals.referredUsers.push(newUserId);
    referrer.referrals.earnings += referralBonus;
    await referrer.save();
    
    // Create transaction for referrer
    const referrerTransaction = new PointsTransaction({
      userId: referrer.userId,
      type: 'referral',
      points: referralBonus,
      balance: referrer.points.available,
      reason: 'Referral bonus',
      relatedId: newUserId,
      relatedType: 'referral'
    });
    await referrerTransaction.save();
    
    // Reward new user
    const newUserAccount = await LoyaltyAccount.findOne({ userId: newUserId });
    if (newUserAccount) {
      newUserAccount.points.available += newUserBonus;
      newUserAccount.points.earned += newUserBonus;
      await newUserAccount.save();
      
      const newUserTransaction = new PointsTransaction({
        userId: newUserId,
        type: 'bonus',
        points: newUserBonus,
        balance: newUserAccount.points.available,
        reason: 'Welcome bonus',
        relatedType: 'referral'
      });
      await newUserTransaction.save();
    }
    
    res.status(200).json({
      message: 'Referral processed successfully',
      referrerBonus: referralBonus,
      newUserBonus: newUserBonus
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to process referral' });
    return;
  }
};

/**
 * Get loyalty leaderboard
 */
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10, period = 'all' } = req.query;
    
    const leaderboard = await LoyaltyAccount.find()
      .sort({ 'points.earned': -1 })
      .limit(Number(limit))
      .populate('userId', 'name email')
      .select('userId points tier lifetime');
    
    const formatted = leaderboard.map((account, index) => ({
      rank: index + 1,
      userId: account.userId,
      points: account.points.earned,
      tier: account.tier.current,
      totalSpent: account.lifetime.totalSpent,
      memberSince: account.lifetime.memberSince
    }));
    
    res.status(200).json({ leaderboard: formatted });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
    return;
  }
};

// Helper functions
function calculateTier(totalSpent: number): string {
  if (totalSpent >= 5000) return 'platinum';
  if (totalSpent >= 2000) return 'gold';
  if (totalSpent >= 500) return 'silver';
  return 'bronze';
}

function getNextTier(currentTier: string): string | null {
  const order = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = order.indexOf(currentTier);
  return currentIndex < order.length - 1 ? order[currentIndex + 1] : null;
}
