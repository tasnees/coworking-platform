console.log('=== Starting MongoDB Direct Test ===');

// Simple test script to verify MongoDB connection using ES modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
try {
  dotenv.config({ path: new URL('../.env', import.meta.url) });
  console.log('✅ Environment variables loaded');
} catch (error) {
  console.error('❌ Error loading .env file:', error.message);
  process.exit(1);
}

console.log('=== MongoDB Direct Test ===');
console.log('1. Basic console.log test - if you see this, script is running');
console.log('Current directory:', __dirname);
console.log('Current working directory:', process.cwd());
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'set' : 'not set');

// Test MongoDB connection if URI is available
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment variables');
  process.exit(1);
}

async function testMongoDBConnection() {
  let client;
  
  try {
    console.log('\n=== Testing MongoDB Connection ===');
    
    console.log('2. Creating MongoDB client...');
    client = new MongoClient(process.env.MONGODB_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      family: 4, // Force IPv4
    });
    
    console.log('3. Attempting to connect...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    const db = client.db('coworking-platform');
    console.log(`📊 Using database: ${db.databaseName}`);
    
    console.log('4. Listing collections...');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`);
    collections.forEach(coll => console.log(`   - ${coll.name}`));
    
    // Check if users collection exists
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\n👥 Users in database: ${userCount}`);
    
    if (userCount > 0) {
      console.log('\n📝 Sample user:');
      const sampleUser = await usersCollection.findOne({});
      console.log(JSON.stringify(sampleUser, null, 2));
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
    return { success: false, error: error.message };
  } finally {
    if (client) {
      console.log('\n5. Closing connection...');
      await client.close();
      console.log('✅ Connection closed');
    }
  }
}

// Run the test
(async () => {
  const result = await testMongoDBConnection();
  console.log('\n=== Test completed:', result.success ? '✅ Success' : '❌ Failed ===');
  if (!result.success) {
    process.exit(1);
  }
})();

console.log('=== Test completed ===');
