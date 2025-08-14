// scripts/direct-db-test.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// Connection URI from .env.local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://grabatassnim:pvsd8mdXyqXKHgiT@cluster0.av4bvfl.mongodb.net/coworking-platform?retryWrites=true&w=majority';
const DB_NAME = process.env.DATABASE_NAME || 'coworking-platform';

// Test user data
const testUser = {
  name: `Direct Test User ${Date.now()}`,
  email: `direct_test_${Date.now()}@example.com`,
  password: 'hashed_password_placeholder', // In a real scenario, this would be hashed
  role: 'member',
  status: 'active',
  emailVerified: null,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

async function testDatabaseConnection() {
  console.log('=== Testing Direct MongoDB Connection ===');
  console.log('Connecting to:', MONGODB_URI.split('@')[1] || MONGODB_URI);
  
  const client = new MongoClient(MONGODB_URI, {
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    // Test connection
    console.log('\n1. Testing connection...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // Get database info
    const adminDb = client.db().admin();
    const serverStatus = await adminDb.serverStatus();
    console.log('\n2. Server Status:');
    console.log(`- MongoDB Version: ${serverStatus.version}`);
    console.log(`- Host: ${serverStatus.host}`);
    console.log(`- Uptime: ${Math.floor(serverStatus.uptime / 60)} minutes`);
    
    // List databases
    console.log('\n3. Listing databases...');
    const dbs = await adminDb.listDatabases();
    console.log(`Found ${dbs.databases.length} databases:`);
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (${db.sizeOnDisk ? (db.sizeOnDisk / 1024 / 1024).toFixed(2) + ' MB' : 'size unknown'})`);
    });
    
    // Check if our database exists
    const dbExists = dbs.databases.some(db => db.name === DB_NAME);
    if (!dbExists) {
      console.log(`\n❌ Database '${DB_NAME}' not found!`);
      return;
    }
    
    // Access our database
    const db = client.db(DB_NAME);
    console.log(`\n4. Using database: ${db.databaseName}`);
    
    // List collections
    console.log('\n5. Listing collections:');
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    collections.forEach((col, i) => {
      console.log(`  ${i + 1}. ${col.name}`);
    });
    
    // Test insert into users collection
    console.log('\n6. Testing insert into users collection...');
    const usersCollection = db.collection('users');
    
    // Check if users collection exists, create if it doesn't
    const usersCollectionExists = collections.some(col => col.name === 'users');
    if (!usersCollectionExists) {
      console.log('Users collection does not exist, creating...');
      await db.createCollection('users');
      console.log('Created users collection');
    }
    
    // Insert test user
    console.log('\n7. Inserting test user...');
    const insertResult = await usersCollection.insertOne(testUser);
    console.log('✅ Inserted test user with ID:', insertResult.insertedId);
    
    // Verify the user was inserted
    console.log('\n8. Verifying user was inserted...');
    const foundUser = await usersCollection.findOne({ _id: insertResult.insertedId });
    
    if (foundUser) {
      console.log('✅ Found inserted user:');
      console.log(JSON.stringify({
        _id: foundUser._id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        status: foundUser.status,
        createdAt: foundUser.createdAt
      }, null, 2));
      
      // Count total users
      const userCount = await usersCollection.countDocuments();
      console.log(`\nTotal users in database: ${userCount}`);
      
      // List first 5 users if any
      if (userCount > 0) {
        console.log('\nFirst 5 users in the database:');
        const users = await usersCollection.find({})
          .sort({ _id: -1 })
          .limit(5)
          .toArray();
          
        users.forEach((user, i) => {
          console.log(`  ${i + 1}. ${user.email} (${user.role}) - ${user.createdAt}`);
        });
      }
      
      // Clean up - remove test user
      console.log('\n9. Cleaning up test user...');
      const deleteResult = await usersCollection.deleteOne({ _id: insertResult.insertedId });
      console.log(`Deleted ${deleteResult.deletedCount} test user`);
      
    } else {
      console.log('❌ Could not find the inserted user!');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error('\n⚠️  Authentication failed. Please check your MongoDB username and password.');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('\n⚠️  Could not connect to MongoDB server. Please check your internet connection and the server status.');
    } else if (error.message.includes('not authorized')) {
      console.error('\n⚠️  Not authorized to access the database. Please check your database user permissions.');
    } else if (error.message.includes('bad auth : Authentication failed')) {
      console.error('\n⚠️  Authentication failed. The provided credentials are not valid for the database.');
    } else if (error.message.includes('bad auth : Authentication failed')) {
      console.error('\n⚠️  Authentication failed. The provided credentials are not valid for the database.');
    } else {
      console.error('\n⚠️  An unexpected error occurred:', error);
    }
    
  } finally {
    // Close the connection
    if (client) {
      await client.close();
      console.log('\nConnection closed');
    }
  }
}

// Run the test
testDatabaseConnection()
  .then(() => console.log('\n=== Test completed ==='))
  .catch(console.error);
