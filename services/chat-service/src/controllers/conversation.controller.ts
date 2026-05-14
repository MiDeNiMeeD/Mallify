import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import Conversation, { buildParticipantKey } from '../models/Conversation';
import Message from '../models/Message';
import Block from '../models/Block';
import { emitToUser, emitToUsers, SOCKET_EVENTS } from '../services/emitter.service';
import { emitConversationCreated } from '../services/rabbitmq.service';
import { getOnlineMap } from '../services/presence.service';
import { canChatWith } from '../services/chatPolicy.service';

const meId = (req: Request): string => req.chatUser!.id;

const ensureValidObjectId = (id: string, res: Response): boolean => {
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return false;
  }
  return true;
};

const initialState = (userId: string) => ({
  userId: new Types.ObjectId(userId),
  unreadCount: 0,
  isPinned: false,
  isArchived: false,
  isMuted: false,
  mutedUntil: null,
  deletedAt: null,
  clearedAt: null,
});

const getOrCreateDirect = async (a: string, b: string) => {
  const key = buildParticipantKey(a, b);
  const existing = await Conversation.findOne({ participantKey: key });
  if (existing) return { conv: existing, created: false };

  const conv = await Conversation.create({
    participants: [new Types.ObjectId(a), new Types.ObjectId(b)],
    participantKey: key,
    state: [initialState(a), initialState(b)],
    lastActivityAt: new Date(),
  });
  return { conv, created: true };
};

export const openOrCreateConversation = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { userId: peerId } = req.body;
  if (!peerId || !ensureValidObjectId(peerId, res)) return;
  if (peerId === me) {
    res.status(400).json({ error: 'Cannot start a conversation with yourself' });
    return;
  }

  const block = await Block.findOne({
    $or: [
      { blockerId: me, blockedId: peerId },
      { blockerId: peerId, blockedId: me },
    ],
  });
  if (block) {
    res.status(403).json({ error: 'Conversation not allowed: user is blocked' });
    return;
  }

  const policy = await canChatWith(req.chatUser?.role || '', me, peerId);
  if (!policy.allowed) {
    res.status(403).json({ error: policy.reason || 'Not allowed' });
    return;
  }

  const { conv, created } = await getOrCreateDirect(me, peerId);
  if (created) {
    emitConversationCreated({
      conversationId: String(conv._id),
      participants: [me, peerId],
      createdBy: me,
    });
    emitToUsers([me, peerId], SOCKET_EVENTS.CONVERSATION_NEW, {
      conversationId: String(conv._id),
    });
  }
  res.status(created ? 201 : 200).json({ conversation: shapeForUser(conv, me) });
};

const shapeForUser = (conv: any, userId: string) => {
  const state = (conv.state || []).find((s: any) => String(s.userId) === userId) || {};
  const peer = conv.participants.find((p: any) => String(p) !== userId);
  return {
    id: String(conv._id),
    participants: conv.participants.map(String),
    peerId: peer ? String(peer) : null,
    lastMessage: conv.lastMessage || null,
    lastActivityAt: conv.lastActivityAt,
    unreadCount: state.unreadCount || 0,
    lastReadAt: state.lastReadAt || null,
    isPinned: !!state.isPinned,
    isArchived: !!state.isArchived,
    isMuted: !!state.isMuted,
    mutedUntil: state.mutedUntil || null,
    pinnedMessageIds: (conv.pinnedMessageIds || []).map((p: any) => String(p)),
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  };
};

export const listConversations = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { archived, limit = '30', cursor } = req.query as Record<string, string>;
  const lim = Math.min(Number(limit) || 30, 100);

  const filter: any = {
    participants: me,
    state: {
      $elemMatch: {
        userId: new Types.ObjectId(me),
        deletedAt: null,
        isArchived: archived === 'true',
      },
    },
  };
  if (cursor) {
    const cursorDate = new Date(cursor);
    if (!isNaN(cursorDate.getTime())) filter.lastActivityAt = { $lt: cursorDate };
  }

  const conversations = await Conversation.find(filter)
    .sort({ 'state.isPinned': -1, lastActivityAt: -1 })
    .limit(lim + 1)
    .lean();

  const hasMore = conversations.length > lim;
  const slice = conversations.slice(0, lim);
  const nextCursor = hasMore ? slice[slice.length - 1].lastActivityAt : null;

  const peerIds = slice
    .map((c) => c.participants.find((p: any) => String(p) !== me))
    .filter(Boolean)
    .map(String);
  const presence = await getOnlineMap(peerIds);

  res.json({
    conversations: slice.map((c) => ({
      ...shapeForUser(c, me),
      peerPresence: presence[String(c.participants.find((p: any) => String(p) !== me))] || {
        online: false,
        lastSeen: null,
      },
    })),
    nextCursor,
    hasMore,
  });
};

export const getConversation = async (req: Request, res: Response): Promise<void> => {
  res.json({ conversation: shapeForUser(req.conversation!.toObject(), meId(req)) });
};

const updateMyState = async (
  conversationId: string,
  userId: string,
  patch: Record<string, any>
): Promise<any> => {
  const set: Record<string, any> = {};
  for (const [k, v] of Object.entries(patch)) {
    set[`state.$.${k}`] = v;
  }
  const conv = await Conversation.findOneAndUpdate(
    { _id: conversationId, 'state.userId': new Types.ObjectId(userId) },
    { $set: set },
    { new: true }
  );
  return conv;
};

export const togglePin = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const conv = req.conversation!;
  const my = conv.state.find((s) => String(s.userId) === me);
  if (!my) {
    res.status(404).json({ error: 'State not found' });
    return;
  }
  const newPinned = !my.isPinned;
  const updated = await updateMyState(String(conv._id), me, {
    isPinned: newPinned,
    pinnedAt: newPinned ? new Date() : null,
  });
  res.json({ conversation: shapeForUser(updated!.toObject(), me) });
};

export const toggleArchive = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const conv = req.conversation!;
  const my = conv.state.find((s) => String(s.userId) === me);
  if (!my) {
    res.status(404).json({ error: 'State not found' });
    return;
  }
  const newArchived = !my.isArchived;
  const updated = await updateMyState(String(conv._id), me, {
    isArchived: newArchived,
    archivedAt: newArchived ? new Date() : null,
  });
  res.json({ conversation: shapeForUser(updated!.toObject(), me) });
};

export const toggleMute = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const conv = req.conversation!;
  const my = conv.state.find((s) => String(s.userId) === me);
  if (!my) {
    res.status(404).json({ error: 'State not found' });
    return;
  }
  const { durationHours } = req.body as { durationHours?: number };
  const newMuted = !my.isMuted;
  const mutedUntil = newMuted && durationHours ? new Date(Date.now() + durationHours * 3600_000) : null;
  const updated = await updateMyState(String(conv._id), me, {
    isMuted: newMuted,
    mutedUntil,
  });
  res.json({ conversation: shapeForUser(updated!.toObject(), me) });
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const conv = req.conversation!;
  const now = new Date();

  const unread = await Message.find({
    conversationId: conv._id,
    senderId: { $ne: new Types.ObjectId(me) },
    isDeletedForEveryone: false,
    'readBy.userId': { $ne: new Types.ObjectId(me) },
  })
    .select('_id senderId')
    .lean();

  if (unread.length) {
    await Message.updateMany(
      {
        _id: { $in: unread.map((m) => m._id) },
      },
      {
        $addToSet: {
          readBy: { userId: new Types.ObjectId(me), readAt: now },
        },
      }
    );
  }

  const updated = await updateMyState(String(conv._id), me, {
    unreadCount: 0,
    lastReadAt: now,
  });

  if (unread.length) {
    const messageIds = unread.map((m) => String(m._id));
    const peerId = conv.participants.find((p) => String(p) !== me);
    const targets = peerId ? [me, String(peerId)] : [me];
    emitToUsers(targets, SOCKET_EVENTS.MESSAGE_READ, {
      conversationId: String(conv._id),
      readerId: me,
      messageIds,
      readAt: now,
    });
  }

  res.json({
    conversation: updated ? shapeForUser(updated.toObject(), me) : null,
    markedCount: unread.length,
  });
};

export const clearHistory = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const conv = req.conversation!;
  const now = new Date();
  await Message.updateMany(
    { conversationId: conv._id, deletedFor: { $ne: new Types.ObjectId(me) } },
    { $addToSet: { deletedFor: new Types.ObjectId(me) } }
  );
  const updated = await updateMyState(String(conv._id), me, {
    clearedAt: now,
    unreadCount: 0,
  });
  emitToUser(me, SOCKET_EVENTS.CONVERSATION_CLEARED, {
    conversationId: String(conv._id),
  });
  res.json({ conversation: updated ? shapeForUser(updated.toObject(), me) : null });
};

export const deleteConversation = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const conv = req.conversation!;
  const now = new Date();
  await Message.updateMany(
    { conversationId: conv._id, deletedFor: { $ne: new Types.ObjectId(me) } },
    { $addToSet: { deletedFor: new Types.ObjectId(me) } }
  );
  await updateMyState(String(conv._id), me, {
    deletedAt: now,
    unreadCount: 0,
  });
  res.json({ success: true });
};

export const listPinnedMessages = async (req: Request, res: Response): Promise<void> => {
  const conv = req.conversation!;
  const me = meId(req);
  const messages = await Message.find({
    _id: { $in: conv.pinnedMessageIds },
    isDeletedForEveryone: false,
    deletedFor: { $ne: new Types.ObjectId(me) },
  })
    .sort({ pinnedAt: -1 })
    .lean();
  res.json({ messages });
};
