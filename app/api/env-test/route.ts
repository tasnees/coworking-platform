import { NextResponse } from 'next/server';

export async function GET() {
  // Get all environment variables (filter out sensitive info in production)
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL,
    MONGODB_URI: process.env.MONGODB_URI ? '***set***' : 'not set',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***set***' : 'not set',
    // Add any other environment variables you want to check
  };

  // Get request headers (simplified to avoid iteration issues)
  const headers: Record<string, string> = {};
  new Headers().forEach((_, key) => {
    headers[key] = '***';
  });

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    env,
    headers,
    message: 'Environment test endpoint',
  }, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
