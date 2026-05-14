import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import Message, { IAttachment, MessageType } from '../models/Message';
import Conversation, { buildParticipantKey } from '../models/Conversation';
import Block from '../models/Block';
import {
  emitToUser,
  emitToUsers,
  emitToConversation,
  emitMessageEvent,
  SOCKET_EVENTS,
} from '../services/emitter.service';
import {
  emitMessageCreated,
  emitMessageDeleted,
} from '../services/rabbitmq.service';
import { canChatWith } from '../services/chatPolicy.service';

const meId = (req: Request): string => req.chatUser!.id;

const isValid = (id: string): boolean => Types.ObjectId.isValid(id);

const buildPreview = (messageType: MessageType, content: string): string => {
  if (content && messageType === 'text') return content.slice(0, 120);
  switch (messageType) {
    case 'image':
      return '📷 Photo';
    case 'video':
      return '🎬 Video';
    case 'audio':
      return '🎵 Audio';
    case 'voice':
      return '🎙️ Voice message';
    case 'file':
      return '📎 File';
    case 'location':
      return '📍 Location';
    case 'system':
      return content || '';
    default:
      return content?.slice(0, 120) || '';
  }
};

const findOrCreateDirect = async (a: string, b: string) => {
  const key = buildParticipantKey(a, b);
  let conv = await Conversation.findOne({ participantKey: key });
  if (conv) return conv;
  conv = await Conversation.create({
    participants: [new Types.ObjectId(a), new Types.ObjectId(b)],
    participantKey: key,
    state: [
      {
        userId: new Types.ObjectId(a),
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        isMuted: false,
      },
      {
        userId: new Types.ObjectId(b),
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        isMuted: false,
      },
    ],
    lastActivityAt: new Date(),
  });
  return conv;
};

interface SendBody {
  conversationId?: string;
  receiverId?: string;
  messageType?: MessageType;
  content?: string;
  attachments?: IAttachment[];
  replyTo?: string | null;
  clientMessageId?: string;
  metadata?: Record<string, any>;
}

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const body = req.body as SendBody;
  const messageType: MessageType = body.messageType || 'text';
  const content = (body.content || '').toString();
  const attachments = Array.isArray(body.attachments) ? body.attachments : [];

  if (messageType === 'text' && !content.trim()) {
    res.status(400).json({ error: 'Content is required for text messages' });
    return;
  }
  if (messageType !== 'text' && !attachments.length && messageType !== 'location') {
    res.status(400).json({ error: 'Attachments required for non-text messages' });
    return;
  }
  if (body.replyTo && !isValid(body.replyTo)) {
    res.status(400).json({ error: 'Invalid replyTo id' });
    return;
  }

  let conv;
  let receiverId: string | undefined;

  if (body.conversationId) {
    if (!isValid(body.conversationId)) {
      res.status(400).json({ error: 'Invalid conversationId' });
      return;
    }
    conv = await Conversation.findOne({ _id: body.conversationId, participants: me });
    if (!conv) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }
    receiverId = String(conv.participants.find((p) => String(p) !== me));
  } else if (body.receiverId) {
    if (!isValid(body.receiverId) || body.receiverId === me) {
      res.status(400).json({ error: 'Invalid receiverId' });
      return;
    }
    const policy = await canChatWith(req.chatUser?.role || '', me, body.receiverId);
    if (!policy.allowed) {
      res.status(403).json({ error: policy.reason || 'Not allowed' });
      return;
    }
    conv = await findOrCreateDirect(me, body.receiverId);
    receiverId = body.receiverId;
  } else {
    res.status(400).json({ error: 'conversationId or receiverId required' });
    return;
  }

  const block = await Block.findOne({
    $or: [
      { blockerId: me, blockedId: receiverId },
      { blockerId: receiverId, blockedId: me },
    ],
  });
  if (block) {
    res.status(403).json({ error: 'Cannot send: user is blocked' });
    return;
  }

  if (body.clientMessageId) {
    const dup = await Message.findOne({
      conversationId: conv._id,
      senderId: new Types.ObjectId(me),
      clientMessageId: body.clientMessageId,
    });
    if (dup) {
      res.status(200).json({ message: dup, deduplicated: true });
      return;
    }
  }

  const now = new Date();
  const created = await Message.create({
    conversationId: conv._id,
    senderId: new Types.ObjectId(me),
    receiverId: new Types.ObjectId(receiverId!),
    messageType,
    content,
    attachments,
    replyTo: body.replyTo ? new Types.ObjectId(body.replyTo) : null,
    metadata: body.metadata || {},
    clientMessageId: body.clientMessageId,
    readBy: [{ userId: new Types.ObjectId(me), readAt: now }],
  });

  const preview = buildPreview(messageType, content);
  await Conversation.updateOne(
    { _id: conv._id },
    {
      $set: {
        lastMessage: {
          messageId: created._id,
          senderId: new Types.ObjectId(me),
          preview,
          messageType,
          createdAt: now,
        },
        lastActivityAt: now,
      },
      $inc: {
        'state.$[other].unreadCount': 1,
      },
      $unset: {
        'state.$[me].deletedAt': '',
        'state.$[other].deletedAt': '',
      },
    },
    {
      arrayFilters: [
        { 'me.userId': new Types.ObjectId(me) },
        { 'other.userId': new Types.ObjectId(receiverId!) },
      ],
    }
  );

  const populated = await Message.findById(created._id).lean();

  emitMessageEvent(
    String(conv._id),
    [me, receiverId!],
    SOCKET_EVENTS.MESSAGE_NEW,
    { message: populated }
  );
  emitToUsers([me, receiverId!], SOCKET_EVENTS.CONVERSATION_UPDATED, {
    conversationId: String(conv._id),
    lastMessage: {
      messageId: String(created._id),
      senderId: me,
      preview,
      messageType,
      createdAt: now,
    },
  });

  emitMessageCreated({
    messageId: String(created._id),
    conversationId: String(conv._id),
    senderId: me,
    receiverId: receiverId!,
    preview,
    messageType,
    createdAt: now,
  });

  res.status(201).json({ message: populated });
};

export const listMessages = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const conv = req.conversation!;
  const { before, after, limit = '30' } = req.query as Record<string, string>;
  const lim = Math.min(Number(limit) || 30, 100);

  const myState = conv.state.find((s) => String(s.userId) === me);
  const clearedAt = myState?.clearedAt;

  const filter: any = {
    conversationId: conv._id,
    deletedFor: { $ne: new Types.ObjectId(me) },
  };
  if (clearedAt) filter.createdAt = { ...(filter.createdAt || {}), $gt: clearedAt };
  if (before) {
    const d = new Date(before);
    if (!isNaN(d.getTime())) filter.createdAt = { ...(filter.createdAt || {}), $lt: d };
  }
  if (after) {
    const d = new Date(after);
    if (!isNaN(d.getTime())) filter.createdAt = { ...(filter.createdAt || {}), $gt: d };
  }

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(lim + 1)
    .lean();

  const hasMore = messages.length > lim;
  const slice = messages.slice(0, lim);

  res.json({
    messages: slice.reverse(),
    hasMore,
    nextCursor: hasMore ? slice[0].createdAt : null,
  });
};

export const editMessage = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { id } = req.params;
  if (!isValid(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const { content } = req.body as { content?: string };
  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Content required' });
    return;
  }

  const msg = await Message.findOne({
    _id: id,
    senderId: new Types.ObjectId(me),
    isDeletedForEveryone: false,
  });
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  if (msg.messageType !== 'text') {
    res.status(400).json({ error: 'Only text messages can be edited' });
    return;
  }
  const editWindowMs = Number(process.env.CHAT_EDIT_WINDOW_MS || 15 * 60 * 1000);
  if (Date.now() - msg.createdAt.getTime() > editWindowMs) {
    res.status(403).json({ error: 'Edit window has expired' });
    return;
  }

  msg.editHistory.push({ content: msg.content, editedAt: new Date() });
  msg.content = content;
  msg.isEdited = true;
  await msg.save();

  await Conversation.updateOne(
    { _id: msg.conversationId, 'lastMessage.messageId': msg._id },
    {
      $set: {
        'lastMessage.preview': buildPreview('text', content),
      },
    }
  );

  emitMessageEvent(
    String(msg.conversationId),
    [String(msg.senderId), String(msg.receiverId)],
    SOCKET_EVENTS.MESSAGE_EDITED,
    {
      messageId: String(msg._id),
      conversationId: String(msg.conversationId),
      content,
      isEdited: true,
      updatedAt: msg.updatedAt,
    }
  );

  res.json({ message: msg.toObject() });
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { id } = req.params;
  const scope = (req.query.scope as string) || 'me';
  if (!isValid(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }

  const msg = await Message.findById(id);
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  const conv = await Conversation.findOne({ _id: msg.conversationId, participants: me });
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  if (scope === 'everyone') {
    if (String(msg.senderId) !== me) {
      res.status(403).json({ error: 'Only the sender can delete for everyone' });
      return;
    }
    const window = Number(process.env.CHAT_DELETE_EVERYONE_WINDOW_MS || 60 * 60 * 1000);
    if (Date.now() - msg.createdAt.getTime() > window) {
      res.status(403).json({ error: 'Delete-for-everyone window has expired' });
      return;
    }
    msg.isDeletedForEveryone = true;
    msg.content = '';
    msg.attachments = [];
    await msg.save();

    emitMessageEvent(
      String(msg.conversationId),
      [String(msg.senderId), String(msg.receiverId)],
      SOCKET_EVENTS.MESSAGE_DELETED,
      {
        messageId: String(msg._id),
        conversationId: String(msg.conversationId),
        scope: 'everyone',
        deletedBy: me,
      }
    );
    emitMessageDeleted({
      conversationId: String(msg.conversationId),
      messageId: String(msg._id),
      deletedBy: me,
      scope: 'everyone',
    });
    res.json({ success: true, scope: 'everyone' });
    return;
  }

  if (!msg.deletedFor.some((u) => String(u) === me)) {
    msg.deletedFor.push(new Types.ObjectId(me));
    await msg.save();
  }
  emitToUser(me, SOCKET_EVENTS.MESSAGE_DELETED, {
    messageId: String(msg._id),
    conversationId: String(msg.conversationId),
    scope: 'me',
    deletedBy: me,
  });
  res.json({ success: true, scope: 'me' });
};

export const reactToMessage = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { id } = req.params;
  const { emoji } = req.body as { emoji?: string };
  if (!isValid(id) || !emoji) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  const msg = await Message.findOne({ _id: id, isDeletedForEveryone: false });
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  const conv = await Conversation.findOne({ _id: msg.conversationId, participants: me });
  if (!conv) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  msg.reactions = msg.reactions.filter((r) => String(r.userId) !== me);
  msg.reactions.push({
    userId: new Types.ObjectId(me),
    emoji,
    reactedAt: new Date(),
  });
  await msg.save();

  emitMessageEvent(
    String(msg.conversationId),
    [String(msg.senderId), String(msg.receiverId)],
    SOCKET_EVENTS.MESSAGE_REACTION,
    {
      messageId: String(msg._id),
      conversationId: String(msg.conversationId),
      userId: me,
      emoji,
      action: 'add',
    }
  );

  res.json({ message: msg.toObject() });
};

export const removeReaction = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { id } = req.params;
  if (!isValid(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const msg = await Message.findOne({ _id: id });
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  const conv = await Conversation.findOne({ _id: msg.conversationId, participants: me });
  if (!conv) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  msg.reactions = msg.reactions.filter((r) => String(r.userId) !== me);
  await msg.save();

  emitMessageEvent(
    String(msg.conversationId),
    [String(msg.senderId), String(msg.receiverId)],
    SOCKET_EVENTS.MESSAGE_REACTION,
    {
      messageId: String(msg._id),
      conversationId: String(msg.conversationId),
      userId: me,
      action: 'remove',
    }
  );

  res.json({ message: msg.toObject() });
};

export const pinMessage = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { id } = req.params;
  if (!isValid(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const msg = await Message.findOne({ _id: id, isDeletedForEveryone: false });
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  const conv = await Conversation.findOne({ _id: msg.conversationId, participants: me });
  if (!conv) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const newPinned = !msg.isPinned;
  msg.isPinned = newPinned;
  msg.pinnedAt = newPinned ? new Date() : null;
  msg.pinnedBy = newPinned ? new Types.ObjectId(me) : null;
  await msg.save();

  if (newPinned) {
    await Conversation.updateOne(
      { _id: msg.conversationId },
      { $addToSet: { pinnedMessageIds: msg._id } }
    );
  } else {
    await Conversation.updateOne(
      { _id: msg.conversationId },
      { $pull: { pinnedMessageIds: msg._id } }
    );
  }

  emitMessageEvent(
    String(msg.conversationId),
    [String(msg.senderId), String(msg.receiverId)],
    SOCKET_EVENTS.MESSAGE_PINNED,
    {
      messageId: String(msg._id),
      conversationId: String(msg.conversationId),
      isPinned: newPinned,
      pinnedBy: me,
    }
  );

  res.json({ message: msg.toObject() });
};

export const forwardMessage = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { id } = req.params;
  const { targetUserIds = [], targetConversationIds = [] } = req.body as {
    targetUserIds?: string[];
    targetConversationIds?: string[];
  };
  if (!isValid(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const original = await Message.findOne({ _id: id, isDeletedForEveryone: false });
  if (!original) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  const sourceConv = await Conversation.findOne({
    _id: original.conversationId,
    participants: me,
  });
  if (!sourceConv) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const created: any[] = [];

  const sendCopy = async (targetConvId: string, receiverId: string) => {
    if (receiverId === me) return;
    const block = await Block.findOne({
      $or: [
        { blockerId: me, blockedId: receiverId },
        { blockerId: receiverId, blockedId: me },
      ],
    });
    if (block) return;

    const now = new Date();
    const copy = await Message.create({
      conversationId: new Types.ObjectId(targetConvId),
      senderId: new Types.ObjectId(me),
      receiverId: new Types.ObjectId(receiverId),
      messageType: original.messageType,
      content: original.content,
      attachments: original.attachments,
      forwardedFrom: {
        messageId: original._id,
        conversationId: original.conversationId,
        originalSenderId: original.senderId,
      },
      readBy: [{ userId: new Types.ObjectId(me), readAt: now }],
    });

    const preview = buildPreview(original.messageType, original.content);
    await Conversation.updateOne(
      { _id: targetConvId },
      {
        $set: {
          lastMessage: {
            messageId: copy._id,
            senderId: new Types.ObjectId(me),
            preview,
            messageType: original.messageType,
            createdAt: now,
          },
          lastActivityAt: now,
        },
        $inc: { 'state.$[other].unreadCount': 1 },
      },
      {
        arrayFilters: [{ 'other.userId': new Types.ObjectId(receiverId) }],
      }
    );

    emitMessageEvent(
      targetConvId,
      [me, receiverId],
      SOCKET_EVENTS.MESSAGE_NEW,
      { message: copy.toObject() }
    );
    emitToUsers([me, receiverId], SOCKET_EVENTS.CONVERSATION_UPDATED, {
      conversationId: targetConvId,
      lastMessage: {
        messageId: String(copy._id),
        senderId: me,
        preview,
        messageType: original.messageType,
        createdAt: now,
      },
    });
    emitMessageCreated({
      messageId: String(copy._id),
      conversationId: targetConvId,
      senderId: me,
      receiverId,
      preview,
      messageType: original.messageType,
      createdAt: now,
    });

    created.push(copy.toObject());
  };

  for (const uid of targetUserIds) {
    if (!isValid(uid)) continue;
    const conv = await findOrCreateDirect(me, uid);
    await sendCopy(String(conv._id), uid);
  }
  for (const cid of targetConversationIds) {
    if (!isValid(cid)) continue;
    const conv = await Conversation.findOne({ _id: cid, participants: me });
    if (!conv) continue;
    const peer = conv.participants.find((p) => String(p) !== me);
    if (peer) await sendCopy(String(conv._id), String(peer));
  }

  res.status(201).json({ forwarded: created.length, messages: created });
};

export const markDelivered = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { messageIds } = req.body as { messageIds?: string[] };
  if (!Array.isArray(messageIds) || !messageIds.length) {
    res.status(400).json({ error: 'messageIds required' });
    return;
  }
  const validIds = messageIds.filter(isValid).map((m) => new Types.ObjectId(m));
  if (!validIds.length) {
    res.status(400).json({ error: 'No valid ids' });
    return;
  }
  const now = new Date();
  await Message.updateMany(
    {
      _id: { $in: validIds },
      receiverId: new Types.ObjectId(me),
      'deliveredTo.userId': { $ne: new Types.ObjectId(me) },
    },
    { $addToSet: { deliveredTo: { userId: new Types.ObjectId(me), deliveredAt: now } } }
  );

  const delivered = await Message.find({ _id: { $in: validIds } })
    .select('senderId conversationId')
    .lean();
  const bySender: Record<string, { messageIds: string[]; conversationId: string }> = {};
  for (const m of delivered) {
    const sid = String(m.senderId);
    bySender[sid] = bySender[sid] || { messageIds: [], conversationId: String(m.conversationId) };
    bySender[sid].messageIds.push(String(m._id));
  }
  for (const [sid, group] of Object.entries(bySender)) {
    emitToUser(sid, SOCKET_EVENTS.MESSAGE_DELIVERED, {
      conversationId: group.conversationId,
      receiverId: me,
      messageIds: group.messageIds,
      deliveredAt: now,
    });
  }
  res.json({ success: true, delivered: validIds.length });
};

export const searchMessages = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { q, conversationId, limit = '20' } = req.query as Record<string, string>;
  const lim = Math.min(Number(limit) || 20, 100);
  if (!q || q.trim().length < 1) {
    res.json({ messages: [] });
    return;
  }

  const convFilter: any = { participants: new Types.ObjectId(me) };
  if (conversationId && isValid(conversationId)) convFilter._id = new Types.ObjectId(conversationId);
  const convs = await Conversation.find(convFilter).select('_id').lean();
  if (!convs.length) {
    res.json({ messages: [] });
    return;
  }

  const messages = await Message.find({
    conversationId: { $in: convs.map((c) => c._id) },
    isDeletedForEveryone: false,
    deletedFor: { $ne: new Types.ObjectId(me) },
    content: { $regex: q, $options: 'i' },
  })
    .sort({ createdAt: -1 })
    .limit(lim)
    .lean();

  res.json({ messages });
};

export const getMessage = async (req: Request, res: Response): Promise<void> => {
  const me = meId(req);
  const { id } = req.params;
  if (!isValid(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const msg = await Message.findOne({ _id: id, deletedFor: { $ne: new Types.ObjectId(me) } });
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  const conv = await Conversation.findOne({ _id: msg.conversationId, participants: me });
  if (!conv) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  res.json({ message: msg.toObject() });
};
