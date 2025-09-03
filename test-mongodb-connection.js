const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

// Parse the MongoDB URI
let mongoUri = process.env.MONGODB_URI;

// Ensure we have a valid connection string
if (!mongoUri) {
  console.error('❌ Error: MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Log the first few characters of the connection string for debugging
console.log('Connection string starts with:', mongoUri.substring(0, 20) + '...');

console.log('Environment Variables:');
console.log('- MONGODB_URI:', mongoUri ? '*** (exists) ***' : 'NOT FOUND');

// Create a new MongoClient with SRV options
const client = new MongoClient(mongoUri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  w: 'majority'
});

async function testConnection() {
  console.log('Attempting to connect to MongoDB...');
  
  try {
    // Connect the client to the server
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB!');
    
    // List all databases
    const adminDb = client.db('admin');
    const result = await adminDb.admin().listDatabases();
    console.log('\nDatabases:');
    result.databases.forEach(db => console.log(`- ${db.name}`));
    
    // List collections in the current database
    const dbName = mongoUri.split('/').pop().split('?')[0];
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(`\nCollections in ${dbName}:`);
    collections.forEach(collection => console.log(`- ${collection.name}`));
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    
    // Additional debug info
    console.log('\nDebug Info:');
    console.log('- Node.js Version:', process.version);
    console.log('- MongoDB Driver Version:', require('mongodb/package.json').version);
    
  } finally {
    // Close the connection
    await client.close();
  }
}

// Run the test
testConnection().catch(console.dir);
