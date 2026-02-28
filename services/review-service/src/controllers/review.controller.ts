import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { createLogger } from '@mallify/shared';

const logger = createLogger('review-controller');

export const getReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20, productId, userId } = req.query;
    const query: any = {};
    if (productId) query.productId = productId;
    if (userId) query.userId = userId;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(query).sort('-createdAt').skip(skip).limit(limitNum).lean(),
      Review.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { reviews, pagination: { currentPage: pageNum, totalPages: Math.ceil(total / limitNum), totalItems: total }},
    });
  } catch (error) {
    logger.error('Error retrieving reviews:', error);
    next(error);
  }
};

export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json({ success: true, message: 'Review created', data: { review } });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'You already reviewed this product' });
      return;
    }
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
