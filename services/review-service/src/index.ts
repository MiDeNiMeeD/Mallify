import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createLogger, errorHandler, notFoundHandler } from '@mallify/shared';
import { connectDatabase } from './config/database';
import reviewRoutes from './routes/review.routes';

const app = express();
const PORT = process.env.PORT || 3010;
const logger = createLogger('review-service');

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'review-service', timestamp: new Date().toISOString(), port: PORT });
});

app.use('/api/reviews', reviewRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => logger.info(`Review Service listening on port ${PORT}`));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
