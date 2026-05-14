import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mallify';

    await mongoose.connect(mongoUri);

    mongoose.connection.on('disconnected', () => {
      console.warn('Chat Service: MongoDB disconnected');
    });
    mongoose.connection.on('error', (err) => {
      console.error('Chat Service: MongoDB error', err);
    });

    console.log('Chat Service: MongoDB connected');
  } catch (error) {
    console.error('Chat Service: MongoDB connection error:', error);
    process.exit(1);
  }
};
