import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { UserRole } from '@/lib/auth-types';
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
const ALLOWED_ROLES: UserRole[] = ['member', 'staff'];

// Add a delay function for debugging
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  debugLog('--- Starting registration request ---');
  debugLog('Request URL:', request.url);
  debugLog('Request headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
  
  try {
    debugLog('Parsing request body...');
    const body = await request.json().catch(error => {
      debugLog('Error parsing request body:', error);
      throw new Error('Invalid request body');
    });
    
    debugLog('Request body:', JSON.stringify(body, null, 2));
    
    const { email, password, name, role = 'member' } = body;
    
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
    const session = client.startSession();
    let userId: ObjectId | null = null;
    
    try {
      const result = await session.withTransaction(async () => {
        debugLog('Transaction started at:', new Date().toISOString());
        
        // Test the connection by listing collections
        debugLog('Successfully connected to database:', db.databaseName);
        const collections = await db.listCollections({}, { session }).toArray();
        debugLog(`Found ${collections.length} collections in database`);
        collections.forEach((col: { name: string }, i: number) => {
          debugLog(`  ${i + 1}. ${col.name}`);
        });

        // Check if user already exists in the users collection
        debugLog('Checking for existing user with email:', email);
        const existingUser = await db.collection('users').findOne(
          { email },
          { session }
        );
        
        if (existingUser) {
          debugLog('User already exists in users collection');
          throw new Error(`User with email ${email} already exists`);
        }
        
        debugLog('No existing user found, proceeding with registration');

        // Hash password
        debugLog('Hashing password...');
        const hashedPassword = await hash(password, 12);
        const now = new Date();
        
        debugLog('Creating user document...');

        // Create new user with selected role
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
        
        debugLog('Inserting user into users collection');
        const userResult = await db.collection('users').insertOne(
          userDoc,
          { session }
        );
        
        userId = userResult.insertedId;
        debugLog('User inserted successfully, ID:', userId);
        
        // Create a member document for the new user
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
        
        debugLog('Inserting member document');
        await db.collection('members').insertOne(
          memberDoc,
          { session }
        );
        
        debugLog('Member inserted successfully');
        debugLog('Transaction completed successfully at:', new Date().toISOString());
        
        return { userId };
      });
      
      debugLog('✅ Transaction committed successfully');
      
      if (!userId) {
        throw new Error('User ID was not set during registration');
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
