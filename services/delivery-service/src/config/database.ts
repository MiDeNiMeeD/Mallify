import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mallify';
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ Delivery Service: MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Delivery Service: MongoDB connection error:', error);
    process.exit(1);
  }
};
