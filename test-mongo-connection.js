const fs = require('fs');
const { MongoClient } = require('mongodb');

// Create a write stream for logging
const logStream = fs.createWriteStream('mongo-test.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  process.stdout.write(logMessage);
  logStream.write(logMessage);
}

async function testConnection() {
  log('Starting MongoDB connection test...');
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    log('❌ Error: MONGODB_URI environment variable is not set');
    return;
  }

  // Log masked URI (hides password)
  const maskedUri = uri.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+@/, '$1***@');
  log(`MongoDB URI: ${maskedUri}`);
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
  });

  try {
    log('\n🔌 Attempting to connect to MongoDB...');
    await client.connect();
    log('✅ Successfully connected to MongoDB');

    const db = client.db('coworking-platform');
    log(`\n📊 Connected to database: ${db.databaseName}`);

    // List collections
    const collections = await db.listCollections().toArray();
    log('\n📂 Collections:');
    log(collections.map(c => `- ${c.name}`).join('\n') || 'No collections found');

    // Check users collection
    if (collections.some(c => c.name === 'users')) {
      const users = db.collection('users');
      const count = await users.countDocuments();
      log(`\n👥 Users count: ${count}`);
      
      if (count > 0) {
        const user = await users.findOne({}, { projection: { password: 0 } });
        log('\n👤 Sample user:');
        log(JSON.stringify(user, null, 2));
      }
    }

  } catch (error) {
    log(`\n❌ Error: ${error.message}`);
    log(`Error stack: ${error.stack}`);
    
    if (error.syscall === 'getaddrinfo') {
      log('\n🔍 Network issue detected. Please check:');
      log('1. Internet connection');
      log('2. MongoDB Atlas IP whitelist');
      log('3. Connection string format');
    }
    
    // Check if it's a MongoDB server selection error
    if (error.name === 'MongoServerSelectionError') {
      log('\n🔍 MongoDB Server Selection Error:');
      log(`- Error Code: ${error.codeName}`);
      log(`- Error Message: ${error.message}`);
    }
    
  } finally {
    log('\n🔌 Closing connection...');
    await client.close();
    log('✅ Connection closed');
    logStream.end();
  }
}

// Run the test
testConnection().catch(error => {
  log(`Unhandled error: ${error.message}`);
  log(error.stack);
  process.exit(1);
});
