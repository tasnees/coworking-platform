// Simple MongoDB connection test
console.log('Starting MongoDB connection test...');

const { MongoClient } = require('mongodb');

// Get MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Log masked URI (hides password)
console.log('MongoDB URI:', uri.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+@/, '$1***@'));

// Create a new MongoClient with connection options
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  maxPoolSize: 1
});

async function testConnection() {
  try {
    console.log('\n🔌 Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');

    // Test the connection
    console.log('\n🏓 Pinging the database...');
    await client.db('coworking-platform').command({ ping: 1 });
    console.log('✅ Database ping successful');

    // List collections
    console.log('\n📂 Listing collections...');
    const collections = await client.db('coworking-platform').listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name).join(', ') || 'No collections found');

    // Check users collection
    if (collections.some(c => c.name === 'users')) {
      const users = client.db('coworking-platform').collection('users');
      const count = await users.countDocuments();
      console.log(`\n👥 Found ${count} users in the database`);
      
      if (count > 0) {
        const user = await users.findOne({}, { projection: { password: 0 } });
        console.log('\n👤 Sample user (password hidden):');
        console.log(JSON.stringify(user, null, 2));
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.syscall === 'getaddrinfo') {
      console.log('\n🔍 Network issue detected. Please check:');
      console.log('1. Internet connection');
      console.log('2. MongoDB Atlas IP whitelist');
      console.log('3. Connection string format');
    }
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n🔍 MongoDB Server Selection Error:');
      console.log(`- Error Code: ${error.codeName}`);
      console.log(`- Error Message: ${error.message}`);
    }
    
    process.exit(1);
  } finally {
    console.log('\n🔌 Closing connection...');
    await client.close();
    console.log('✅ Connection closed');
  }
}

// Run the test
testConnection();
