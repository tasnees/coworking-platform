const fs = require('fs');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// Create a log file
const logFile = 'mongo-test.log';
const logStream = fs.createWriteStream(logFile, { flags: 'w' });

// Redirect console.log to both console and file
const originalLog = console.log;
console.log = function() {
  const message = Array.from(arguments).join(' ');
  originalLog.apply(console, arguments);
  logStream.write(message + '\n');
};

// Redirect console.error to both console and file
const originalError = console.error;
console.error = function() {
  const message = Array.from(arguments).join(' ');
  originalError.apply(console, arguments);
  logStream.write(`[ERROR] ${message}\n`);
};

console.log(`[${new Date().toISOString()}] Starting MongoDB connection test\n`);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

console.log('🔌 Testing MongoDB connection...');
console.log(`MongoDB URI: ${MONGODB_URI.replace(/:([^:]+)@/, ':*****@')}`);

async function testConnection() {
  const client = new MongoClient(MONGODB_URI, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // List all databases
    console.log('\n📂 Listing all databases:');
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (size: ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Check if our database exists
    const targetDb = 'coworking-platform';
    const dbExists = dbs.databases.some(db => db.name === targetDb);
    
    if (dbExists) {
      console.log(`\n✅ Database '${targetDb}' exists`);
      
      // Check collections in our database
      const db = client.db(targetDb);
      const collections = await db.listCollections().toArray();
      
      if (collections.length > 0) {
        console.log(`\n📚 Collections in '${targetDb}':`);
        collections.forEach(col => console.log(`- ${col.name}`));
        
        // Check if users collection exists
        const usersCollection = collections.find(col => col.name === 'users');
        if (usersCollection) {
          console.log('\n👥 Users collection exists, checking documents...');
          const users = await db.collection('users').find({}).limit(5).toArray();
          console.log(`Found ${users.length} user(s):`);
          
          if (users.length > 0) {
            users.forEach((user, index) => {
              console.log(`\nUser ${index + 1}:`);
              console.log(`  Email: ${user.email || 'No email'}`);
              console.log(`  Role: ${user.role || 'No role'}`);
              console.log(`  Created: ${user.createdAt || 'No creation date'}`);
            });
          } else {
            console.log('No users found in the users collection');
          }
        } else {
          console.log('\n❌ Users collection does not exist');
        }
      } else {
        console.log('\nℹ️ No collections found in the database');
      }
    } else {
      console.log(`\n❌ Database '${targetDb}' does not exist`);
    }
    
  } catch (error) {
    console.error('\n❌ Error during MongoDB connection test:');
    console.error(error);
    
    // Log detailed error information
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n🔍 This error typically indicates that the MongoDB server is not reachable.');
      console.error('Please check the following:');
      console.error('1. Is MongoDB running and accessible?');
      console.error('2. Is the connection string correct?');
      console.error('3. Are there any firewall rules blocking the connection?');
      console.error('4. If using MongoDB Atlas, is your IP whitelisted?');
    }
    
  } finally {
    try {
      await client.close();
      console.log('\n🔌 MongoDB connection closed');
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError);
    }
    
    // Close the log file
    logStream.end();
    console.log(`\n📝 Log saved to ${logFile}`);
  }
}

// Run the test
console.log('\n🚀 Starting MongoDB connection test...\n');
testConnection().catch(error => {
  console.error('Unhandled error in test:', error);
  process.exit(1);
});
