// scripts/test-db.ts
import { MongoClient } from 'mongodb';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined');
    return;
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(process.env.DATABASE_NAME || 'coworking-platform');
    
    // Test reading from users collection
    const users = await db.collection('users').find().limit(5).toArray();
    console.log('\n📋 First 5 users:');
    console.log(users);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testConnection();
