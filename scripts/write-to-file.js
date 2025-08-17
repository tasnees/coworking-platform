const fs = require('fs');
const path = require('path');

// Create a log file path
const logFile = path.join(__dirname, 'test-output.log');

// Function to write to both console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // Write to file
  fs.appendFileSync(logFile, logMessage, 'utf8');
  
  // Also log to console
  console.log(`[${timestamp}] ${message}`);
}

// Start the test
log('=== Starting MongoDB Connection Test ===');

// Log basic environment info
log(`Node.js version: ${process.version}`);
log(`Platform: ${process.platform} ${process.arch}`);
log(`Current directory: ${process.cwd()}`);
log(`Script directory: ${__dirname}`);

// Check if .env.local exists
const envPath = path.resolve(process.cwd(), '.env.local');
log(`Checking for .env.local at: ${envPath}`);

if (fs.existsSync(envPath)) {
  log('✅ .env.local file exists');
  
  // Try to load environment variables
  try {
    require('dotenv').config({ path: envPath });
    log('✅ Environment variables loaded');
    log(`MONGODB_URI: ${process.env.MONGODB_URI ? 'set' : 'not set'}`);
  } catch (error) {
    log(`❌ Error loading .env file: ${error.message}`);
  }
} else {
  log('❌ .env.local file does not exist');
}

// Test MongoDB connection if URI is available
if (process.env.MONGODB_URI) {
  log('\n=== Testing MongoDB Connection ===');
  
  try {
    log('1. Attempting to require mongodb...');
    const { MongoClient } = require('mongodb');
    log('✅ MongoDB required successfully');
    
    log('2. Creating MongoDB client...');
    const client = new MongoClient(process.env.MONGODB_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      family: 4, // Force IPv4
      maxPoolSize: 1,
      minPoolSize: 1,
      maxIdleTimeMS: 5000,
      monitorCommands: true
    });
    
    // Add event listeners
    client.on('serverOpening', () => log('🔹 MongoDB: Server opening...'));
    client.on('serverClosed', () => log('🔹 MongoDB: Server closed'));
    client.on('topologyOpening', () => log('🔹 MongoDB: Topology opening...'));
    client.on('topologyClosed', () => log('🔹 MongoDB: Topology closed'));
    client.on('serverHeartbeatStarted', () => log('🔹 MongoDB: Heartbeat started'));
    client.on('serverHeartbeatSucceeded', () => log('🔹 MongoDB: Heartbeat succeeded'));
    client.on('serverHeartbeatFailed', (e) => log(`❌ MongoDB: Heartbeat failed: ${e.message}`));
    client.on('commandStarted', (e) => log(`🔹 MongoDB Command: ${e.commandName}`));
    
    log('3. Attempting to connect...');
    await client.connect();
    log('✅ Successfully connected to MongoDB!');
    
    log('4. Accessing database...');
    const db = client.db('coworking-platform');
    log(`✅ Using database: ${db.databaseName}`);
    
    log('5. Listing collections...');
    const collections = await db.listCollections().toArray();
    log(`✅ Found ${collections.length} collections`);
    collections.forEach(coll => log(`   - ${coll.name}`));
    
    log('6. Checking users collection...');
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    log(`✅ Found ${userCount} users in the database`);
    
    if (userCount > 0) {
      log('\nSample user:');
      const sampleUser = await usersCollection.findOne({});
      log(JSON.stringify(sampleUser, null, 2));
    }
    
    log('7. Closing connection...');
    await client.close();
    log('✅ Connection closed');
    
  } catch (error) {
    log(`❌ Error: ${error.message}`);
    log('Stack trace:');
    log(error.stack || 'No stack trace available');
  }
}

log('\n=== Test Completed ===');
log(`Log file saved to: ${logFile}`);
