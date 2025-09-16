import { NextResponse } from 'next/server';

// For static exports, we'll provide a basic test endpoint
// without database connectivity checks
// Static behavior for production, dynamic in development
export const dynamic = process.env.NODE_ENV === "production" ? "force-static" : "auto";

// Enable dynamic parameters
export const dynamicParams = true;

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    // In static export mode, we can't connect to MongoDB directly
    // Return a response indicating this is a static export
    return NextResponse.json(
      { 
        status: 'static_export',
        message: 'Database connectivity tests are disabled in static export mode',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        // Include any non-sensitive, public environment variables
        config: {
          node_env: process.env.NODE_ENV,
          next_public_api_url: process.env.NEXT_PUBLIC_API_URL,
        }
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    );
  } catch (error) {
    // Fallback response if something goes wrong
    return NextResponse.json(
      { 
        status: 'ok',
        message: 'Basic test endpoint is working (static export mode)',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  }
}
