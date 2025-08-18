// Direct MongoDB connection test
const { MongoClient } = require('mongodb');

// Direct connection string (temporary for testing)
const uri = 'mongodb+srv://grabatassnim:pvsd8mdXyqXKHgiT@cluster0.av4bvfl.mongodb.net/coworking-platform?retryWrites=true&w=majority';

console.log('Testing direct MongoDB connection...');

async function testConnection() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    const db = client.db('coworking-platform');
    console.log('\nDatabase stats:');
    const stats = await db.stats();
    console.log('- Collections:', stats.collections);
    console.log('- Data size:', (stats.dataSize / 1024).toFixed(2), 'KB');
    
    // Check users collection
    const users = db.collection('users');
    const userCount = await users.countDocuments();
    console.log('\n👥 Users collection:');
    console.log('- Total users:', userCount);
    
    if (userCount > 0) {
      const sampleUser = await users.findOne({}, { projection: { _id: 1, email: 1, role: 1 } });
      console.log('\nSample user:', JSON.stringify(sampleUser, null, 2));
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

testConnection().catch(console.error);
