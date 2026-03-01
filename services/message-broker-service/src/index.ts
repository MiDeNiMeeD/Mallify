import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger } from '@mallify/shared';
import RabbitMQConnection from './config/rabbitmq';
import messageRoutes from './routes/message.routes';

const logger = createLogger('message-broker-service');

const app: Application = express();
const PORT = process.env.PORT || 3016;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
  });
  next();
});

// Routes
app.use('/api/messages', messageRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Message Broker Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      publish: 'POST /api/messages/publish',
      createQueue: 'POST /api/messages/queue',
      bindQueue: 'POST /api/messages/bind',
      getQueueInfo: 'GET /api/messages/queue/:queue',
      deleteQueue: 'DELETE /api/messages/queue/:queue',
      purgeQueue: 'POST /api/messages/queue/:queue/purge',
      health: 'GET /api/messages/health',
    },
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const rabbitmq = RabbitMQConnection.getInstance();
  const isConnected = rabbitmq.isConnected();

  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? 'healthy' : 'unhealthy',
    service: 'message-broker-service',
    rabbitmq: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Initialize RabbitMQ connection and start server
const startServer = async () => {
  try {
    // Connect to RabbitMQ
    logger.info('Connecting to RabbitMQ...');
    const rabbitmq = RabbitMQConnection.getInstance();
    await rabbitmq.connect();
    logger.info('RabbitMQ connection established');

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Message Broker Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    const rabbitmq = RabbitMQConnection.getInstance();
    await rabbitmq.close();
    logger.info('RabbitMQ connection closed');

    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();

export default app;
