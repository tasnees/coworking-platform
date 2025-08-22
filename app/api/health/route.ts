import { NextResponse } from 'next/server';

// For static exports, we'll provide a basic health check
// without database connectivity checks
export const dynamic = 'force-static';

export const revalidate = 60; // Revalidate every 60 seconds

async function getHealthStatus() {
  // Return basic health status for static exports
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    database: {
      status: 'static_export',
      message: 'Database connectivity checks disabled in static export mode'
    }
  };
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
