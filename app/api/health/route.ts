import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getHealthStatus() {
  try {
    // Check database connection if MONGODB_URI is set
    let dbStatus = { status: 'unknown', message: 'Database check not performed' };
    
    if (process.env.MONGODB_URI) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 10000,
        });
        
        await client.connect();
        await client.db().command({ ping: 1 });
        dbStatus = { status: 'connected', message: 'Database connection successful' };
        await client.close();
      } catch (dbError) {
        dbStatus = { 
          status: 'error', 
          message: dbError instanceof Error ? dbError.message : 'Unknown database error',
          stack: process.env.NODE_ENV === 'development' ? (dbError as Error).stack : undefined
        };
      }
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      database: dbStatus,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        MONGODB_URI: process.env.MONGODB_URI ? '*** (set)' : 'not set',
      },
    };
  } catch (error) {
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    };
  }
}

export async function GET() {
  try {
    const response = await getHealthStatus();
    
    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    // Fallback response if something goes wrong
    return NextResponse.json(
      { 
        status: 'ok',
        message: 'Basic health check passed (static export mode)',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  }
}
