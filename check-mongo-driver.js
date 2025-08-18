// Check MongoDB driver installation and version
console.log('Checking MongoDB driver...');

try {
  const mongodb = require('mongodb');
  console.log('✅ MongoDB Node.js driver is installed');
  console.log('Version:', mongodb.version);
  
  // Test basic MongoDB client creation
  console.log('\nTesting client creation...');
  const { MongoClient } = mongodb;
  console.log('✅ MongoClient is available');
  
  // Test basic connection string parsing
  console.log('\nTesting connection string parsing...');
  const uri = 'mongodb+srv://test:test@cluster0.av4bvfl.mongodb.net/test?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  console.log('✅ Successfully created MongoClient');
  
  // Test connection
  console.log('\nTesting connection...');
  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // List databases
    console.log('\nListing databases:');
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log('Available databases:', dbs.databases.map(db => db.name));
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error(error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n🔍 Possible issues:');
      console.log('- Check your internet connection');
      console.log('- Verify MongoDB Atlas is running');
      console.log('- Check if your IP is whitelisted in MongoDB Atlas');
    }
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Connection closed');
    }
  }
  
} catch (error) {
  console.error('❌ MongoDB Node.js driver is not installed or there was an error:');
  console.error(error.message);
  
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('\nTo install the MongoDB Node.js driver, run:');
    console.log('npm install mongodb');
  }
}
