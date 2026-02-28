import { Request, Response } from 'express';
import Analytics from '../models/Analytics';

export const trackEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = new Analytics(req.body);
    await event.save();
    
    res.status(201).json({ message: 'Event tracked successfully' });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to track event' });
    return;
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventType, startDate, endDate, userId } = req.query;
    
    const query: any = {};
    if (eventType) query.eventType = eventType;
    if (userId) query.userId = userId;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }
    
    const events = await Analytics.find(query)
      .sort({ timestamp: -1 })
      .limit(1000);
    
    res.status(200).json(events);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
    return;
  }
};

export const getStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);
    
    const matchStage: any = {};
    if (Object.keys(dateFilter).length > 0) {
      matchStage.timestamp = dateFilter;
    }
    
    const stats = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json(stats);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
    return;
  }
};
