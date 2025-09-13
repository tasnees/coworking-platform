import { MongoClient } from 'mongodb';
import clientPromise from '@/lib/mongodb';

async function testMongoDBConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Get the MongoDB client
    const client = await clientPromise;
    
    // List all databases
    const adminDb = client.db().admin();
    const dbList = await adminDb.listDatabases();
    
    console.log('\nAvailable databases:');
    dbList.databases.forEach(db => console.log(`- ${db.name}`));
    
    // Get the current database name from the connection string
    const dbName = client.db().databaseName;
    console.log(`\nCurrent database: ${dbName}`);
    
    // List collections in the current database
    const collections = await client.db().listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => console.log(`- ${collection.name}`));
    
    // Check if MembershipPlan collection exists
    const membershipPlanExists = collections.some(c => c.name === 'MembershipPlan');
    console.log(`\nMembershipPlan collection exists: ${membershipPlanExists}`);
    
    if (membershipPlanExists) {
      const membershipPlans = await client.db().collection('MembershipPlan').find({}).toArray();
      console.log(`\nFound ${membershipPlans.length} membership plans`);
      if (membershipPlans.length > 0) {
        console.log('Sample membership plan:', {
          id: membershipPlans[0]._id,
          name: membershipPlans[0].name,
          type: membershipPlans[0].type,
          price: membershipPlans[0].price,
          features: membershipPlans[0].features
        });
      }
    }
    
  } catch (error) {
    console.error('Error testing MongoDB connection:', error);
  }
}

testMongoDBConnection();
