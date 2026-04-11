import mongoose from 'mongoose';
import { createLogger } from '@mallify/shared';

const logger = createLogger('cart-db');

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        'mongodb://mallify:mallify_password@localhost:27017/mallify?authSource=admin'
    );
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};
