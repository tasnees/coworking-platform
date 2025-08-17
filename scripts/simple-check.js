// Simple script to check if we can require and use the MongoDB driver
console.log('=== Starting MongoDB Simple Check ===');

try {
  console.log('1. Attempting to require mongodb...');
  const { MongoClient } = require('mongodb');
  console.log('✅ Successfully required mongodb');
  
  console.log('2. MongoDB version:', require('mongodb/package.json').version);
  
  console.log('3. Creating a simple MongoDB client...');
  const client = new MongoClient('mongodb://localhost:27017', {
    connectTimeoutMS: 3000,
    serverSelectionTimeoutMS: 3000
  });
  
  console.log('4. Attempting to connect to local MongoDB...');
  await client.connect();
  console.log('✅ Successfully connected to MongoDB!');
  
  console.log('5. Listing databases...');
  const adminDb = client.db('admin');
  const result = await adminDb.admin().listDatabases();
  console.log('Available databases:');
  result.databases.forEach(db => console.log(` - ${db.name}`));
  
  await client.close();
  
} catch (error) {
  console.error('❌ Error:');
  console.error(error);
  process.exit(1);
}

console.log('=== Test completed successfully ===');
