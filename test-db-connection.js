const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://grabatassnim:pvsd8mdXyqXKHgiT@cluster0.av4bvfl.mongodb.net/coworking-platform?retryWrites=true&w=majority';

async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    
    console.log('Successfully connected to MongoDB');
    
    // Check if users collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(coll => console.log(`- ${coll.name}`));
    
    // Count users
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`Total users in database: ${userCount}`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();
