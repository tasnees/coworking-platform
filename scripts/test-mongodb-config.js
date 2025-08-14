// scripts/test-mongodb-config.js
require('dotenv').config({ path: '.env.local' });
const clientPromise = require('../lib/mongodb');

async function testConnection() {
  console.log('=== Testing MongoDB Connection ===');
  console.log('Using MONGODB_URI:', process.env.MONGODB_URI ? '*** (hidden for security)' : 'Not set');
  
  try {
    console.log('\n1. Getting MongoDB client...');
    const client = await clientPromise;
    
    console.log('✅ Successfully connected to MongoDB');
    console.log('Database name:', client.db().databaseName);
    
    // List collections
    console.log('\n2. Listing collections...');
    const collections = await client.db().listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    collections.forEach((col, i) => {
      console.log(`  ${i + 1}. ${col.name}`);
    });
    
    // Check if users collection exists
    const usersCollection = client.db().collection('users');
    const usersCount = await usersCollection.countDocuments();
    console.log(`\n3. Found ${usersCount} users in the database`);
    
    if (usersCount > 0) {
      console.log('\nSample user:');
      const user = await usersCollection.findOne({});
      console.log(JSON.stringify({
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }, null, 2));
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error('\n⚠️  Authentication failed. Please check your MongoDB username and password.');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('\n⚠️  Could not connect to MongoDB server. Please check your internet connection and the server status.');
    } else if (error.message.includes('not authorized')) {
      console.error('\n⚠️  Not authorized to access the database. Please check your database user permissions.');
    } else {
      console.error('\n⚠️  An unexpected error occurred:', error);
    }
  }
}

// Run the test
testConnection()
  .then(() => console.log('\n=== Test completed ==='))
  .catch(console.error);
