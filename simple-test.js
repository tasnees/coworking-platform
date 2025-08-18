console.log('Starting simple MongoDB test...');

const { MongoClient } = require('mongodb');

async function runTest() {
  console.log('1. Checking MONGODB_URI environment variable...');
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ Error: MONGODB_URI is not set in environment variables');
    return;
  }
  
  console.log('✅ MONGODB_URI is set');
  
  // Mask password in logs
  const maskedUri = uri.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+@/, '$1***@');
  console.log('   Using URI:', maskedUri);
  
  console.log('\n2. Creating MongoDB client...');
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });
  
  try {
    console.log('\n3. Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    console.log('\n4. Accessing database...');
    const db = client.db('coworking-platform');
    console.log(`✅ Connected to database: ${db.databaseName}`);
    
    console.log('\n5. Listing collections...');
    const collections = await db.listCollections().toArray();
    console.log('✅ Collections:', collections.map(c => c.name).join(', ') || 'None');
    
    if (collections.some(c => c.name === 'users')) {
      const users = db.collection('users');
      const count = await users.countDocuments();
      console.log(`\n6. Found ${count} users in the database`);
      
      if (count > 0) {
        const user = await users.findOne({}, { projection: { password: 0 } });
        console.log('\nSample user:');
        console.log(JSON.stringify(user, null, 2));
      }
    } else {
      console.log('\n6. No users collection found');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.syscall === 'getaddrinfo') {
      console.log('\n🔍 Network issue detected. Please check:');
      console.log('1. Internet connection');
      console.log('2. MongoDB Atlas IP whitelist');
      console.log('3. Connection string format');
    }
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n🔍 MongoDB Server Selection Error:');
      console.log(`- Error Code: ${error.codeName}`);
      console.log(`- Error Message: ${error.message}`);
    }
    
  } finally {
    console.log('\n7. Closing connection...');
    await client.close();
    console.log('✅ Connection closed');
  }
}

// Run the test
runTest().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
