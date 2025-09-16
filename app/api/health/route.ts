import { NextResponse } from 'next/server';

// Dynamic behavior configuration
export const dynamic = process.env.NODE_ENV === 'production' ? 'auto' : 'force-dynamic';
// Enable dynamic parameters
export const dynamicParams = true;
// Disable caching for development
export const revalidate = process.env.NODE_ENV === 'production' ? 60 : 0;

// For production with static exports, we'll use a simpler check

type DatabaseStatus = {
  status: 'connected' | 'error' | 'unknown';
  message: string;
  stack?: string;
};

async function getHealthStatus() {
  try {
    // Check database connection if MONGODB_URI is set
    let dbStatus: DatabaseStatus = { 
      status: 'unknown', 
      message: 'Database check not performed' 
    };
    
    if (process.env.MONGODB_URI) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 10000,
        });
        
        await client.connect();
        await client.db().command({ ping: 1 });
        dbStatus = { 
          status: 'connected', 
          message: 'Database connection successful' 
        };
        await client.close();
      } catch (dbError) {
        const error = dbError as Error;
        const status: DatabaseStatus = { 
          status: 'error', 
          message: error.message || 'Unknown database error'
        };
        
        if (process.env.NODE_ENV === 'development') {
          status.stack = error.stack;
        }
        
        dbStatus = status;
      }
    }

    const response = {
      status: 'ok' as const,
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
    
    return response;
  } catch (error) {
    const errorResponse = {
      status: 'error' as const,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      return { ...errorResponse, stack: error.stack };
    }
    
    return errorResponse;
  }
}

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  environment?: string;
  nodeVersion?: string;
  memoryUsage?: NodeJS.MemoryUsage;
  uptime?: number;
  database?: DatabaseStatus;
  env?: {
    NODE_ENV?: string;
    NEXT_PUBLIC_APP_URL?: string;
    NEXTAUTH_URL?: string;
    MONGODB_URI?: string;
  };
  error?: string;
  stack?: string;
  message?: string;
};

export async function GET() {
  // For static exports, return a simplified health check
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_OUTPUT_MODE === 'export') {
    const staticResponse: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'production (static export)',
      nodeVersion: process.version,
      uptime: process.uptime(),
      message: 'API is running in static export mode. Some features may be limited.'
    };
    
    return NextResponse.json(staticResponse, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  // Full health check for development and server environments
  try {
    const response = await getHealthStatus();
    const status = response.status === 'ok' ? 200 : 503;
    
    return NextResponse.json(response as HealthResponse, { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    const errorResponse: HealthResponse = {
      status: 'error',
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    };
    
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      errorResponse.error = error.message;
      errorResponse.stack = error.stack;
    }
    
    return NextResponse.json(
      errorResponse,
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}
