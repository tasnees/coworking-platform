console.log('🔍 Starting simple MongoDB connection test...');

// Load environment variables
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env.local');
    return;
  }

  console.log('🔗 Found MONGODB_URI');
  
  // Basic connection test
  const client = new MongoClient(uri, { 
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000
  });

  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test database access
    const db = client.db('coworking-platform');
    console.log(`📊 Using database: ${db.databaseName}`);
    
    // Try to list collections
    const collections = await db.listCollections().toArray();
    console.log('📂 Collections in database:');
    collections.forEach(coll => console.log(`   - ${coll.name}`));
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testConnection().catch(console.error);
