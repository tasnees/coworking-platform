require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ Error: MONGODB_URI is not set in environment variables');
    process.exit(1);
  }

  console.log('🔌 Testing MongoDB connection...');
  console.log('URI:', uri.replace(/:[^:]*@/, ':***@')); // Hide password in logs

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    
    console.log('✅ Successfully connected to MongoDB');
    
    const db = client.db('coworking-platform');
    console.log('🏓 Sending ping command...');
    
    const pingResult = await db.command({ ping: 1 });
    console.log('✅ Ping successful. Server response:', pingResult);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections in database:');
    console.log(collections.map(c => `- ${c.name}`).join('\n') || 'No collections found');
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Error Details:', error.errorResponse || 'No additional details');
    
    if (error.stack) {
      console.error('\nStack Trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testConnection();
