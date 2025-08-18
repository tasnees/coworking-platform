console.log('Testing MongoDB connection...');

// Load environment variables
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in environment variables');
    return;
  }

  console.log('MongoDB URI:', process.env.MONGODB_URI.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+@/, '$1***@'));
  
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    console.log('\n🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');

    const db = client.db('coworking-platform');
    console.log('\n📊 Database:', db.databaseName);

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\n📂 Collections:', collections.length ? collections.map(c => c.name).join(', ') : 'None');

    // Check users collection
    const users = db.collection('users');
    const userCount = await users.countDocuments();
    console.log('\n👥 Users count:', userCount);

    if (userCount > 0) {
      console.log('\n📝 Sample user (excluding password hash):');
      const sampleUser = await users.findOne({}, { projection: { password: 0 } });
      console.log(JSON.stringify(sampleUser, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.syscall === 'getaddrinfo') {
      console.log('\n🔍 Troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify MongoDB Atlas IP whitelist includes your current IP');
      console.log('3. Check if the MongoDB URI is correct');
    }
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection().catch(console.error);
