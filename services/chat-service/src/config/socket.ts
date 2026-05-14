import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: SocketIOServer | null = null;

export interface AuthedSocketData {
  userId: string;
  email?: string;
  role?: string;
}

export interface AuthedSocket extends Socket {
  data: AuthedSocketData & Socket['data'];
}

export const SOCKET_PATH = process.env.CHAT_SOCKET_PATH || '/api/chat/socket.io';

const verifyToken = (token: string): AuthedSocketData | null => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const decoded = jwt.verify(token, secret) as { id: string; email?: string; role?: string };
    if (!decoded?.id) return null;
    return { userId: decoded.id, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
};

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    path: SOCKET_PATH,
    cors: {
      origin: (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    const headerAuth = (socket.handshake.headers.authorization || '').toString();
    const bearer = headerAuth.startsWith('Bearer ') ? headerAuth.slice(7) : null;
    const tokenFromAuth = (socket.handshake.auth as any)?.token;
    const tokenFromQuery = (socket.handshake.query as any)?.token;
    const token = bearer || tokenFromAuth || tokenFromQuery;

    const headerUserId = (socket.handshake.headers['x-user-id'] || '').toString();

    let payload: AuthedSocketData | null = null;
    if (token) payload = verifyToken(token);
    if (!payload && headerUserId) {
      payload = {
        userId: headerUserId,
        email: (socket.handshake.headers['x-user-email'] || '').toString() || undefined,
        role: (socket.handshake.headers['x-user-role'] || '').toString() || undefined,
      };
    }

    if (!payload) return next(new Error('Unauthorized'));
    socket.data.userId = payload.userId;
    socket.data.email = payload.email;
    socket.data.role = payload.role;
    next();
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
};

export const userRoom = (userId: string): string => `user:${userId}`;
export const conversationRoom = (conversationId: string): string => `conv:${conversationId}`;
