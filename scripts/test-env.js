// Simple script to test environment variables and MongoDB connection
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Log file setup
const logFile = 'test-env.log';
const logStream = fs.createWriteStream(logFile, { flags: 'w' });

// Helper function to log to both console and file
function log(...args) {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  process.stdout.write(logMessage);
  logStream.write(logMessage);
}

// Test environment variables
log('🔍 Testing environment variables...');
log(`Current directory: ${process.cwd()}`);
log(`Node version: ${process.version}`);

// Try to load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
log(`\n🔧 Loading environment from: ${envPath}`);

if (fs.existsSync(envPath)) {
  log('✅ .env.local file exists');
  
  try {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    log(`✅ Successfully parsed .env.local (${Object.keys(envConfig).length} variables found)`);
    
    // Check if MONGODB_URI is in the file
    if (envConfig.MONGODB_URI) {
      log('✅ MONGODB_URI found in .env.local');
      log(`   URI: ${envConfig.MONGODB_URI.replace(/:([^:]+)@/, ':*****@')}`);
      
      // Test MongoDB connection
      testMongoDBConnection(envConfig.MONGODB_URI);
    } else {
      log('❌ MONGODB_URI not found in .env.local');
    }
    
  } catch (error) {
    log(`❌ Error parsing .env.local: ${error.message}`);
    process.exit(1);
  }
  
} else {
  log('❌ .env.local file does not exist');
  process.exit(1);
}

async function testMongoDBConnection(uri) {
  log('\n🔌 Testing MongoDB connection...');
  
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 5000,
  });
  
  try {
    log('Connecting to MongoDB...');
    await client.connect();
    log('✅ Successfully connected to MongoDB!');
    
    // List databases
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    log(`\n📂 Found ${dbs.databases.length} databases:`);
    
    dbs.databases.forEach(db => {
      log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
  } catch (error) {
    log(`❌ MongoDB connection error: ${error.message}`);
    
    if (error.name === 'MongoServerSelectionError') {
      log('\n🔍 Troubleshooting tips:');
      log('1. Check if MongoDB is running and accessible');
      log('2. Verify the connection string is correct');
      log('3. Check your network connection');
      log('4. If using MongoDB Atlas, ensure your IP is whitelisted');
    }
    
  } finally {
    try {
      await client.close();
      log('\n🔌 MongoDB connection closed');
    } catch (closeError) {
      log(`❌ Error closing connection: ${closeError.message}`);
    }
    
    log(`\n📝 Log saved to ${path.resolve(process.cwd(), logFile)}`);
    logStream.end();
  }
}
