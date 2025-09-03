import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db-utils';

// For static exports, we need to handle API routes differently
if (process.env.NODE_ENV === 'production') {
  // These configurations are only needed for server-side rendering
  // For static exports, we'll handle the API routes through API routes
}

export async function GET() {
  try {
    // Check if we're in a static export
    if (process.env.NEXT_PHASE === 'phase-export' || process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { 
          status: 'ok',
          message: 'Test endpoint is working (static export mode)',
          timestamp: new Date().toISOString()
        },
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
          }
        }
      );
    }

    // Test MongoDB connection with timeout
    const connectionTest = await Promise.race([
      (async () => {
        const { db } = await getDb();
        const dbStats = await db.stats();
        const collections = await db.listCollections().toArray();
        return {
          success: true,
          status: 'connected',
          database: db.databaseName,
          collections: collections.map((c: { name: string }) => c.name),
          stats: {
            collections: dbStats.collections,
            objects: dbStats.objects,
            dataSize: dbStats.dataSize,
            storageSize: dbStats.storageSize,
            indexSize: dbStats.indexSize,
            indexCount: dbStats.indexes
          },
          // Move environment info here to avoid spread type issues
          timestamp: new Date().toISOString(),
          env: {
            nodeEnv: process.env.NODE_ENV || 'development',
            isDev: process.env.NODE_ENV !== 'production',
            isProd: process.env.NODE_ENV === 'production',
            nextAuthUrl: process.env.NEXTAUTH_URL,
            mongoDbConfigured: !!process.env.MONGODB_URI,
            // Note: We don't log the actual URI for security reasons
          }
        };
      })(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('MongoDB connection timeout after 5 seconds')), 5000)
      )
    ]);

    return NextResponse.json(connectionTest,
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'X-Database-Status': 'connected'
        }
      }
    );
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    
    // Detailed error response
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to connect to database',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined,
          mongoUri: process.env.MONGODB_URI ? 
            process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 
            'MONGODB_URI not set',
          nodeEnv: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        } : undefined
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
}
