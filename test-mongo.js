const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    return;
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    const db = client.db('users');
    console.log('📊 Using database:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('📚 Collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testConnection();
