import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Disable static generation for this route
export const dynamic = 'force-dynamic';

// Cache the MongoDB connection
let cachedDb: MongoClient | null = null;

async function checkDatabaseConnection() {
  if (!process.env.MONGODB_URI) {
    return { 
      status: 'error', 
      message: 'MongoDB URI not configured',
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const startTime = Date.now();
    let connectionTime = 0;
    let pingTime = 0;
    let collectionsInfo = null;
    
    // Use cached connection if available
    if (!cachedDb) {
      const connectStart = Date.now();
      const client = new MongoClient(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
      });
      await client.connect();
      connectionTime = Date.now() - connectStart;
      cachedDb = client;
    }
    
    // Test the connection with a ping
    const pingStart = Date.now();
    await cachedDb.db('users').command({ ping: 1 });
    pingTime = Date.now() - pingStart;
    
    // Get collections info
    try {
      const collections = await cachedDb.db('users').listCollections().toArray();
      collectionsInfo = {
        count: collections.length,
        names: collections.map(c => c.name),
        expected: ['member', 'admin', 'staff']
      };
    } catch (error) {
      console.error('Error fetching collections:', error);
      collectionsInfo = { error: 'Failed to fetch collections' };
    }
    
    const totalTime = Date.now() - startTime;
    
    return { 
      status: 'ok', 
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      metrics: {
        connectionTime: cachedDb ? connectionTime : 0,
        pingTime,
        totalTime,
        usingCached: !!cachedDb
      },
      collections: collectionsInfo
    };
  } catch (err) {
    const error = err as Error;
    console.error('Database connection error:', error);
    // Reset connection on error
    if (cachedDb) {
      await cachedDb.close().catch(console.error);
      cachedDb = null;
    }
    return { 
      status: 'error', 
      message: 'Database connection failed',
      error: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
export async function GET() {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  try {
    // Check environment variables
    const requiredEnvVars = [
      'NODE_ENV',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'MONGODB_URI'
    ];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        { 
          status: 'error',
          timestamp,
          uptime: process.uptime(),
          message: 'Missing required environment variables',
          missing: missingEnvVars,
          nodeEnv: process.env.NODE_ENV,
          region: process.env.VERCEL_REGION || process.env.RENDER_REGION || 'unknown'
        },
        { status: 503 }
      );
    }
    // Check database connection
    const dbCheck = await checkDatabaseConnection();
    if (dbCheck.status === 'error') {
      return NextResponse.json(
        { 
          status: 'error',
          timestamp,
          uptime: process.uptime(),
          message: 'Database connection failed',
          error: dbCheck.message,
          nodeEnv: process.env.NODE_ENV,
          region: process.env.VERCEL_REGION || process.env.RENDER_REGION || 'unknown'
        },
        { status: 503 }
      );
    }
    const responseTime = Date.now() - startTime;
    return NextResponse.json(
      { 
        status: 'ok',
        timestamp,
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        checks: {
          database: dbCheck,
          env: 'ok',
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version,
          platform: process.platform,
          region: process.env.VERCEL_REGION || process.env.RENDER_REGION || 'unknown',
        },
        build: {
          nodeEnv: process.env.NODE_ENV,
          nextVersion: process.env.npm_package_dependencies_next || 'unknown',
          buildId: process.env.NEXT_PUBLIC_BUILD_ID || 'unknown',
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        timestamp,
        uptime: process.uptime(),
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        nodeEnv: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION || process.env.RENDER_REGION || 'unknown'
      },
      { status: 500 }
    );
  }
}
