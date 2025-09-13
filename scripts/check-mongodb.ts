import { MongoClient } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';

async function checkMongoDB() {
  console.log('Starting MongoDB connection check...');
  
  try {
    // Get the database instance
    const db = await getDatabase();
    console.log('Successfully connected to MongoDB');
    
    // Get database stats
    const stats = await db.stats();
    console.log('\nDatabase stats:', {
      db: stats.db,
      collections: stats.collections,
      objects: stats.objects,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexSize: stats.indexSize
    });
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name} (type: ${collection.type})`);
    });
    
    // Check if MembershipPlan collection exists
    const membershipPlanCollection = collections.find(c => c.name === 'MembershipPlan');
    if (membershipPlanCollection) {
      console.log('\nMembershipPlan collection found. Fetching documents...');
      const membershipPlans = await db.collection('MembershipPlan').find({}).toArray();
      console.log(`Found ${membershipPlans.length} membership plans:`);
      
      if (membershipPlans.length > 0) {
        console.log('Sample document:', {
          _id: membershipPlans[0]._id,
          name: membershipPlans[0].name,
          type: membershipPlans[0].type,
          price: membershipPlans[0].price,
          features: membershipPlans[0].features,
          active: membershipPlans[0].active,
          members: membershipPlans[0].members,
          createdAt: membershipPlans[0].createdAt,
          updatedAt: membershipPlans[0].updatedAt
        });
      }
    } else {
      console.log('\nMembershipPlan collection not found');
    }
    
  } catch (error) {
    console.error('Error checking MongoDB:', error);
  }
}

checkMongoDB();
