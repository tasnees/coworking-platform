// Simple MongoDB connection test
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
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // List all databases
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    console.log('\n📂 Available databases:');
    dbs.databases.forEach(db => console.log(`- ${db.name}`));
    
    // Check if our database exists
    const targetDb = 'coworking-platform';
    const dbExists = dbs.databases.some(db => db.name === targetDb);
    
    if (dbExists) {
      console.log(`\n✅ Database '${targetDb}' exists`);
      
      // Check collections in our database
      const db = client.db(targetDb);
      const collections = await db.listCollections().toArray();
      console.log(`\n📚 Collections in '${targetDb}':`);
      
      if (collections.length > 0) {
        collections.forEach(col => console.log(`- ${col.name}`));
        
        // Check if users collection exists
        const usersCollection = collections.find(col => col.name === 'users');
        if (usersCollection) {
          console.log('\n👥 Users collection exists, checking documents...');
          const users = await db.collection('users').find({}).limit(5).toArray();
          console.log(`Found ${users.length} user(s):`);
          users.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.email || 'No email'} (${user.role || 'no role'})`);
          });
        } else {
          console.log('\n❌ Users collection does not exist');
        }
      } else {
        console.log('No collections found in the database');
      }
    } else {
      console.log(`\n❌ Database '${targetDb}' does not exist`);
    }
    
  } catch (error) {
    console.error('❌ Error during MongoDB connection test:', error);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

testConnection().catch(console.error);
