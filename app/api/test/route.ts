import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db-utils';

export async function GET() {
  try {
    // Test database connection
    const result = await withDb(async (db) => {
      // Test database ping
      const pingResult = await db.command({ ping: 1 });
      
      // Get database stats
      const stats = await db.stats();
      
      // List collections
      const collections = await db.listCollections().toArray();
      
      // Count users
      const userCount = await db.collection('users').countDocuments();
      
      return {
        success: true,
        ping: pingResult,
        stats: {
          db: stats.db,
          collections: stats.collections,
          objects: stats.objects,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          fileSize: stats.fileSize,
        },
        collections: collections.map(c => c.name),
        userCount,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: result
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
