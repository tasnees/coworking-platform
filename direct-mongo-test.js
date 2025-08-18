// Direct MongoDB connection test
const { MongoClient } = require('mongodb');

// Direct MongoDB connection string - replace with your actual connection string
const uri = 'mongodb+srv://grabatassnim:pvsd8mdXyqXKHgiT@cluster0.av4bvfl.mongodb.net/coworking-platform?retryWrites=true&w=majority';

console.log('Testing MongoDB connection...');
console.log('Connection string:', uri.replace(/:([^/]+)@/, ':****@'));

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
    console.log('\n📊 Database name:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections:');
    console.log(collections.map(c => `- ${c.name}`).join('\n') || 'No collections found');
    
    // If users collection exists, count documents
    if (collections.some(c => c.name === 'users')) {
      const count = await db.collection('users').countDocuments();
      console.log(`\n👥 Users collection has ${count} documents`);
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
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

// Run the test
testConnection().catch(console.error);
