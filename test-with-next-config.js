// Test MongoDB connection using Next.js configuration
const { loadEnvConfig } = require('@next/env');
const { MongoClient } = require('mongodb');

console.log('Testing MongoDB connection with Next.js config...');

// Load environment variables the same way Next.js does
const projectDir = process.cwd();
const { combinedEnv } = loadEnvConfig(projectDir);

// Get MongoDB URI from environment
const uri = combinedEnv.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.log('Make sure you have a .env.local file in your project root');
  process.exit(1);
}

console.log('MongoDB URI:', uri.replace(/:([^/]+)@/, ':****@'));

async function testConnection() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });

  try {
    console.log('\nConnecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    const db = client.db('coworking-platform');
    console.log('\nDatabase name:', db.databaseName);
    
    // Test the connection with a ping
    const ping = await db.command({ ping: 1 });
    console.log('\nPing result:', ping);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections:');
    console.log(collections.map(c => `- ${c.name}`).join('\n') || 'No collections found');
    
    // If users collection exists, count documents
    if (collections.some(c => c.name === 'users')) {
      const count = await db.collection('users').countDocuments();
      console.log(`\n👥 Users collection has ${count} documents`);
      
      if (count > 0) {
        const sampleUser = await db.collection('users').findOne({}, { 
          projection: { _id: 1, email: 1, role: 1, createdAt: 1 } 
        });
        console.log('\nSample user:', JSON.stringify(sampleUser, null, 2));
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error connecting to MongoDB:');
    console.error(error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n🔍 Possible issues:');
      console.log('- Check your internet connection');
      console.log('- Verify MongoDB Atlas is running');
      console.log('- Check if your IP is whitelisted in MongoDB Atlas');
      console.log('- Verify your connection string is correct');
    }
    
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection().catch(console.error);
