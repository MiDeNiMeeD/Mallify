import { Request, Response } from 'express';
import Notification from '../models/Notification';
import emailService from '../services/email.service';

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

export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      res.status(400).json({ error: 'Email and OTP are required' });
      return;
    }

    // Send OTP email
    const emailSent = await emailService.sendOTPEmail(email, otp);
    
    if (!emailSent) {
      res.status(500).json({ error: 'Failed to send OTP email' });
      return;
    }

    // Optionally, save notification record
    const notification = new Notification({
      type: 'email',
      channel: 'email',
      recipientEmail: email,
      subject: 'Email Verification - OTP Code',
      message: `Your OTP code is: ${otp}`,
      status: 'sent',
      sentAt: new Date()
    });
    await notification.save();

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });
    return;
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
    return;
  }
};

export const sendApprovalEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, boutiqueName } = req.body;
    
    if (!email || !boutiqueName) {
      res.status(400).json({ error: 'Email and boutique name are required' });
      return;
    }

    // Send approval email
    const emailSent = await emailService.sendApprovalEmail(email, boutiqueName);
    
    if (!emailSent) {
      res.status(500).json({ error: 'Failed to send approval email' });
      return;
    }

    // Optionally, save notification record
    const notification = new Notification({
      type: 'email',
      channel: 'email',
      recipientEmail: email,
      subject: 'Boutique Application Approved',
      message: `Your boutique application for "${boutiqueName}" has been approved!`,
      status: 'sent',
      sentAt: new Date()
    });
    await notification.save();

    res.status(200).json({ 
      success: true, 
      message: 'Approval email sent successfully' 
    });
    return;
  } catch (error) {
    console.error('Error sending approval email:', error);
    res.status(500).json({ error: 'Failed to send approval email' });
    return;
  }
};

export const sendRejectionEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, boutiqueName, reason } = req.body;
    
    if (!email || !boutiqueName || !reason) {
      res.status(400).json({ error: 'Email, boutique name, and rejection reason are required' });
      return;
    }

    // Send rejection email
    const emailSent = await emailService.sendRejectionEmail(email, boutiqueName, reason);
    
    if (!emailSent) {
      res.status(500).json({ error: 'Failed to send rejection email' });
      return;
    }

    // Optionally, save notification record
    const notification = new Notification({
      type: 'email',
      channel: 'email',
      recipientEmail: email,
      subject: 'Boutique Application Decision',
      message: `Your boutique application for "${boutiqueName}" has been rejected. Reason: ${reason}`,
      status: 'sent',
      sentAt: new Date()
    });
    await notification.save();

    res.status(200).json({ 
      success: true, 
      message: 'Rejection email sent successfully' 
    });
    return;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    res.status(500).json({ error: 'Failed to send rejection email' });
    return;
  }
};
