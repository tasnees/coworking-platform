console.log('🔍 Starting MongoDB connection test...');

const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`📂 Loading environment variables from: ${envPath}`);

try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
  } else {
    console.log('✅ Environment variables loaded successfully');
    console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'set' : 'not set');
  }
} catch (error) {
  console.error('❌ Error loading environment variables:', error.message);
}

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment variables');
  console.log('\nPlease make sure you have a .env.local file with:');
  console.log('MONGODB_URI=your_mongodb_connection_string');
  console.log('NEXTAUTH_SECRET=your_secret_here');
  console.log('NEXTAUTH_URL=http://localhost:3000');
  process.exit(1);
}

// Parse the MongoDB URI to get connection details
let mongoUri;
try {
  mongoUri = new URL(process.env.MONGODB_URI);
  console.log('\n🔗 MongoDB Connection Details:');
  console.log('---------------------------');
  console.log(`Protocol: ${mongoUri.protocol}`);
  console.log(`Host: ${mongoUri.hostname}`);
  console.log(`Port: ${mongoUri.port || 'default'}`);
  console.log(`Database: ${mongoUri.pathname ? mongoUri.pathname.substring(1).split('?')[0] : 'default'}`);
  console.log(`Username: ${mongoUri.username || 'not specified'}`);
  console.log(`Using SSL: ${mongoUri.searchParams.get('ssl') === 'true' ? '✅ Yes' : '❌ No'}`);
  console.log('---------------------------\n');
} catch (error) {
  console.error('❌ Error parsing MONGODB_URI:', error.message);
  process.exit(1);
}

async function testConnection() {
  console.log('🚀 Testing MongoDB connection...');
  
  // Log the raw MONGODB_URI (masking password for security)
  const maskedUri = process.env.MONGODB_URI.replace(/:([^:]+)@/, ':***@');
  console.log('🔗 Using MONGODB_URI:', maskedUri);
  
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

  // Add event listeners for debugging
  client.on('serverOpening', () => console.log('🔹 MongoDB: Server opening...'));
  client.on('serverClosed', () => console.log('🔹 MongoDB: Server closed'));
  client.on('topologyOpening', () => console.log('🔹 MongoDB: Topology opening...'));
  client.on('topologyClosed', () => console.log('🔹 MongoDB: Topology closed'));
  client.on('serverHeartbeatStarted', () => console.log('🔹 MongoDB: Heartbeat started'));
  client.on('serverHeartbeatSucceeded', () => console.log('🔹 MongoDB: Heartbeat succeeded'));
  client.on('serverHeartbeatFailed', (e) => console.error('❌ MongoDB: Heartbeat failed:', e.message));
  client.on('commandStarted', (e) => console.log(`🔹 MongoDB Command: ${e.commandName}`));
  client.on('commandSucceeded', (e) => console.log(`🔹 MongoDB Command ${e.commandName} succeeded`));
  client.on('commandFailed', (e) => console.error(`❌ MongoDB Command ${e.commandName} failed:`, e.failure));

  try {
    console.log('\n🔌 Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test database access with error handling
    let db;
    try {
      db = client.db('coworking-platform');
      console.log(`📊 Using database: ${db.databaseName}`);
      
      // List collections with error handling
      console.log('\n📂 Attempting to list collections...');
      try {
        const collections = await db.listCollections().toArray();
        console.log(`✅ Found ${collections.length} collections:`);
        collections.forEach(coll => console.log(`   - ${coll.name}`));
        
        // Check if users collection exists
        const usersCollection = db.collection('users');
        try {
          const userCount = await usersCollection.countDocuments();
          console.log(`\n👥 Users in database: ${userCount}`);
          
          // Sample query
          if (userCount > 0) {
            console.log('\n📝 Sample user:');
            try {
              const sampleUser = await usersCollection.findOne({});
              console.log(JSON.stringify(sampleUser, null, 2));
            } catch (queryError) {
              console.error('❌ Error querying users collection:', queryError.message);
            }
          }
        } catch (countError) {
          console.error('❌ Error counting users:', countError.message);
        }
      } catch (listError) {
        console.error('❌ Error listing collections:', listError.message);
        console.error('This might indicate a permissions issue or that the database is not accessible');
      }
    } catch (dbError) {
      console.error('❌ Error accessing database:', dbError.message);
      console.error('This might indicate the database does not exist or there are permission issues');
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.error('Full error:', error);
    return { success: false, error: error.message };
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

// Run the test
(async () => {
  const result = await testConnection();
  console.log('\nTest completed:', result.success ? '✅ Success' : '❌ Failed');
  if (!result.success) {
    process.exit(1);
  }
})();
