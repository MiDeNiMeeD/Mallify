import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Block from '../models/Block';
import { emitToUser, SOCKET_EVENTS } from '../services/emitter.service';

const meId = (req: Request): string => req.chatUser!.id;

export const listBlocks = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const blocks = await Block.find({ blockerId: me }).sort({ createdAt: -1 }).lean();
  res.json({ blocks });
};

export const blockUser = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { userId, reason } = req.body as { userId?: string; reason?: string };
  if (!userId || !Types.ObjectId.isValid(userId) || userId === me) {
    res.status(400).json({ error: 'Invalid userId' });
    return;
  }
  const block = await Block.findOneAndUpdate(
    { blockerId: new Types.ObjectId(me), blockedId: new Types.ObjectId(userId) },
    { $setOnInsert: { reason } },
    { upsert: true, new: true }
  );
  emitToUser(me, SOCKET_EVENTS.BLOCK_UPDATED, { blockedId: userId, blocked: true });
  res.status(201).json({ block });
};

export const unblockUser = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { userId } = req.params;
  if (!Types.ObjectId.isValid(userId)) {
    res.status(400).json({ error: 'Invalid userId' });
    return;
  }
  await Block.deleteOne({ blockerId: new Types.ObjectId(me), blockedId: new Types.ObjectId(userId) });
  emitToUser(me, SOCKET_EVENTS.BLOCK_UPDATED, { blockedId: userId, blocked: false });
  res.json({ success: true });
};

export const checkBlock = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { userId } = req.params;
  if (!Types.ObjectId.isValid(userId)) {
    res.status(400).json({ error: 'Invalid userId' });
    return;
  }
  const [iBlocked, theyBlocked] = await Promise.all([
    Block.exists({ blockerId: me, blockedId: userId }),
    Block.exists({ blockerId: userId, blockedId: me }),
  ]);
  res.json({
    iBlockedThem: !!iBlocked,
    theyBlockedMe: !!theyBlocked,
    anyBlock: !!iBlocked || !!theyBlocked,
  });
};
