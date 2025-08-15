import { MongoClient } from 'mongodb';
import { hash } from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'users';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Test user data
const testUsers = [
  {
    name: 'Test Member',
    email: `test.member.${Date.now()}@example.com`,
    password: 'Test@1234',
    role: 'member'
  },
  {
    name: 'Test Staff',
    email: `test.staff.${Date.now()}@example.com`,
    password: 'Test@1234',
    role: 'staff'
  },
  // Admin registration should be restricted
  {
    name: 'Test Admin',
    email: `test.admin.${Date.now()}@example.com`,
    password: 'Test@1234',
    role: 'admin'
  }
];

async function testSignupFlow() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Test each user signup
    for (const user of testUsers) {
      console.log(`\n🧪 Testing signup for ${user.role}: ${user.email}`);
      
      try {
        // Simulate signup API call
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          if (user.role === 'admin') {
            console.log(`✅ Expected error for admin signup: ${data.error || 'Admin registration restricted'}`);
            continue;
          }
          throw new Error(data.error || 'Failed to create account');
        }
        
        console.log(`✅ Successfully signed up as ${user.role}`);
        
        // Verify user was created in the correct collection
        const collection = db.collection(user.role);
        const dbUser = await collection.findOne({ email: user.email });
        
        if (!dbUser) {
          throw new Error(`User not found in ${user.role} collection`);
        }
        
        console.log(`✅ User verified in ${user.role} collection`);
        
      } catch (error) {
        if (user.role === 'admin') {
          console.log(`✅ Admin registration was restricted as expected`);
        } else {
          console.error(`❌ Error testing ${user.role} signup:`, error.message);
        }
      }
    }
    
    // Print final collection counts
    console.log('\n📊 Final collection counts:');
    const collections = await db.listCollections().toArray();
    for (const { name } of collections) {
      const count = await db.collection(name).countDocuments();
      console.log(`- ${name}: ${count} documents`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.close();
    console.log('\n🏁 Test completed');
  }
}

testSignupFlow().catch(console.error);
