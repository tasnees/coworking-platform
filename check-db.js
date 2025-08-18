const { MongoClient } = require('mongodb');

async function checkDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ Error: MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('🔌 Attempting to connect to MongoDB...');
  console.log('URI:', uri.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+@/, '$1***@'));
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    const db = client.db('coworking-platform');
    console.log('📊 Database:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\n📂 Collections:');
    console.log(collections.map(c => `- ${c.name}`).join('\n') || 'No collections found');
    
    // Check users collection
    if (collections.some(c => c.name === 'users')) {
      const users = db.collection('users');
      const count = await users.countDocuments();
      console.log(`\n👥 Users count: ${count}`);
      
      if (count > 0) {
        const user = await users.findOne({}, { projection: { password: 0 } });
        console.log('\n👤 Sample user:');
        console.log(JSON.stringify(user, null, 2));
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.syscall === 'getaddrinfo') {
      console.log('\n🔍 Network issue detected. Please check:');
      console.log('1. Internet connection');
      console.log('2. MongoDB Atlas IP whitelist');
      console.log('3. Connection string format');
    }
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

checkDB().catch(console.error);
