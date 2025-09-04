// scripts/check-db.js
const { getDb } = require('../lib/db-utils');

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const { db } = await getDb();
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check if users collection exists
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`Found ${userCount} users in the database`);
    
    // List first few users (if any)
    if (userCount > 0) {
      const users = await usersCollection.find({}).limit(5).toArray();
      console.log('Sample users:', JSON.stringify(users, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();
