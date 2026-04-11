// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger } from '@mallify/shared';
import { errorHandler, notFoundHandler } from '@mallify/shared';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import passport, { configurePassport } from './config/passport.config';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import authController from './controllers/auth.controller';
import { initializeEmailTransport } from './utils/email';

const app: Application = express();
const PORT = process.env.PORT || 3001;
const logger = createLogger('user-service');
const BODY_LIMIT = process.env.REQUEST_BODY_LIMIT || '5mb';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

// Initialize Passport
configurePassport();
app.use(passport.initialize());

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'user-service',
    timestamp: new Date().toISOString(),
  });
});

// Google OAuth routes
app.get(
  '/api/auth/google',
  (req, res, next) => {
    const isGoogleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    if (!isGoogleConfigured) {
      return res.status(503).json({
        success: false,
        message: 'Google OAuth is not configured on server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in user-service .env',
      });
    }

    const redirectUri = typeof req.query.redirect_uri === 'string' ? req.query.redirect_uri : undefined;
    return passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
      state: redirectUri,
    })(req, res, next);
  }
);
app.get(
  '/api/auth/google/callback',
  (_req, res, next) => {
    const isGoogleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    if (!isGoogleConfigured) {
      return res.status(503).json({
        success: false,
        message: 'Google OAuth is not configured on server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in user-service .env',
      });
    }
    return next();
  },
  passport.authenticate('google', { session: false }),
  authController.googleCallback
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('Connected to MongoDB');

    // Connect to Redis
    await connectRedis();
    logger.info('Connected to Redis');

    // Verify SMTP connection (non-blocking for startup)
    await initializeEmailTransport();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`User service listening on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

startServer();
