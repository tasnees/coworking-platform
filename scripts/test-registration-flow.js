// scripts/test-registration-flow.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const { hash } = require('bcryptjs');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DATABASE_NAME || 'coworking-platform';

// Test user data
const testUser = {
  name: `Test User ${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'Test@1234',
  role: 'member'
};

async function testRegistrationFlow() {
  console.log('=== Testing Registration Flow ===');
  console.log('MongoDB URI:', MONGODB_URI ? '*** (hidden for security)' : 'Not set');
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    // Step 1: Connect to MongoDB
    console.log('\n1. Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Step 2: Check if user already exists
    console.log(`\n2. Checking if user ${testUser.email} exists...`);
    const existingUser = await db.collection('users').findOne({ email: testUser.email });
    
    if (existingUser) {
      console.log('ℹ️  Test user already exists, cleaning up...');
      await db.collection('users').deleteOne({ _id: existingUser._id });
      console.log('✅ Cleaned up existing test user');
    }
    
    // Step 3: Simulate user registration
    console.log('\n3. Simulating user registration...');
    const hashedPassword = await hash(testUser.password, 12);
    const now = new Date();
    
    const userData = {
      email: testUser.email,
      name: testUser.name,
      password: hashedPassword,
      role: testUser.role,
      emailVerified: null,
      image: null,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    
    // Step 4: Insert user into database
    console.log('\n4. Inserting user into database...');
    const result = await db.collection('users').insertOne(userData);
    console.log(`✅ User inserted with ID: ${result.insertedId}`);
    
    // Step 5: Verify user was inserted
    console.log('\n5. Verifying user in database...');
    const insertedUser = await db.collection('users').findOne({ _id: result.insertedId });
    
    if (insertedUser) {
      console.log('✅ Successfully retrieved inserted user:');
      console.log(JSON.stringify({
        _id: insertedUser._id,
        email: insertedUser.email,
        name: insertedUser.name,
        role: insertedUser.role,
        status: insertedUser.status,
        createdAt: insertedUser.createdAt
      }, null, 2));
      
      // Step 6: Clean up test data
      console.log('\n6. Cleaning up test data...');
      const deleteResult = await db.collection('users').deleteOne({ _id: result.insertedId });
      console.log(`✅ Deleted ${deleteResult.deletedCount} test user`);
      
    } else {
      console.log('❌ Failed to retrieve inserted user');
    }
    
  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error('\n⚠️  Authentication failed. Please check your MongoDB credentials.');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('\n⚠️  Could not connect to MongoDB server. Please check your internet connection and the server status.');
    } else if (error.message.includes('not authorized')) {
      console.error('\n⚠️  Not authorized to access the database. Please check your database user permissions.');
    } else {
      console.error('\n⚠️  An unexpected error occurred:', error);
    }
    
    process.exit(1);
    
  } finally {
    // Close the connection
    if (client) {
      await client.close();
      console.log('\nMongoDB connection closed');
    }
  }
}

// Run the test
testRegistrationFlow()
  .then(() => console.log('\n=== Test completed successfully ==='))
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
