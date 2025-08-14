// scripts/test-registration-api.js
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/auth/register`;

async function testRegistration() {
  console.log('Testing registration API...');
  console.log(`Using API URL: ${API_URL}`);
  
  const testUser = {
    name: 'Test User ' + Math.random().toString(36).substring(2, 8),
    email: `testuser_${Date.now()}@example.com`,
    password: 'Test@1234',
    role: 'member'
  };
  
  console.log('\nTest user data:', JSON.stringify(testUser, null, 2));
  
  try {
    console.log('\nSending registration request...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    const data = await response.json();
    
    console.log('\nResponse status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      throw new Error(`Registration failed with status ${response.status}`);
    }
    
    console.log('\n✅ Registration successful!');
    console.log('User ID:', data.userId);
    
    // Verify the user was created in the database
    console.log('\nVerifying user in database...');
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
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME || 'coworking-platform');
    
    // Check users collection
    const user = await db.collection('users').findOne({ email });
    if (user) {
      console.log('✅ User found in database:');
      console.log(JSON.stringify({
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }, null, 2));
    } else {
      console.log('❌ User not found in database');
    }
    
    // Check members collection
    const member = await db.collection('members').findOne({ email });
    if (member) {
      console.log('✅ Member record found in database');
    } else {
      console.log('❌ Member record not found in database');
    }
    
  } catch (error) {
    console.error('Error verifying user in database:', error.message);
  } finally {
    await client.close();
  }
}

// Run the test
testRegistration().catch(console.error);
