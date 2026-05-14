import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Report from '../models/Report';
import Message from '../models/Message';

const meId = (req: Request): string => req.chatUser!.id;

const VALID_REASONS = [
  'spam',
  'harassment',
  'hate_speech',
  'nudity',
  'violence',
  'scam',
  'illegal',
  'other',
];

export const reportContent = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { messageId, reportedUserId, reason, description } = req.body as {
    messageId?: string;
    reportedUserId?: string;
    reason?: string;
    description?: string;
  };

  if (!reason || !VALID_REASONS.includes(reason)) {
    res.status(400).json({ error: 'Invalid reason' });
    return;
  }

  let conversationId: Types.ObjectId | undefined;
  let resolvedReportedUserId = reportedUserId;

  if (messageId) {
    if (!Types.ObjectId.isValid(messageId)) {
      res.status(400).json({ error: 'Invalid messageId' });
      return;
    }
    const msg = await Message.findById(messageId).lean();
    if (!msg) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    conversationId = msg.conversationId;
    resolvedReportedUserId = resolvedReportedUserId || String(msg.senderId);
  }

  if (!resolvedReportedUserId || !Types.ObjectId.isValid(resolvedReportedUserId)) {
    res.status(400).json({ error: 'reportedUserId required' });
    return;
  }
  if (resolvedReportedUserId === me) {
    res.status(400).json({ error: 'Cannot report yourself' });
    return;
  }

  const report = await Report.create({
    reporterId: new Types.ObjectId(me),
    reportedUserId: new Types.ObjectId(resolvedReportedUserId),
    messageId: messageId ? new Types.ObjectId(messageId) : undefined,
    conversationId,
    reason,
    description,
  });
  res.status(201).json({ report });
};

export const listMyReports = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const reports = await Report.find({ reporterId: me }).sort({ createdAt: -1 }).lean();
  res.json({ reports });
};
