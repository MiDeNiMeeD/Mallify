// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { createLogger, errorHandler, notFoundHandler } from '@mallify/shared';
import { connectDatabase } from './config/database';
import productRoutes from './routes/product.routes';

const app: Application = express();
const PORT = process.env.PORT || 3002;
const BODY_LIMIT = process.env.BODY_LIMIT || '10mb';
const logger = createLogger('product-service');

// ============================================
// Middleware
// ============================================

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

// Request logging
app.use((req: Request, _res: Response, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ============================================
// Routes
// ============================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'product-service',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Serve uploaded product images before product routes so /uploads/* is not treated as /:id
app.use(
  '/api/products/uploads',
  express.static(path.join(__dirname, '../uploads/products'), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// API routes
app.use('/api/products', productRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Start Server
// ============================================

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Product Service listening on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
