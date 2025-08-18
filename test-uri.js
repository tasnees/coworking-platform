// Test script to verify MongoDB URI loading
require('dotenv').config({ path: '.env.local' });

console.log('MONGODB_URI from .env.local:', process.env.MONGODB_URI ? '*** (set)' : 'not set');

// Try to connect to MongoDB
const { MongoClient } = require('mongodb');

async function testConnection() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in environment variables');
    return;
  }

  console.log('\n🔌 Attempting to connect to MongoDB...');
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // Test the connection
    const db = client.db('coworking-platform');
    const collections = await db.listCollections().toArray();
    console.log('\n📂 Collections:');
    console.log(collections.map(c => `- ${c.name}`).join('\n') || 'No collections found');
    
  } catch (error) {
    console.error('\n❌ Error connecting to MongoDB:');
    console.error(error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n🔍 Possible issues:');
      console.log('- Check your internet connection');
      console.log('- Verify the MongoDB server is running');
      console.log('- Check if your IP is whitelisted in MongoDB Atlas');
    }
  } finally {
    await client.close();
  }
}

testConnection();
