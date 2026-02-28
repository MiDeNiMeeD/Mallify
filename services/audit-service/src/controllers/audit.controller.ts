import { Request, Response } from 'express';
import AuditLog from '../models/AuditLog';

export const createAuditLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const log = new AuditLog(req.body);
    await log.save();
    
    res.status(201).json({ message: 'Audit log created successfully' });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to create audit log' });
    return;
  }
};

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, action, resource, status, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const query: any = {};
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email');
    
    const total = await AuditLog.countDocuments(query);
    
    res.status(200).json({
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
    return;
  }
};

export const getAuditLogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('userId', 'name email');
    
    if (!log) {
      res.status(404).json({ error: 'Audit log not found' });
      return;
    }
    
    res.status(200).json(log);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit log' });
    return;
  }
};
