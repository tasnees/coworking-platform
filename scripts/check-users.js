console.log('Starting database check script...');

// Load environment variables
require('dotenv').config();
const { MongoClient } = require('mongodb');

// Log environment variables (masking sensitive data)
console.log('Environment variables:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? '*** (set)' : 'not set'}`);

if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function checkUsers() {
  console.log('\nCreating MongoDB client...');
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  
  try {
    console.log('\nAttempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');

    const db = client.db('coworking-platform');
    console.log('\nUsing database:', db.databaseName);

    // Check collections
    console.log('\nFetching collections...');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.length ? collections.map(c => c.name).join(', ') : 'none');

    // Check users collection
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\nFound ${userCount} users in the 'users' collection`);
    
    if (userCount > 0) {
      const users = await usersCollection.find({}, {
        projection: { password: 0 } // Don't include password hashes in the output
      }).limit(5).toArray();
      
      console.log('\nSample users (max 5):');
      console.log(JSON.stringify(users, null, 2));
    }

    // Check indexes
    try {
      const indexes = await usersCollection.indexes();
      console.log('\nIndexes on users collection:');
      console.log(JSON.stringify(indexes, null, 2));
    } catch (indexError) {
      console.log('\nCould not fetch indexes:', indexError.message);
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
    if (error.syscall === 'getaddrinfo') {
      console.error('\n⚠️  Network connectivity issue. Please check:');
      console.error('1. Your internet connection');
      console.error('2. MongoDB Atlas IP whitelist settings');
      console.error('3. MongoDB connection string format');
    }
  } finally {
    console.log('\nClosing MongoDB connection...');
    await client.close();
    console.log('✅ Connection closed');
  }
}

// Run the check
checkUsers()
  .then(() => console.log('\n✅ Script completed successfully'))
  .catch(err => console.error('❌ Script failed:', err));
