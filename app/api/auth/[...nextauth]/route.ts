import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Debug function to log request details
function logRequestDetails(req: Request) {
  const url = new URL(req.url);
  console.log('🔍 Request Details:', {
    method: req.method,
    url: req.url,
    pathname: url.pathname,
    search: url.search,
    headers: Object.fromEntries(req.headers.entries()),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
      RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL || 'not set'
    }
  });
}

// Initialize NextAuth with the authentication options
const handler = NextAuth({
  ...authOptions,
  // Enable debug logging
  debug: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
  logger: {
    error(code, metadata) {
      console.error('NextAuth error:', { code, metadata });
    },
    warn(code) {
      console.warn('NextAuth warning:', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
        console.debug('NextAuth debug:', { code, metadata });
      }
    },
  },
});

// Set CORS headers
function setCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  
  // Set CORS headers
  newHeaders.set('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || '*');
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  newHeaders.set('Access-Control-Allow-Credentials', 'true');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

// Export the handler with CORS headers and error handling
const authHandler = async (req: Request, res: any) => {
  try {
    logRequestDetails(req);
    
    // Handle OPTIONS method for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': process.env.NEXTAUTH_URL || '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }
    
    const response = await handler(req, res);
    
    // Add CORS headers to the response
    const corsResponse = setCorsHeaders(response);
    
    // Log the response
    console.log('✅ NextAuth response:', {
      status: corsResponse?.status,
      statusText: corsResponse?.statusText,
      headers: Object.fromEntries(corsResponse?.headers?.entries() || [])
    });
    
    // Add CORS headers
    const headers = new Headers(response?.headers || {});
    headers.set('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Access-Control-Allow-Credentials', 'true');
    
    return new NextResponse(response?.body, {
      status: response?.status,
      statusText: response?.statusText,
      headers
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ NextAuth handler error:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Authentication error', 
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
};

// Handle OPTIONS method for CORS preflight
const corsOptions = async () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXTAUTH_URL || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
};

// Export the handlers
const GET = authHandler;
const POST = authHandler;
const OPTIONS = corsOptions;

export { GET, POST, OPTIONS };
