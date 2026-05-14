import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { getOnlineMap, getLastSeen, isOnline } from '../services/presence.service';

export const getPresence = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  if (!Types.ObjectId.isValid(userId)) {
    res.status(400).json({ error: 'Invalid userId' });
    return;
  }
  const [online, lastSeen] = await Promise.all([isOnline(userId), getLastSeen(userId)]);
  res.json({ userId, online, lastSeen });
};

export const getPresenceBatch = async (req: Request, res: Response): Promise<void> => {
  const ids = (req.query.userIds as string)?.split(',').filter(Boolean) || [];
  const valid = ids.filter((id) => Types.ObjectId.isValid(id));
  if (!valid.length) {
    res.json({ presence: {} });
    return;
  }
  const presence = await getOnlineMap(valid);
  res.json({ presence });
};
