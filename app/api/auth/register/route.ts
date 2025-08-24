import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { Role } from '@/components/RoleSelect';
import { withDb, withTransaction, getDb } from '@/lib/db-utils';

// Enable debug logging in development only
const DEBUG = process.env.NODE_ENV === 'development';

// Log function that only logs in development
function debugLog(...args: any[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Registration]', new Date().toISOString(), ...args);
  }
}

// Allowed roles for self-registration
const ALLOWED_ROLES: Role[] = ['member', 'staff'];

type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

// Add a delay function for debugging
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enable debug logging in all environments for now
console.log = (...args) => {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');
  process.stdout.write(`[${timestamp}] ${message}\n`);
};

export async function POST(request: Request) {
  console.log('🚀 --- Starting registration request ---');
  console.log('🌐 Request URL:', request.url);
  console.log('📝 Request method:', request.method);
  console.log('📋 Request headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
  
  try {
    debugLog('Parsing request body...');
    console.log('📥 Reading request body...');
    const body = await request.json().catch(error => {
      console.error('❌ Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body', details: error.message },
        { status: 400 }
      );
    });
    console.log('📦 Request body received:', JSON.stringify(body, null, 2));
    
    debugLog('Request body:', JSON.stringify(body, null, 2));
    
    const { name, email, password, role = 'member' as Role } = body as RegisterRequest;
    
    // Log the extracted values
    debugLog('Extracted values:', { 
      email: email ? '***' : 'undefined', 
      name: name ? '***' : 'undefined', 
      role: role || 'undefined',
      hasPassword: !!password
    });

    // Validate input with detailed logging
    debugLog('Validating input...');
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!name) missingFields.push('name');
    
    if (missingFields.length > 0) {
      debugLog('Validation failed - missing required fields:', missingFields);
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missingFields,
          receivedFields: {
            email: !!email,
            name: !!name,
            hasPassword: !!password,
            role: role || 'undefined'
          }
        },
        { status: 400 }
      );
    }

    // Validate role with logging
    debugLog('Validating role...');
    if (!ALLOWED_ROLES.includes(role)) {
      const errorMsg = `Invalid role specified: ${role}. Allowed roles: ${ALLOWED_ROLES.join(', ')}`;
      debugLog(errorMsg);
      return NextResponse.json(
        { 
          error: 'Invalid role specified',
          details: `Role must be one of: ${ALLOWED_ROLES.join(', ')}`,
          receivedRole: role
        },
        { status: 400 }
      );
    }

    debugLog('Starting registration process...');
    
    // Get a single database connection for the entire operation
    const { client, db } = await getDb();
    let userId: ObjectId | null = null;
    
    try {
      // Ensure collections exist (outside of transaction)
      console.log('🔍 Ensuring collections exist...');
      try {
        await db.collection('users').findOne({}); // This will create the collection if it doesn't exist
        console.log('✅ Users collection verified');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error accessing users collection:', errorMessage);
        return NextResponse.json(
          { 
            error: 'Database error', 
            message: 'Failed to access users collection',
            details: errorMessage 
          },
          { status: 500 }
        );
      }

      // Start a new session for the transaction
      const session = client.startSession();
      // Check if user already exists before starting the transaction
      console.log('🔍 Checking for existing user with email:', email);
      try {
        const existingUser = await db.collection('users').findOne(
          { email },
          { maxTimeMS: 5000 } // 5 second timeout
        );
        
        if (existingUser) {
          console.log('❌ User already exists in users collection');
          return NextResponse.json(
            { 
              error: 'User already exists',
              message: `User with email ${email} already exists`,
              timestamp: new Date().toISOString()
            },
            { status: 400 }
          );
        }
        console.log('✅ No existing user found, proceeding with registration');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error checking for existing user:', errorMessage);
        return NextResponse.json(
          { 
            error: 'Database error',
            message: 'Failed to check for existing user',
            details: errorMessage,
            timestamp: new Date().toISOString()
          },
          { status: 500 }
        );
      }
      
      console.log('🏗️ Starting user registration process...');
      const now = new Date();
      
      try {
        // 1. Create user document
        console.log('🔑 Hashing password...');
        const hashedPassword = await hash(password, 12);
        
        const userDoc = {
          email,
          password: hashedPassword,
          name,
          role,
          emailVerified: null,
          image: null,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };
        
        console.log('👤 Inserting user into users collection...');
        const userResult = await db.collection('users').insertOne(userDoc);
        userId = userResult.insertedId;
        console.log('✅ User inserted successfully, ID:', userId);
        
        // 2. Create member document
        const memberDoc = {
          userId: userId,
          name,
          email,
          role,
          status: 'active',
          membershipType: 'basic',
          joinDate: now,
          lastVisit: now,
          totalVisits: 0,
          createdAt: now,
          updatedAt: now,
        };
        
        console.log('👥 Inserting member document...');
        await db.collection('members').insertOne(memberDoc);
        console.log('✅ Member inserted successfully');
        
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error during registration:', errorMessage);
        
        // Cleanup if user was created but member wasn't
        if (userId) {
          try {
            await db.collection('users').deleteOne({ _id: userId });
            console.log('🧹 Cleaned up partially created user');
          } catch (cleanupError) {
            console.error('❌ Error during cleanup:', cleanupError);
          }
        }
        
        return NextResponse.json(
          { 
            error: 'Registration failed',
            message: 'Failed to complete registration',
            details: errorMessage,
            timestamp: now.toISOString()
          },
          { status: 500 }
        );
      }
      
      // Verify the user was actually inserted using the same connection
      const verifyUser = await db.collection('users').findOne({ _id: userId });
      
      if (!verifyUser) {
        throw new Error('User was not actually inserted into the database');
      }
      
      debugLog('✅ User verified in database:', verifyUser._id);
      debugLog('✅ Registration successful, user ID:', userId);
      
      return NextResponse.json(
        { 
          success: true,
          message: 'User created successfully', 
          userId: userId,
          email,
          role,
          timestamp: new Date().toISOString()
        },
        { status: 201 }
      );
      
    } catch (error) {
      debugLog('❌ Error during registration transaction:', error);
      
      // Clean up any partially created user
      if (userId) {
        debugLog('Cleaning up partially created user...');
        try {
          if (userId) {
            // We've already checked that userId is not null, but TypeScript needs help here
            const userIdToDelete = userId;
            await withDb(async (db) => {
              await db.collection('users').deleteOne({ _id: userIdToDelete });
              debugLog('Cleaned up partially created user');
            });
          } else {
            debugLog('No user ID to clean up');
          }
        } catch (cleanupError) {
          debugLog('Error during cleanup:', cleanupError);
        }
      }
      
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    debugLog('❌ Registration error:', errorMessage);
    
    // Extract more detailed error information
    let statusCode = 500;
    let errorDetails: { code: string; message: string } = { 
      code: 'internal_error', 
      message: 'An internal server error occurred' 
    };
    
    if (error instanceof Error) {
      debugLog('Error stack:', error.stack);
      
      // Handle specific error types with appropriate status codes
      if (error.message.includes('already exists')) {
        statusCode = 409; // Conflict
        errorDetails = { 
          code: 'user_exists', 
          message: 'A user with this email already exists' 
        };
      } else if (error.message.includes('validation') || error.message.includes('required')) {
        statusCode = 400; // Bad Request
        errorDetails = { 
          code: 'validation_error', 
          message: error.message 
        };
      } else if (process.env.NODE_ENV === 'development') {
        errorDetails.message = error.message;
      }
    }
    
    debugLog('Sending error response:', { statusCode, error: errorDetails });
    
    return NextResponse.json(
      { 
        success: false,
        error: errorDetails.message || 'An error occurred during registration',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error instanceof Error ? error.stack : undefined,
          originalError: error 
        }),
        ...errorDetails
      },
      { status: statusCode }
    );
    
  } finally {
    const endTime = new Date();
    const duration = endTime.getTime() - new Date().getTime();
    debugLog(`--- End of registration request (${duration}ms) ---\n`);
  }
}
