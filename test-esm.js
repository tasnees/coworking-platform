// Test MongoDB connection using ES modules
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env.local') });

console.log('Testing MongoDB connection with ES modules...');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
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
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections:');
    console.log(collections.map(c => `- ${c.name}`).join('\n') || 'No collections found');
    
  } catch (error) {
    console.error('\n❌ Error connecting to MongoDB:');
    console.error(error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n🔍 Possible issues:');
      console.log('- Check your internet connection');
      console.log('- Verify MongoDB Atlas is running');
      console.log('- Check if your IP is whitelisted in MongoDB Atlas');
    }
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection().catch(console.error);
