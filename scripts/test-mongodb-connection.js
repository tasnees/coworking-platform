// Enable detailed logging
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Log function with timestamp and colors
function log(...args) {
  const timestamp = `\x1b[36m[${new Date().toISOString()}]\x1b[0m`;
  console.log(timestamp, ...args);
}

// Error log function with timestamp and colors
function error(...args) {
  const timestamp = `\x1b[36m[${new Date().toISOString()}]\x1b[0m`;
  console.error('\x1b[31m❌ ERROR:\x1b[0m', timestamp, ...args);
}

// Success log function with timestamp and colors
function success(...args) {
  const timestamp = `\x1b[36m[${new Date().toISOString()}]\x1b[0m`;
  console.log('\x1b[32m✅ SUCCESS:\x1b[0m', timestamp, ...args);
}

// Load environment variables
log('Loading environment variables...');
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  log(`Looking for .env file at: ${envPath}`);
  
  if (!fs.existsSync(envPath)) {
    error(`.env file not found at: ${envPath}`);
    process.exit(1);
  }
  
  // Load the environment file
  require('dotenv').config({ path: envPath });
  success('Environment variables loaded');
  
  // Log important environment variables (with sensitive data redacted)
  log('Environment variables:');
  log(`  - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  log(`  - MONGODB_URI: ${process.env.MONGODB_URI ? 'set' : 'not set'}`);
  log(`  - DATABASE_NAME: ${process.env.DATABASE_NAME || 'not set'}`);
  
  if (process.env.MONGODB_URI) {
    const uri = process.env.MONGODB_URI;
    const dbNameMatch = uri.match(/\/([^/?]+)(?:\?|$)/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
    log(`  - MongoDB Database: ${dbName}`);
    log(`  - MongoDB URI starts with: ${uri.substring(0, 30)}...`);
  }
  
} catch (err) {
  error('Failed to load environment variables:', err);
  process.exit(1);
}

async function testConnection() {
  log('Starting MongoDB connection test...');
  
  // Check if MONGODB_URI is defined
  if (!process.env.MONGODB_URI) {
    error('MONGODB_URI is not defined in environment variables');
    return;
  }
  
  const mongoUri = process.env.MONGODB_URI;
  log('MongoDB URI found (first 30 chars):', mongoUri.substring(0, 30) + '...');
  
  // Create a new MongoClient with more detailed options
  const client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000, // 45 seconds
    maxPoolSize: 50,
    wtimeoutMS: 2500,
    retryWrites: true,
    retryReads: true,
    monitorCommands: true, // Enable command monitoring for debugging
  });
  
  // Add event listeners for connection monitoring
  client.on('serverOpening', () => log('MongoDB server opening...'));
  client.on('serverClosed', () => log('MongoDB server closed'));
  client.on('serverHeartbeatSucceeded', (event) => log('MongoDB heartbeat succeeded:', event.reply ? 'OK' : 'No reply'));
  client.on('serverHeartbeatFailed', (event) => error('MongoDB heartbeat failed:', event.failure));
  client.on('commandStarted', (event) => log(`Command started: ${event.commandName}`, JSON.stringify(event.command)));
  client.on('commandSucceeded', (event) => log(`Command succeeded: ${event.commandName}`, JSON.stringify(event.reply)));
  client.on('commandFailed', (event) => error(`Command failed: ${event.commandName}`, event.failure));
  
  try {
    // Connect to the MongoDB cluster
    log('Attempting to connect to MongoDB...');
    const startTime = Date.now();
    await client.connect();
    const endTime = Date.now();
    success(`Successfully connected to MongoDB in ${endTime - startTime}ms`);
    
    // Get database reference
    const dbName = process.env.DATABASE_NAME || 'coworking-platform';
    const db = client.db(dbName);
    log(`Using database: ${dbName}`);
    
    // Test database commands
    try {
      log('Testing database connection with ping command...');
      const pingResult = await db.command({ ping: 1 });
      success('Database ping successful:', pingResult);
    } catch (pingError) {
      error('Database ping failed:', pingError);
      throw pingError;
    }
    
    // List all collections
    log('Fetching list of collections...');
    const collections = await db.listCollections().toArray();
    success(`Found ${collections.length} collections in database`);
    collections.forEach((col, index) => {
      log(`  ${index + 1}. ${col.name}`);
    });
    
    // Check if users collection exists
    const usersCollection = db.collection('users');
    const collectionExists = collections.some(col => col.name === 'users');
    
    if (!collectionExists) {
      log('Users collection does not exist, creating it...');
      try {
        await db.createCollection('users');
        success('Successfully created users collection');
      } catch (createError) {
        error('Failed to create users collection:', createError);
        throw createError;
      }
    }
    
    // Count documents in users collection
    const userCount = await usersCollection.countDocuments();
    log(`Found ${userCount} users in the database`);
    
    // Insert a test user
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testUser = {
      email: testEmail,
      name: 'Test User',
      password: 'hashed_password_here',
      role: 'member',
      emailVerified: null,
      image: null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    log('Attempting to insert test user...');
    log('Test user data:', JSON.stringify(testUser, null, 2));
    
    try {
      const startTime = Date.now();
      const result = await usersCollection.insertOne(testUser);
      const endTime = Date.now();
      
      if (result.acknowledged && result.insertedId) {
        success(`Successfully inserted test user with ID: ${result.insertedId} (took ${endTime - startTime}ms)`);
        
        // Verify the user was inserted
        log('Verifying test user insertion...');
        const insertedUser = await usersCollection.findOne({ _id: result.insertedId });
        
        if (insertedUser) {
          success('Successfully retrieved test user:', JSON.stringify({
            _id: insertedUser._id,
            email: insertedUser.email,
            name: insertedUser.name,
            role: insertedUser.role,
            status: insertedUser.status,
            createdAt: insertedUser.createdAt,
          }, null, 2));
          
          // Count users again to verify
          const newUserCount = await usersCollection.countDocuments();
          log(`Total users in database after insertion: ${newUserCount}`);
          
          // Try to find the user by email
          const foundByEmail = await usersCollection.findOne({ email: testEmail });
          if (foundByEmail) {
            success(`Successfully found user by email: ${testEmail}`);
          } else {
            error(`Failed to find user by email: ${testEmail}`);
          }
        } else {
          error('Failed to retrieve test user after insertion');
        }
      } else {
        error('Insert operation was not acknowledged by the server');
        log('Insert result:', result);
      }
    } catch (insertError) {
      error('Error inserting test user:', insertError);
      throw insertError;
    }
    
  } catch (err) {
    error('Error:', err);
  } finally {
    // Close the connection
    await client.close();
    log('MongoDB connection closed');
  }
}

// Run the test
testConnection().catch(console.error);
