// scripts/test-mongo-insert.js
const { MongoClient } = require('mongodb');

// Connection URI from your .env.local
const uri = 'mongodb+srv://grabatassnim:pvsd8mdXyqXKHgiT@cluster0.av4bvfl.mongodb.net/coworking-platform?retryWrites=true&w=majority';
const dbName = 'coworking-platform';

async function testInsert() {
  console.log('Testing MongoDB insert operation...');
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    const db = client.db(dbName);
    const testCollection = db.collection('test_collection');
    
    // Insert a test document
    const testDoc = {
      test: 'This is a test document',
      timestamp: new Date(),
      randomValue: Math.random()
    };
    
    console.log('\nInserting test document:', JSON.stringify(testDoc, null, 2));
    
    const result = await testCollection.insertOne(testDoc);
    console.log('✅ Document inserted with _id:', result.insertedId);
    
    // Verify the document was inserted
    const foundDoc = await testCollection.findOne({ _id: result.insertedId });
    if (foundDoc) {
      console.log('\n✅ Successfully retrieved inserted document:');
      console.log(JSON.stringify(foundDoc, null, 2));
      
      // Clean up - remove the test document
      await testCollection.deleteOne({ _id: result.insertedId });
      console.log('\n🧹 Cleaned up test document');
    } else {
      console.log('\n❌ Could not find the inserted document');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error('\n⚠️  Authentication failed. Please check your MongoDB username and password.');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('\n⚠️  Could not connect to MongoDB server. Please check your internet connection and the server status.');
    } else if (error.message.includes('not authorized')) {
      console.error('\n⚠️  Not authorized to access the database. Please check your database user permissions.');
    } else {
      console.error('\n⚠️  An unexpected error occurred:', error);
    }
    
  } finally {
    // Close the connection
    await client.close();
    console.log('\nConnection closed');
  }
}

// Run the test
testInsert().catch(console.error);
