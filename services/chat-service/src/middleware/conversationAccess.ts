import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Types } from 'mongoose';
import Conversation, { IConversation } from '../models/Conversation';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      conversation?: IConversation;
    }
  }
}

export const loadConversation = (paramName = 'id'): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.chatUser?.id;
    const conversationId = req.params[paramName] || (req.body?.conversationId as string);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!conversationId || !Types.ObjectId.isValid(conversationId)) {
      res.status(400).json({ error: 'Invalid conversation id' });
      return;
    }

    try {
      const conv = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });
      if (!conv) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }
      req.conversation = conv;
      next();
    } catch (err) {
      res.status(500).json({ error: 'Failed to load conversation' });
    }
  };
};
