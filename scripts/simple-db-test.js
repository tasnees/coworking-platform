const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Log function with timestamp
function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

// Error log function with timestamp
function error(...args) {
  console.error(`[${new Date().toISOString()}] ❌`, ...args);
}

// Main function
async function testConnection() {
  log('Starting database connection test...');
  
  // Load environment variables
  log('Loading environment variables...');
  const envPath = path.resolve(process.cwd(), '.env.local');
  log(`Looking for .env file at: ${envPath}`);
  
  try {
    // Check if .env file exists
    const fs = require('fs');
    if (!fs.existsSync(envPath)) {
      error(`.env file not found at: ${envPath}`);
      error('Current working directory:', process.cwd());
      error('Directory contents:', fs.readdirSync(process.cwd()));
      return;
    }
    
    // Load environment variables
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      error('Error loading .env file:', result.error);
      return;
    }
    
    log('Environment variables loaded successfully');
    
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      error('MONGODB_URI is not defined in environment variables');
      return;
    }
    
    log('MONGODB_URI found (first 30 chars):', process.env.MONGODB_URI.substring(0, 30) + '...');
    log('DATABASE_NAME:', process.env.DATABASE_NAME || 'default');
    
    // Try to connect to MongoDB
    log('Attempting to connect to MongoDB...');
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    try {
      await client.connect();
      log('✅ Successfully connected to MongoDB');
      
      // Get database info
      const dbName = process.env.DATABASE_NAME || 'coworking-platform';
      const db = client.db(dbName);
      log(`Using database: ${dbName}`);
      
      // List collections
      const collections = await db.listCollections().toArray();
      log(`Found ${collections.length} collections in database:`);
      collections.forEach((col, index) => {
        log(`  ${index + 1}. ${col.name}`);
      });
      
      // Try to insert a test document
      const testDoc = {
        test: 'connection-test',
        timestamp: new Date(),
      };
      
      log('Attempting to insert test document...');
      const result = await db.collection('test').insertOne(testDoc);
      log(`✅ Successfully inserted test document with ID: ${result.insertedId}`);
      
      // Try to find the test document
      const foundDoc = await db.collection('test').findOne({ _id: result.insertedId });
      if (foundDoc) {
        log('✅ Successfully retrieved test document:', JSON.stringify(foundDoc, null, 2));
      } else {
        error('❌ Failed to retrieve test document after insertion');
      }
      
    } catch (err) {
      error('Failed to connect to MongoDB:', err);
    } finally {
      await client.close();
      log('MongoDB connection closed');
    }
    
  } catch (err) {
    error('An error occurred:', err);
  }
}

// Run the test
testConnection().catch(console.error);
