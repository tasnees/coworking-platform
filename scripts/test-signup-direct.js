// scripts/test-signup-direct.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testSignup() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://grabatassnim:pvsd8mdXyqXKHgiT@cluster0.av4bvfl.mongodb.net/coworking-platform?retryWrites=true&w=majority';
  
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('coworking-platform');
    const users = db.collection('users');
    
    // Test user data
    const testUser = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      role: 'member',
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: null
    };
    
    console.log('Inserting test user...');
    const result = await users.insertOne(testUser);
    console.log('Insert result:', result);
    
    if (result.acknowledged) {
      console.log('Successfully inserted test user with ID:', result.insertedId);
      
      // Verify the user was inserted
      const foundUser = await users.findOne({ _id: result.insertedId });
      console.log('Found user:', foundUser);
      
      // Clean up
      await users.deleteOne({ _id: result.insertedId });
      console.log('Cleaned up test user');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

testSignup();
