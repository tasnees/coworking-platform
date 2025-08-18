// Minimal MongoDB test script
console.log('Starting minimal MongoDB test...');

// Load environment variables directly from .env.local
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local directly
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Loading environment from: ${envPath}`);

if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
  console.log('Loaded environment variables from .env.local');
} else {
  console.error('❌ .env.local file not found');
  process.exit(1);
}

// Verify MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment variables');
  process.exit(1);
}

console.log('MONGODB_URI found in environment variables');

// Try to connect to MongoDB
const { MongoClient } = require('mongodb');

async function connect() {
  console.log('\nAttempting to connect to MongoDB...');
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // Test the connection
    const db = client.db('coworking-platform');
    console.log('\nDatabase name:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections:');
    console.log(collections.map(c => `- ${c.name}`).join('\n') || 'No collections found');
    
    // If users collection exists, count documents
    if (collections.some(c => c.name === 'users')) {
      const count = await db.collection('users').countDocuments();
      console.log(`\n📊 Users collection has ${count} documents`);
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

// Run the test
connect().catch(console.error);
