// scripts/test-mongo-connection.js
const { MongoClient } = require('mongodb');

// Connection URI - using the MongoDB Atlas connection string from your .env.local
const uri = 'mongodb+srv://grabatassnim:pvsd8mdXyqXKHgiT@cluster0.av4bvfl.mongodb.net/coworking-platform?retryWrites=true&w=majority';

// Database Name
const dbName = 'coworking-platform';

// Create a new MongoClient
const client = new MongoClient(uri);

async function run() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    
    // Connect the client to the server
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas');
    
    // Get the database
    const db = client.db(dbName);
    console.log(`\nUsing database: ${dbName}`);
    
    // List all collections
    console.log('\nListing all collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    // Check users collection
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\nFound ${userCount} users in the users collection`);
    
    if (userCount > 0) {
      console.log('\nSample user:');
      const user = await usersCollection.findOne({});
      console.log(JSON.stringify(user, null, 2));
    }
    
    // Check members collection
    const membersCollection = db.collection('members');
    const memberCount = await membersCollection.countDocuments();
    console.log(`\nFound ${memberCount} members in the members collection`);
    
    if (memberCount > 0) {
      console.log('\nSample member:');
      const member = await membersCollection.findOne({});
      console.log(JSON.stringify(member, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error('\n⚠️  Authentication failed. Please check your MongoDB username and password.');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('\n⚠️  Could not connect to MongoDB server. Please check your internet connection and the server status.');
    } else if (error.message.includes('bad auth : Authentication failed')) {
      console.error('\n⚠️  Authentication failed. The username or password is incorrect.');
    } else if (error.message.includes('not authorized')) {
      console.error('\n⚠️  Not authorized to access the database. Please check your database user permissions.');
    }
    
  } finally {
    // Close the connection
    await client.close();
    console.log('\nConnection closed');
  }
}

// Run the test
run().catch(console.dir);
