// scripts/test-mongodb.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('Starting MongoDB connection test...');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Not set');
  
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not set in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('\nConnecting to MongoDB...');
    await client.connect();
    console.log('✓ Successfully connected to MongoDB');

    const dbName = process.env.DATABASE_NAME || 'coworking-platform';
    const db = client.db(dbName);
    console.log(`\nUsing database: ${dbName}`);

    // List all collections
    console.log('\nCollections in database:');
    const collections = await db.listCollections().toArray();
    collections.forEach(coll => console.log(`- ${coll.name}`));

    // Check users collection
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\nFound ${userCount} users in the users collection`);

    if (userCount > 0) {
      console.log('\nFirst 5 users:');
      const users = await usersCollection.find().limit(5).toArray();
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`- ID: ${user._id}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Name: ${user.name}`);
        console.log(`- Role: ${user.role}`);
        console.log(`- Created: ${user.createdAt}`);
      });
    }

    // Check members collection
    const membersCollection = db.collection('members');
    const memberCount = await membersCollection.countDocuments();
    console.log(`\nFound ${memberCount} members in the members collection`);

  } catch (error) {
    console.error('\n❌ Error during MongoDB test:', error);
    if (error.code === 'ENOTFOUND') {
      console.error('\n⚠️  Could not resolve the MongoDB host. Please check your MONGODB_URI.');
    } else if (error.code === 8000) {
      console.error('\n⚠️  Authentication failed. Please check your MongoDB username and password.');
    } else if (error.code === 18) {
      console.error('\n⚠️  Authentication failed. Please check your MongoDB username and password.');
    }
  } finally {
    await client.close();
    console.log('\n✓ MongoDB connection closed');
  }
}

testConnection();
