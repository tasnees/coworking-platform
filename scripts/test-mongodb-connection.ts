import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    
    // Test connection
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // Test database access
    const db = client.db('users');
    console.log('📊 Using database:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📚 Collections in database:', collections.map(c => c.name));
    
    // Test a simple query
    const usersCount = await db.collection('users').countDocuments();
    console.log(`👥 Number of users in collection: ${usersCount}`);
    
    // Test insert and delete
    const testUser = {
      email: 'test@example.com',
      name: 'Test User',
      role: 'member',
      createdAt: new Date(),
    };
    
    const insertResult = await db.collection('users').insertOne(testUser);
    console.log('✅ Test user inserted with ID:', insertResult.insertedId);
    
    const deleteResult = await db.collection('users').deleteOne({ _id: insertResult.insertedId });
    console.log(`🗑️  Test user ${deleteResult.deletedCount > 0 ? 'deleted' : 'not deleted'}`);
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

testConnection().catch(console.error);
