const { MongoClient } = require('mongodb');
require('dotenv').config();

// Enable debug logging
console.log('=== MongoDB Connection Test ===');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

// Log environment variables (excluding sensitive ones)
console.log('\nEnvironment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '*** (hidden for security)' : 'not set');
console.log('- DATABASE_NAME:', process.env.DATABASE_NAME || 'not set');
console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'not set');

// Parse MongoDB URI for debugging (safely)
if (process.env.MONGODB_URI) {
  try {
    const url = new URL(process.env.MONGODB_URI);
    console.log('\nMongoDB Connection Details:');
    console.log('- Protocol:', url.protocol);
    console.log('- Hostname:', url.hostname);
    console.log('- Port:', url.port || 'default');
    console.log('- Database:', url.pathname.split('/').filter(Boolean).pop() || 'default');
    console.log('- Using SSL:', url.searchParams.get('ssl') === 'true' || url.protocol === 'mongodb+srv:');
  } catch (e) {
    console.error('\n⚠️ Could not parse MONGODB_URI:', e.message);
  }
}

async function testConnection() {
  if (!process.env.MONGODB_URI) {
    console.error('\n❌ ERROR: MONGODB_URI is not defined in environment variables');
    console.log('\nPlease make sure you have a .env.local file with MONGODB_URI set.');
    console.log('You can copy .env.example to .env.local and update the values.');
    return;
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 20000,
    maxPoolSize: 5,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    retryReads: true,
    w: 'majority',
  });

  try {
    console.log('\n🔌 Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // Test admin commands
    const adminDb = client.db().admin();
    const serverStatus = await adminDb.serverStatus();
    console.log('\n📊 MongoDB Server Status:');
    console.log('- Version:', serverStatus.version);
    console.log('- Host:', serverStatus.host);
    console.log('- Uptime (hours):', Math.floor(serverStatus.uptime / 3600));
    
    // Test database access
    const dbName = process.env.DATABASE_NAME || 'users';
    const db = client.db(dbName);
    console.log(`\n📚 Using database: ${db.databaseName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📂 Collections in ${db.databaseName}:`);
    if (collections.length > 0) {
      collections.forEach((col, i) => {
        console.log(`  ${i + 1}. ${col.name}`);
      });
    } else {
      console.log('  No collections found');
    }
    
    // Test a simple query
    try {
      const users = await db.collection('member').find({}).limit(1).toArray();
      console.log(`\n👤 Found ${users.length} users in member collection`);
    } catch (queryError) {
      console.log('\nℹ️ Could not query member collection (might not exist yet):', queryError.message);
    }
    
  } catch (error) {
    console.error('\n❌ Connection Error:', error.message);
    
    // Provide more detailed error information
    if (error.message.includes('bad auth')) {
      console.error('\n🔐 Authentication failed. Please check your MongoDB credentials.');
      console.error('Make sure your MONGODB_URI includes the correct username and password.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n🔌 Connection refused. Possible causes:');
      console.error('- MongoDB server is not running');
      console.error('- Incorrect host or port in MONGODB_URI');
      console.error('- Network connectivity issues');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n🌐 Could not resolve hostname. Please check:');
      console.error('- Your internet connection');
      console.error('- The hostname in MONGODB_URI is correct');
      console.error('- DNS resolution is working');
    } else if (error.message.includes('MongoNetworkError')) {
      console.error('\n🌐 Network error. Please check:');
      console.error('- Your internet connection');
      console.error('- Firewall settings (port 27017 for MongoDB)');
      console.error('- If using Atlas, check your IP whitelist');
    }
    
    console.error('\n🔍 Debugging Tips:');
    console.error('- Verify MONGODB_URI in your .env.local file');
    console.error('- Try connecting with MongoDB Compass or mongo shell');
    console.error('- Check MongoDB server logs for errors');
    console.error('- If using Atlas, verify your IP is whitelisted');
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

// Run the test
testConnection().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
