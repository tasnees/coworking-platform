import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { cookies, headers } from 'next/headers';

// Helper function to handle CORS preflight requests
const handleCors = (request: Request) => {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', 
      process.env.NODE_ENV === 'production'
        ? 'https://coworking-platform.onrender.com'
        : 'http://localhost:3001'
    );
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return response;
  }
  
  return null;
};

// Define the MembershipPlan type based on your Prisma schema
// Define the database document type
interface DBMembershipPlan {
  _id: ObjectId;
  name: string;
  type: string;
  price: number;
  features: string[];
  active: boolean;
  members: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define the response type for the frontend
interface MembershipPlanResponse {
  id: string;
  name: string;
  type: string;
  price: number;
  features: string[];
  active: boolean;
  members: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: Request) {
  console.log('GET /api/memberships called');
  
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // For debugging - log the session and cookies
    const cookieStore = cookies();
    const authToken = cookieStore.get('next-auth.session-token') || 
                     cookieStore.get('__Secure-next-auth.session-token');
    
    console.log('Session:', session ? 'Authenticated' : 'No session');
    console.log('Auth token exists:', !!authToken);
    
    if (!session) {
      console.error('Unauthorized access - no valid session found');
      const response = NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'No valid session found. Please log in.'
        },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer',
          },
        }
      );
      
      // Set CORS headers for the error response
      response.headers.set('Access-Control-Allow-Origin', 
        process.env.NODE_ENV === 'production'
          ? 'https://coworking-platform.onrender.com'
          : 'http://localhost:3001'
      );
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      
      return response;
    }
    
    console.log('User authenticated:', {
      email: session.user?.email,
      role: (session.user as any)?.role
    });
    
    // Get the database instance
    const db = await getDatabase();
    
    // Log the collection names for debugging
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check if the collection exists
    const collectionExists = collections.some(c => c.name === 'MembershipPlan');
    if (!collectionExists) {
      console.error('Error: MembershipPlan collection does not exist');
      const response = NextResponse.json(
        { error: 'MembershipPlan collection not found' },
        { status: 404 }
      );
      
      // Set CORS headers for the error response
      response.headers.set('Access-Control-Allow-Origin', 
        process.env.NODE_ENV === 'production'
          ? 'https://coworking-platform.onrender.com'
          : 'http://localhost:3001'
      );
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      
      return response;
    }
    
    // Fetch membership plans from the database
    console.log('Fetching membership plans...');
    const membershipPlans = await db
      .collection<DBMembershipPlan>('MembershipPlan')
      .find({})
      .toArray();
    
    console.log(`Found ${membershipPlans.length} membership plans`);
    
    // Transform the data for the frontend
    const responseData: MembershipPlanResponse[] = membershipPlans.map(plan => {
      // Ensure _id is a valid ObjectId before calling toString()
      const id = plan._id && typeof plan._id === 'object' 
        ? plan._id.toString() 
        : String(plan._id);
        
      return {
        id,
        name: plan.name,
        type: plan.type,
        price: plan.price,
        features: plan.features,
        active: plan.active,
        members: plan.members,
        createdAt: plan.createdAt.toISOString(),
        updatedAt: plan.updatedAt.toISOString()
      };
    });
    
    const response = NextResponse.json(responseData);
    
    // Set CORS headers for the successful response
    response.headers.set('Access-Control-Allow-Origin', 
      process.env.NODE_ENV === 'production'
        ? 'https://coworking-platform.onrender.com'
        : 'http://localhost:3001'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return response;
  } catch (error) {
    console.error('Error in GET /api/memberships:', error);
    const errorResponse = NextResponse.json(
      { 
        error: 'Failed to fetch membership plans',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    
    // Set CORS headers for the error response
    errorResponse.headers.set('Access-Control-Allow-Origin', 
      process.env.NODE_ENV === 'production'
        ? 'https://coworking-platform.onrender.com'
        : 'http://localhost:3001'
    );
    errorResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return errorResponse;
  }
}

export async function POST(request: Request) {
  console.log('POST /api/memberships called');
  
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || data.price === undefined) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }
    
    // Get database instance
    const db = await getDatabase();
    
    // Create new membership plan
    const now = new Date();
    const newPlan = {
      name: data.name,
      type: data.type || 'flex',
      price: Number(data.price),
      features: Array.isArray(data.features) ? data.features : [],
      active: data.active !== false, // default to true if not specified
      members: 0, // Initialize with 0 members
      createdAt: now,
      updatedAt: now
    };
    
    // Insert into database
    const result = await db.collection('MembershipPlan').insertOne(newPlan);
    
    // Get the created plan
    const createdPlan = await db.collection('MembershipPlan').findOne({
      _id: result.insertedId
    });
    
    if (!createdPlan) {
      throw new Error('Failed to create membership plan');
    }
    
    // Transform the response
    const responseData: MembershipPlanResponse = {
      id: createdPlan._id.toString(),
      name: createdPlan.name,
      type: createdPlan.type,
      price: createdPlan.price,
      features: createdPlan.features,
      active: createdPlan.active,
      members: createdPlan.members,
      createdAt: createdPlan.createdAt.toISOString(),
      updatedAt: createdPlan.updatedAt.toISOString()
    };
    
    const response = NextResponse.json(responseData, { status: 201 });
    
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', 
      process.env.NODE_ENV === 'production'
        ? 'https://coworking-platform.onrender.com'
        : 'http://localhost:3001'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return response;
    
  } catch (error) {
    console.error('Error creating membership plan:', error);
    const errorResponse = NextResponse.json(
      { 
        error: 'Failed to create membership plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    
    // Set CORS headers for the error response
    errorResponse.headers.set('Access-Control-Allow-Origin', 
      process.env.NODE_ENV === 'production'
        ? 'https://coworking-platform.onrender.com'
        : 'http://localhost:3001'
    );
    errorResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return errorResponse;
  }
}

// This tells Next.js to revalidate the cache every 60 seconds
export const revalidate = 60;
