import { Request, Response } from 'express';
import Message from '../models/Message';

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId, page = 1, limit = 50 } = req.query;
    
    const query: any = {};
    if (conversationId) query.conversationId = conversationId;

    const skip = (Number(page) - 1) * Number(limit);
    
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar');
    
    const total = await Message.countDocuments(query);
    
    res.status(200).json({
      messages: messages.reverse(),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
    return;
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const message = new Message(req.body);
    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar');
    
    res.status(201).json(populatedMessage);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
    return;
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'read',
        readAt: new Date()
      },
      { new: true }
    );
    
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    
    res.status(200).json(message);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark message as read' });
    return;
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    
    res.status(200).json({ message: 'Message deleted successfully' });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
    return;
  }
};
