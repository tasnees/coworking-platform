// scripts/test-e2e-registration.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const { hash } = require('bcryptjs');
const fetch = require('node-fetch');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DATABASE_NAME || 'coworking-platform';
const API_URL = process.env.NEXTAUTH_URL ? 
  `${process.env.NEXTAUTH_URL}/api/auth/register` : 
  'http://localhost:3000/api/auth/register';

// Test user data
const testUser = {
  name: `E2E Test User ${Date.now()}`,
  email: `e2e_test_${Date.now()}@example.com`,
  password: 'E2ETest@1234',
  role: 'member'
};

async function testEndToEndRegistration() {
  console.log('=== Testing End-to-End Registration ===');
  console.log('API URL:', API_URL);
  console.log('Test user email:', testUser.email);
  
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
    
    // Step 2: Clean up any existing test user
    console.log('\n2. Cleaning up any existing test user...');
    await db.collection('users').deleteOne({ email: testUser.email });
    console.log('✅ Cleanup complete');
    
    // Step 3: Call the registration API
    console.log('\n3. Calling registration API...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    const responseData = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('API Response:', JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${responseData.error || 'Unknown error'}`);
    }
    
    // Step 4: Verify user was created in the database
    console.log('\n4. Verifying user in database...');
    const user = await db.collection('users').findOne({ email: testUser.email });
    
    if (!user) {
      throw new Error('User was not created in the database');
    }
    
    console.log('✅ User found in database:');
    console.log(JSON.stringify({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    }, null, 2));
    
    // Step 5: Verify member record was created
    console.log('\n5. Verifying member record...');
    const member = await db.collection('members').findOne({ email: testUser.email });
    
    if (!member) {
      console.warn('⚠️  Member record not found in database');
    } else {
      console.log('✅ Member record found:');
      console.log(JSON.stringify({
        _id: member._id,
        userId: member.userId,
        email: member.email,
        name: member.name,
        status: member.status,
        joinDate: member.joinDate
      }, null, 2));
    }
    
    console.log('\n✅ End-to-end registration test completed successfully!');
    
    return {
      success: true,
      userId: user._id,
      email: user.email
    };
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      const errorData = await error.response.json();
      console.error('Error details:', errorData);
    }
    
    throw error;
    
  } finally {
    // Step 6: Clean up test data
    console.log('\n6. Cleaning up test data...');
    try {
      if (client) {
        await db.collection('users').deleteOne({ email: testUser.email });
        await db.collection('members').deleteOne({ email: testUser.email });
        await client.close();
        console.log('✅ Cleanup complete');
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError.message);
    }
    
    console.log('\nMongoDB connection closed');
  }
}

// Run the test
testEndToEndRegistration()
  .then(result => {
    console.log('\n=== Test Summary ===');
    console.log(`✅ Successfully registered user: ${result.email}`);
    console.log('User ID:', result.userId);
    console.log('\n=== End-to-End Registration Test Passed! ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n=== Test Failed ===');
    console.error('Error:', error.message);
    process.exit(1);
  });
