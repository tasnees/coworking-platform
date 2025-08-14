// scripts/test-mongo-simple.js
const { MongoClient } = require('mongodb');

// Connection URI from your .env.local
const uri = 'mongodb+srv://grabatassnim:pvsd8mdXyqXKHgiT@cluster0.av4bvfl.mongodb.net/coworking-platform?retryWrites=true&w=majority';

async function testConnection() {
  console.log('Testing MongoDB connection...');
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // List all databases
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Check our target database
    const targetDb = client.db('coworking-platform');
    console.log('\nChecking collections in coworking-platform database:');
    
    const collections = await targetDb.listCollections().toArray();
    if (collections.length > 0) {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
      
      // Check users collection
      const users = targetDb.collection('users');
      const userCount = await users.countDocuments();
      console.log(`\nFound ${userCount} users in the users collection`);
      
      if (userCount > 0) {
        console.log('\nSample user:');
        const user = await users.findOne({});
        console.log(JSON.stringify(user, null, 2));
      }
    } else {
      console.log('No collections found in the database');
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
    
  } finally {
    // Close the connection
    await client.close();
    console.log('\nConnection closed');
  }
}

// Run the test
testConnection().catch(console.error);
