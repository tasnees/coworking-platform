const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI;
    console.log('Using connection string:', mongoURI ? '*** (exists) ***' : 'NOT FOUND');
    
    if (!mongoURI) {
      console.error('Error: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    const options = {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
    };

    console.log('Connection options:', JSON.stringify(options, null, 2));
    
    // Set mongoose debug mode
    mongoose.set('debug', true);
    
    // Try to connect
    await mongoose.connect(mongoURI, options);
    console.log('✅ Successfully connected to MongoDB');
    
    // If we get here, connection was successful
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    
    // Additional debug information
    console.log('\n--- Debug Info ---');
    console.log('Node.js version:', process.version);
    console.log('Mongoose version:', require('mongoose/package.json').version);
    console.log('MongoDB URI starts with:', process.env.MONGODB_URI?.substring(0, 30) + '...');
    
    process.exit(1);
  }
}

testConnection();
