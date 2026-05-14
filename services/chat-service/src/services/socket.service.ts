import { Server as SocketIOServer } from 'socket.io';
import { conversationRoom, userRoom, AuthedSocket } from '../config/socket';
import { addSocket, removeSocket, touchLastSeen } from './presence.service';
import { emitToUser, SOCKET_EVENTS } from './emitter.service';
import Conversation from '../models/Conversation';
import Block from '../models/Block';

export const registerSocketHandlers = (io: SocketIOServer): void => {
  io.on('connection', async (raw) => {
    const socket = raw as AuthedSocket;
    const userId = socket.data.userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    await socket.join(userRoom(userId));
    const previousCount = await addSocket(userId, socket.id);
    if (previousCount === 1) {
      const peers = await peerUserIds(userId);
      for (const p of peers) emitToUser(p, SOCKET_EVENTS.PRESENCE_ONLINE, { userId });
    }

    socket.on('conversation:join', async (conversationId: string, ack?: (ok: boolean) => void) => {
      try {
        const conv = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        }).lean();
        if (!conv) return ack?.(false);
        await socket.join(conversationRoom(conversationId));
        ack?.(true);
      } catch {
        ack?.(false);
      }
    });

    socket.on('conversation:leave', async (conversationId: string) => {
      await socket.leave(conversationRoom(conversationId));
    });

    socket.on(
      'typing:start',
      async (payload: { conversationId: string }) => {
        if (!payload?.conversationId) return;
        const conv = await Conversation.findOne({
          _id: payload.conversationId,
          participants: userId,
        }).lean();
        if (!conv) return;
        const otherId = conv.participants.find((p: any) => String(p) !== userId);
        if (otherId) {
          emitToUser(String(otherId), SOCKET_EVENTS.TYPING_START, {
            conversationId: payload.conversationId,
            userId,
          });
        }
      }
    );

    socket.on(
      'typing:stop',
      async (payload: { conversationId: string }) => {
        if (!payload?.conversationId) return;
        const conv = await Conversation.findOne({
          _id: payload.conversationId,
          participants: userId,
        }).lean();
        if (!conv) return;
        const otherId = conv.participants.find((p: any) => String(p) !== userId);
        if (otherId) {
          emitToUser(String(otherId), SOCKET_EVENTS.TYPING_STOP, {
            conversationId: payload.conversationId,
            userId,
          });
        }
      }
    );

    socket.on('presence:ping', async () => {
      await touchLastSeen(userId);
    });

    socket.on('disconnect', async () => {
      const remaining = await removeSocket(userId, socket.id);
      await touchLastSeen(userId);
      if (remaining === 0) {
        const peers = await peerUserIds(userId);
        for (const p of peers)
          emitToUser(p, SOCKET_EVENTS.PRESENCE_OFFLINE, { userId, lastSeen: Date.now() });
      }
    });
  });
};

const peerUserIds = async (userId: string): Promise<string[]> => {
  const convs = await Conversation.find({ participants: userId })
    .select('participants')
    .lean();
  const peerSet = new Set<string>();
  for (const c of convs) {
    for (const p of c.participants) {
      const s = String(p);
      if (s !== userId) peerSet.add(s);
    }
  }
  if (!peerSet.size) return [];
  const blocks = await Block.find({
    $or: [
      { blockerId: userId, blockedId: { $in: Array.from(peerSet) } },
      { blockerId: { $in: Array.from(peerSet) }, blockedId: userId },
    ],
  })
    .select('blockerId blockedId')
    .lean();
  for (const b of blocks) {
    peerSet.delete(String(b.blockerId) === userId ? String(b.blockedId) : String(b.blockerId));
  }
  return Array.from(peerSet);
};
