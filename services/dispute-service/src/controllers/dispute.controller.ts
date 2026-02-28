import { Request, Response } from 'express';
import Dispute from '../models/Dispute';

export const getDisputes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type, priority, userId, boutiqueId, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (userId) query.userId = userId;
    if (boutiqueId) query.boutiqueId = boutiqueId;

    const skip = (Number(page) - 1) * Number(limit);
    
    const disputes = await Dispute.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email')
      .populate('boutiqueId', 'name')
      .populate('orderId', 'orderNumber total');
    
    const total = await Dispute.countDocuments(query);
    
    res.status(200).json({
      disputes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch disputes' });
    return;
  }
};

export const getDisputeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('boutiqueId', 'name email')
      .populate('orderId', 'orderNumber total items')
      .populate('assignedTo', 'name email')
      .populate('messages.senderId', 'name email');
    
    if (!dispute) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }
    
    res.status(200).json(dispute);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dispute' });
    return;
  }
};

export const createDispute = async (req: Request, res: Response): Promise<void> => {
  try {
    const disputeNumber = `DSP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const dispute = new Dispute({
      ...req.body,
      disputeNumber
    });
    
    await dispute.save();
    
    res.status(201).json(dispute);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to create dispute' });
    return;
  }
};

export const updateDisputeStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!dispute) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }
    
    res.status(200).json(dispute);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update dispute status' });
    return;
  }
};

export const addMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { senderId, senderType, message } = req.body;
    
    const dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }
    
    dispute.messages.push({
      senderId,
      senderType,
      message,
      timestamp: new Date()
    });
    
    await dispute.save();
    
    res.status(200).json(dispute);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to add message' });
    return;
  }
};

export const resolveDispute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { action, amount, description, resolvedBy } = req.body;
    
    const dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }
    
    dispute.status = 'resolved';
    dispute.resolution = {
      action,
      amount,
      description,
      resolvedBy,
      resolvedAt: new Date()
    };
    
    await dispute.save();
    
    res.status(200).json(dispute);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve dispute' });
    return;
  }
};
