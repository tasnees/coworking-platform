// scripts/test-user-creation.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testUserCreation() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  console.log('Connection string:', process.env.MONGODB_URI);

  const client = new MongoClient(process.env.MONGODB_URI, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');

    const db = client.db();
    console.log('Using database:', db.databaseName);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    // Test user data
    const testUser = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      role: 'member',
      createdAt: new Date(),
      status: 'active'
    };

    // Insert test user
    console.log('Inserting test user...');
    const result = await db.collection('users').insertOne(testUser);
    console.log('Insert result:', result);

    if (result.acknowledged && result.insertedId) {
      console.log('Successfully inserted test user with ID:', result.insertedId);
      
      // Verify the user was inserted
      const insertedUser = await db.collection('users').findOne({ _id: result.insertedId });
      console.log('Retrieved user:', insertedUser);
      
      // Clean up
      await db.collection('users').deleteOne({ _id: result.insertedId });
      console.log('Cleaned up test user');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

testUserCreation();
