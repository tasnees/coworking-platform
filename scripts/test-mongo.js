// Simple MongoDB connection test script
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

console.log('🔌 Testing MongoDB connection...');
console.log(`MongoDB URI: ${MONGODB_URI.replace(/:([^:]+)@/, ':*****@')}`);

async function testConnection() {
  const client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: '1',
      strict: true,
      deprecationErrors: true,
    },
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  try {
    // Connect to the MongoDB cluster
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    // Send a ping to confirm a successful connection
    console.log('Pinging MongoDB...');
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB!');
    
    // List all databases
    console.log('\n📂 Listing databases:');
    const adminDb = client.db('admin');
    const result = await adminDb.admin().listDatabases();
    console.log('Databases:');
    result.databases.forEach(db => console.log(`- ${db.name}`));
    
    // Check if our database exists
    const dbName = 'coworking-platform';
    const dbExists = result.databases.some(db => db.name === dbName);
    
    if (dbExists) {
      console.log(`\n✅ Database '${dbName}' exists`);
      
      // Check collections in our database
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      console.log(`\n📚 Collections in '${dbName}':`);
      collections.forEach(col => console.log(`- ${col.name}`));
      
      // Check if users collection exists
      const usersCollection = collections.find(col => col.name === 'users');
      if (usersCollection) {
        console.log('\n👥 Users collection exists, checking documents...');
        const users = await db.collection('users').find({}).limit(5).toArray();
        console.log(`Found ${users.length} user(s):`);
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.role || 'no role'})`);
        });
      } else {
        console.log('\n❌ Users collection does not exist');
      }
    } else {
      console.log(`\n❌ Database '${dbName}' does not exist`);
    }
    
  } catch (error) {
    console.error('❌ Error during MongoDB connection test:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testConnection().catch(console.error);
