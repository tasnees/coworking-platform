// Simple test script using CommonJS modules
const fs = require('fs');
const path = require('path');

console.log('=== MongoDB Connection Test (CommonJS) ===');
console.log('Node.js version:', process.version);
console.log('Current working directory:', process.cwd());
console.log('Script directory:', __dirname);

// Load MongoDB connection string from backend/.env file
console.log('\n1. Loading MongoDB connection string from backend/.env...');

const backendEnvPath = path.resolve(__dirname, '../backend/.env');
let MONGODB_URI = '';

try {
  // Read the backend .env file
  const envContent = fs.readFileSync(backendEnvPath, 'utf8');
  
  // Extract MONGODB_URI from the .env file
  const match = envContent.match(/MONGODB_URI=(.*)/);
  
  if (match && match[1]) {
    MONGODB_URI = match[1].trim();
    console.log('✅ Found MONGODB_URI in backend/.env');
  } else {
    console.error('❌ MONGODB_URI not found in backend/.env');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error reading backend/.env file:', error.message);
  console.error('   Please make sure the file exists and is accessible');
  process.exit(1);
}

// Verify Node.js version
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 14 || (major === 14 && minor < 15)) {
  console.error('❌ This script requires Node.js 14.15.0 or later');
  process.exit(1);
}

// Define an async function to use await
async function testConnection() {
  try {
    console.log('2. Loading MongoDB driver...');
    const { MongoClient } = require('mongodb');
    console.log('✅ MongoDB driver loaded successfully');
    
        // Create a new client and connect to the MongoDB server
    console.log('3. Creating MongoDB client...');
    console.log('   Connection string:', MONGODB_URI.replace(/:([^:]+)@/, ':***@')); // Mask password in logs
    
    const client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      family: 4, // Force IPv4
      tls: true, // Enable TLS/SSL
      retryWrites: true,
      w: 'majority',
      // For development only - remove in production
      tlsAllowInvalidCertificates: false,
      // Enable retryable writes
      retryReads: true
    });
    
    console.log('4. Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    try {
      // Access the database
      const db = client.db('coworking-platform');
      console.log(`📊 Using database: ${db.databaseName}`);
      
      // List collections
      console.log('5. Listing collections...');
      const collections = await db.listCollections().toArray();
      console.log(`✅ Found ${collections.length} collections:`);
      collections.forEach(coll => console.log(`   - ${coll.name}`));
      
      // Check if users collection exists
      const usersCollection = db.collection('users');
      const userCount = await usersCollection.countDocuments();
      console.log(`\n👥 Users in database: ${userCount}`);
      
      if (userCount > 0) {
        console.log('\n📝 Sample user:');
        const sampleUser = await usersCollection.findOne({});
        console.log(JSON.stringify(sampleUser, null, 2));
      }
      
    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
    } finally {
      // Close the connection
      console.log('\n6. Closing connection...');
      await client.close();
      console.log('✅ Connection closed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Execute the async function
testConnection().catch(error => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

console.log('\n=== Test completed ===');
