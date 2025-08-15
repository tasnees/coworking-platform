import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment variables
const MONGODB_URI = process.env.MONGODB_URI as string;
const DB_NAME = 'users';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

async function checkUsers() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    const db = client.db(DB_NAME);
    
    // List all collections
    console.log('\n📂 Collections in database:');
    const collections = await db.listCollections().toArray();
    
    for (const { name } of collections) {
      console.log(`\n📊 Collection: ${name}`);
      const count = await db.collection(name).countDocuments();
      console.log(`   Total documents: ${count}`);
      
      if (count > 0) {
        const sample = await db.collection(name).findOne({});
        console.log('   Sample document:', JSON.stringify({
          _id: sample?._id,
          email: sample?.email,
          name: sample?.name,
          role: sample?.role,
          createdAt: sample?.createdAt
        }, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await client.close();
    console.log('\n🏁 Check completed');
  }
}

checkUsers().catch(console.error);
