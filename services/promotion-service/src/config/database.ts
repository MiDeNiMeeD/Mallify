import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mallify';
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ Promotion Service: MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Promotion Service: MongoDB connection error:', error);
    process.exit(1);
  }
};
