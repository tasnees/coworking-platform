import { NextResponse } from 'next/server';

// Helper function to log debug information
const debug = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[SIGNUP]', new Date().toISOString(), ...args);
  }
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const requestCounts = new Map<string, {count: number, resetTime: number}>();

// Simple in-memory cache for rate limiting
function checkRateLimit(ip: string): { allowed: boolean; headers: Record<string, string> } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  
  // Clean up old entries
  for (const [ip, data] of requestCounts.entries()) {
    if (data.resetTime < windowStart) {
      requestCounts.delete(ip);
    }
  }
  
  // Get or initialize request count for this IP
  const requestData = requestCounts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
  
  // Update request count
  requestCounts.set(ip, {
    count: requestData.count + 1,
    resetTime: requestData.resetTime
  });
  
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - (requestData.count + 1));
  
  return {
    allowed: remaining >= 0,
    headers: {
      'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': requestData.resetTime.toString(),
    },
  };
}

export async function POST(req: Request) {
  debug('Received signup request');
  
  if (req.method !== 'POST') {
    debug('Method not allowed');
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
      debug('Request body:', { ...body, password: '***' });
    } catch (parseError) {
      debug('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { name, email, password, role } = body;

    // Validate fields
    if (!name || !email || !password || !role) {
      debug('Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Basic validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    
    // Clean up old entries
    for (const [ip, data] of requestCounts.entries()) {
      if (data.resetTime < windowStart) {
        requestCounts.delete(ip);
      }
    }
    
    // Get or initialize request count for this IP
    const requestData = requestCounts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
    
    // Check rate limit
    if (requestData.count >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((requestData.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': requestData.resetTime.toString()
          }
        }
      );
    }
    
    // Update request count
    requestCounts.set(ip, {
      count: requestData.count + 1,
      resetTime: requestData.resetTime
    });

    // Check rate limit
    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(clientIp);
    
    if (!rateLimit.allowed) {
      debug('Rate limit exceeded for IP:', clientIp);
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { 
          status: 429,
          headers: rateLimit.headers
        }
      );
    }
    
    // Use production backend URL directly
    const backendUrl = 'https://coworking-platform-backend.onrender.com/api/auth/register';
    
    console.log('Using backend URL:', backendUrl);
    
    console.log('Environment variables:', {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      BACKEND_URL: process.env.BACKEND_URL
    });
    
    console.log('Proxying to:', backendUrl);
    console.log('Request body:', { name, email, password: '***', role });
    
    debug('Proxying signup request to backend:', backendUrl);
    
    try {
      const requestBody = {
        name,
        email,
        password,
        role,
      };
      
      console.log('Sending request to backend with body:', { ...requestBody, password: '***' });
      
      console.log('Sending request to backend:', {
        url: backendUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { ...requestBody, password: '***' } // Don't log actual password
      });
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        cache: 'no-store' // Prevent caching
      });
      
      console.log('Received response status:', response.status);
      
      console.log('Received response status:', response.status);
      // Convert headers to a plain object
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log('Response headers:', headers);

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        debug('Failed to parse JSON response:', parseError);
        debug('Response text:', responseText);
        throw new Error('Invalid server response');
      }
      
      debug('Backend response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      
      if (!response.ok) {
        return NextResponse.json(
          { 
            error: responseData.error || 'Registration failed',
            details: responseData.details
          },
          { 
            status: response.status,
            headers: rateLimit.headers
          }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        user: responseData.user,
      }, { 
        status: 201,
        headers: rateLimit.headers
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debug('Error during signup:', errorMessage);
      return NextResponse.json(
        { 
          error: 'Failed to connect to authentication service',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { 
          status: 502,
          headers: rateLimit.headers
        }
      );
    }
  } catch (error: unknown) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
