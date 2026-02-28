import { Request, Response } from 'express';
import Notification from '../models/Notification';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, type, status, priority, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email phone');
    
    const total = await Notification.countDocuments(query);
    
    res.status(200).json({
      notifications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
    return;
  }
};

export const getNotificationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('userId', 'name email phone');
    
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    
    res.status(200).json(notification);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notification' });
    return;
  }
};

export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    
    res.status(201).json(notification);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
    return;
  }
};

export const updateNotificationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, failureReason } = req.body;
    
    const updateData: any = { status };
    
    if (status === 'sent') {
      updateData.sentAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    } else if (status === 'read') {
      updateData.readAt = new Date();
    } else if (status === 'failed' && failureReason) {
      updateData.failureReason = failureReason;
      updateData.$inc = { retryCount: 1 };
    }
    
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    
    res.status(200).json(notification);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification status' });
    return;
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'read',
        readAt: new Date()
      },
      { new: true }
    );
    
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    
    res.status(200).json(notification);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
    return;
  }
};

export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { unreadOnly, page = 1, limit = 20 } = req.query;
    
    const query: any = { userId: req.params.userId };
    if (unreadOnly === 'true') {
      query.status = { $ne: 'read' };
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.params.userId, 
      status: { $ne: 'read' } 
    });
    
    res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user notifications' });
    return;
  }
};
