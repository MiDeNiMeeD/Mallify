import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createLogger, errorHandler, notFoundHandler } from '@mallify/shared';
import { connectDatabase } from './config/database';
import boutiqueRoutes from './routes/boutique.routes';
import applicationRoutes from './routes/application.routes';
import subscriptionRoutes from './routes/subscription.routes';

const app: Application = express();
const PORT = process.env.PORT || 3003;
const logger = createLogger('boutique-service');

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors());

const stripeWebhookPath = '/api/boutiques/subscription/webhook';
app.use(stripeWebhookPath, express.raw({ type: 'application/json' }));

const jsonParser = express.json({ limit: '10mb' });
const urlEncodedParser = express.urlencoded({ extended: true, limit: '10mb' });

app.use((req: Request, res: Response, next) => {
  if (req.path === stripeWebhookPath) {
    next();
    return;
  }
  jsonParser(req, res, next);
});

app.use((req: Request, res: Response, next) => {
  if (req.path === stripeWebhookPath) {
    next();
    return;
  }
  urlEncodedParser(req, res, next);
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(
  '/api/boutiques/uploads',
  express.static(path.join(__dirname, '../uploads/boutiques'), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

app.use((req: Request, _res: Response, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'boutique-service',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Register applicationRoutes BEFORE boutiqueRoutes to prevent /:id from catching /applications
app.use('/api/boutiques', applicationRoutes);
app.use('/api/boutiques', subscriptionRoutes);
app.use('/api/boutiques', boutiqueRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      logger.info(`Boutique Service listening on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
