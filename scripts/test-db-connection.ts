console.log('🔍 Starting MongoDB connection test...');

const { MongoClient, ObjectId } = require('mongodb');
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
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error('❌ Error loading environment variables:', error.message);
  } else {
    console.error('❌ An unknown error occurred while loading environment variables');
    console.error(error);
  }
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
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error('❌ Error parsing MONGODB_URI:', error.message);
  } else {
    console.error('❌ An unknown error occurred while parsing MONGODB_URI');
    console.error(error);
  }
  process.exit(1);
}

async function testConnection() {
  console.log('🔍 Starting database connection test...');
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    console.log('   Make sure you have a .env.local file with MONGODB_URI');
    process.exit(1);
  }

  console.log('🔗 MongoDB URI found in environment variables');
  
  // Log connection options without sensitive data
  const url = new URL(uri);
  console.log(`🌐 Connecting to: ${url.protocol}//${url.hostname}${url.port ? ':' + url.port : ''}`);
  console.log(`📂 Database: ${url.pathname ? url.pathname.substring(1) : 'default'}`);

  const client = new MongoClient(uri);
  
  try {
    // Test connection
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');

    // Test database access
    const db = client.db('coworking-platform');
    console.log(`✅ Successfully accessed database: ${db.databaseName}`);

    // Test users collection
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`📊 Found ${userCount} users in the database`);

    // Test sample query
    const sampleUser = await usersCollection.findOne({ email: 'staff@example.com' });
    if (sampleUser) {
      console.log('✅ Found sample user:', {
        _id: sampleUser._id,
        email: sampleUser.email,
        name: sampleUser.name,
        role: sampleUser.role
      });
    } else {
      console.log('ℹ️ No sample user found with email: staff@example.com');
    }

    // Test authentication
    console.log('\n🔐 Testing authentication...');
    const testUser = await usersCollection.findOne({ email: 'staff@example.com' });
    if (testUser) {
      console.log('✅ Authentication test successful');
      console.log('User details:', {
        id: testUser._id,
        email: testUser.email,
        role: testUser.role,
        createdAt: testUser.createdAt
      });
    } else {
      console.log('ℹ️ No test user found for authentication');
    }

  } catch (error) {
    console.error('❌ Error testing database connection:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testConnection().catch(console.error);
