import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';

import { connectDatabase } from './config/database';
import { getRedis, closeRedis } from './config/redis';
import { initRabbit, closeRabbit } from './config/rabbitmq';
import { initSocket, SOCKET_PATH } from './config/socket';
import { registerSocketHandlers } from './services/socket.service';
import { CHAT_UPLOAD_ROOT } from './config/upload';

import conversationRoutes from './routes/conversation.routes';
import messageRoutes from './routes/message.routes';
import blockRoutes from './routes/block.routes';
import presenceRoutes from './routes/presence.routes';
import uploadRoutes from './routes/upload.routes';
import reportRoutes from './routes/report.routes';
import contactsRoutes from './routes/contacts.routes';

const app = express();
const PORT = Number(process.env.PORT || 3009);

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Email', 'X-User-Role'],
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use('/api/chat/uploads', (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use(
  '/api/chat/uploads',
  express.static(CHAT_UPLOAD_ROOT, { maxAge: '30d', immutable: true })
);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'chat-service',
    port: PORT,
    socketPath: SOCKET_PATH,
  });
});

app.use('/api/chat/conversations', conversationRoutes);
app.use('/api/chat/messages', messageRoutes);
app.use('/api/chat/blocks', blockRoutes);
app.use('/api/chat/presence', presenceRoutes);
app.use('/api/chat/attachments', uploadRoutes);
app.use('/api/chat/reports', reportRoutes);
app.use('/api/chat/contacts', contactsRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Chat Service: error', err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

const httpServer = http.createServer(app);

const start = async () => {
  await connectDatabase();
  getRedis();
  await initRabbit();

  const io = initSocket(httpServer);
  registerSocketHandlers(io);

  httpServer.listen(PORT, () => {
    console.log(`Chat Service listening on :${PORT}`);
    console.log(`Socket.io path: ${SOCKET_PATH}`);
    console.log(`Uploads dir: ${CHAT_UPLOAD_ROOT}`);
  });
};

const shutdown = async (signal: string) => {
  console.log(`Chat Service: received ${signal}, shutting down`);
  httpServer.close();
  try {
    await closeRabbit();
    await closeRedis();
  } catch (err) {
    console.error('Chat Service: shutdown error', err);
  }
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (err) => console.error('Unhandled rejection', err));
process.on('uncaughtException', (err) => console.error('Uncaught exception', err));

start().catch((err) => {
  console.error('Chat Service: failed to start', err);
  process.exit(1);
});
