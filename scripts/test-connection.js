// scripts/test-connection.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('Testing MongoDB connection...');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in environment variables');
    return;
  }
  
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('\nAttempting to connect to MongoDB...');
    await client.connect();
    
    console.log('✅ Successfully connected to MongoDB');
    
    // List all databases
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (size: ${db.sizeOnDisk ? db.sizeOnDisk + ' bytes' : 'unknown'})`);
    });
    
    // Check if our target database exists
    const targetDbName = process.env.DATABASE_NAME || 'coworking-platform';
    console.log(`\nChecking for target database: ${targetDbName}`);
    
    const targetDb = client.db(targetDbName);
    const collections = await targetDb.listCollections().toArray();
    
    if (collections.length > 0) {
      console.log(`\nCollections in ${targetDbName}:`);
      collections.forEach(coll => console.log(`- ${coll.name}`));
      
      // Check users collection
      const users = targetDb.collection('users');
      const userCount = await users.countDocuments();
      console.log(`\nFound ${userCount} users in the users collection`);
      
      if (userCount > 0) {
        const firstUser = await users.findOne({});
        console.log('\nSample user:');
        console.log(JSON.stringify(firstUser, null, 2));
      }
    } else {
      console.log(`\nNo collections found in ${targetDbName}`);
    }
    
  } catch (error) {
    console.error('\n❌ Error connecting to MongoDB:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n⚠️  Could not resolve the MongoDB host. Please check your MONGODB_URI.');
    } else if (error.code === 8000 || error.code === 18) {
      console.error('\n⚠️  Authentication failed. Please check your MongoDB username and password.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Connection refused. Is MongoDB running at the specified address?');
    }
    
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

testConnection();
