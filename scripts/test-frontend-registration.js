// scripts/test-frontend-registration.js
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const REGISTER_URL = `${BASE_URL}/api/auth/register`;

// Test user data
const testUser = {
  name: `Test User ${Math.random().toString(36).substring(2, 8)}`,
  email: `test_${Date.now()}@example.com`,
  password: 'Test@1234',
  role: 'member' // or 'staff' or 'admin' based on your requirements
};

async function testRegistration() {
  console.log('=== Testing Frontend Registration ===');
  console.log('Using API URL:', REGISTER_URL);
  console.log('Test user email:', testUser.email);
  
  try {
    console.log('\n1. Sending registration request...');
    const response = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    const data = await response.json();
    
    console.log('\n2. Response Status:', response.status);
    console.log('Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      throw new Error(`Registration failed with status ${response.status}`);
    }
    
    console.log('\n✅ Registration successful!');
    console.log('User ID:', data.userId);
    
    // Verify the user was created in the database
    console.log('\n3. Verifying user in database...');
    await verifyUserInDatabase(testUser.email);
    
  } catch (error) {
    console.error('\n❌ Registration test failed:', error.message);
    
    if (error.response) {
      const errorData = await error.response.json();
      console.error('Error details:', errorData);
    }
  }
}

async function verifyUserInDatabase(email) {
  const { MongoClient } = require('mongodb');
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    return;
  }
  
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(process.env.DATABASE_NAME || 'coworking-platform');
    
    // Check users collection
    console.log('\nChecking users collection...');
    const user = await db.collection('users').findOne({ email });
    
    if (user) {
      console.log('✅ User found in database:');
      console.log(JSON.stringify({
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }, null, 2));
    } else {
      console.log('❌ User not found in users collection');
    }
    
    // Check members collection
    console.log('\nChecking members collection...');
    const member = await db.collection('members').findOne({ email });
    
    if (member) {
      console.log('✅ Member found in database:');
      console.log(JSON.stringify({
        _id: member._id,
        userId: member.userId,
        email: member.email,
        name: member.name,
        status: member.status,
        joinDate: member.joinDate
      }, null, 2));
    } else {
      console.log('❌ Member not found in members collection');
    }
    
  } catch (error) {
    console.error('Error verifying user in database:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the test
testRegistration()
  .then(() => console.log('\n=== Test completed ==='))
  .catch(console.error);
