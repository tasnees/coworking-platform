import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Initialize NextAuth with the authentication options
const handler = NextAuth({
  ...authOptions,
  // Add any additional options here if needed
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

// Export the handler with CORS headers and error handling
const authHandler = async (req: Request, res: any) => {
  try {
    console.log('🔒 NextAuth request:', {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    });
    
    const response = await handler(req, res);
    
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
