import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
console.log(`Loading environment from: ${envPath}`);

try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('Error loading .env.local:', result.error);
  } else {
    console.log('Successfully loaded .env.local');
  }
} catch (error) {
  console.error('Failed to load .env.local:', error);
}

// Get MongoDB URI from environment
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

console.log('🔌 Testing MongoDB connection...');
console.log(`MongoDB URI: ${MONGODB_URI.replace(/:([^:]+)@/, ':*****@')}`);

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
});

async function testConnection() {
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
    const databases = await client.db().admin().listDatabases();
    databases.databases.forEach(db => console.log(`- ${db.name}`));
    
    // Check if the target database exists
    const targetDb = 'coworking-platform';
    const dbExists = databases.databases.some(db => db.name === targetDb);
    
    if (dbExists) {
      console.log(`\n✅ Database '${targetDb}' exists`);
      
      // Check collections
      const db = client.db(targetDb);
      const collections = await db.listCollections().toArray();
      console.log(`\n📚 Collections in '${targetDb}':`);
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
      console.log(`\n❌ Database '${targetDb}' does not exist`);
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
