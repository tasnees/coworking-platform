import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('users');
    
    // Get counts for each collection
    const [memberCount, adminCount, staffCount] = await Promise.all([
      db.collection('member').countDocuments(),
      db.collection('admin').countDocuments(),
      db.collection('staff').countDocuments()
    ]);
    
    const allCollections = await db.listCollections().toArray();
    const collectionNames = allCollections.map(c => c.name);
    const expectedCollections = ['member', 'admin', 'staff'];
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MongoDB',
      counts: {
        member: memberCount,
        admin: adminCount,
        staff: staffCount,
        totalUsers: memberCount + adminCount + staffCount
      },
      collections: collectionNames,
      expectedCollections: expectedCollections,
      allCollectionsPresent: expectedCollections.every(c => 
        collectionNames.includes(c)
      )
    });
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to MongoDB',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
