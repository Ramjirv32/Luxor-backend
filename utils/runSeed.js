import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedData from './seed.js';

dotenv.config();

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await seedData();
    console.log('Seed completed successfully');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error running seed:', error);
    process.exit(1);
  }
};

runSeed();