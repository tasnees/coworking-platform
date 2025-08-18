const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

console.log('🔌 Testing MongoDB connection...');
console.log(`MongoDB URI: ${MONGODB_URI.replace(/:([^:]+)@/, ':*****@')}`);

async function testConnection() {
  const client = new MongoClient(MONGODB_URI, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test database operations
    const db = client.db('coworking-platform');
    
    // Check if users collection exists
    const collections = await db.listCollections().toArray();
    console.log('\n📚 Collections:');
    collections.forEach(col => console.log(`- ${col.name}`));
    
    // Try to find a user
    const users = db.collection('users');
    const user = await users.findOne({});
    
    if (user) {
      console.log('\n👤 Found user:', {
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    } else {
      console.log('\nℹ️ No users found in the database');
    }
    
  } catch (error) {
    console.error('❌ Error during MongoDB connection test:', error);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

testConnection().catch(console.error);
