import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { UserRole } from '@/lib/auth-types';

// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

// Allowed roles for self-registration
const ALLOWED_ROLES: UserRole[] = ['member', 'staff'];

export async function POST(request: Request) {
  try {
    const { email, password, name, role = 'member' } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Connect to MongoDB using the existing client utility
    if (DEBUG) console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const dbName = process.env.DATABASE_NAME || 'coworking-platform';
    const db = client.db(dbName);
    
    if (DEBUG) {
      console.log('Connected to database:', dbName);
      console.log('Attempting to register user:', { email, name, role });
    }

    // Start a session for transaction
    const session = client.startSession();
    let result: any = null;
    
    try {
      await session.withTransaction(async () => {
        // Check if user already exists
        if (DEBUG) console.log('Checking for existing user with email:', email);
        const existingUser = await db.collection('users').findOne(
          { email },
          { session }
        );

        if (existingUser) {
          if (DEBUG) console.log('User already exists:', email);
          throw new Error('User with this email already exists');
        }
        
        if (DEBUG) console.log('No existing user found, proceeding with registration');

        // Hash password
        if (DEBUG) console.log('Hashing password...');
        const hashedPassword = await hash(password, 12);
        const now = new Date();
        
        if (DEBUG) console.log('Creating user document...');

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
        
        if (DEBUG) console.log('Inserting user document:', JSON.stringify(userDoc, null, 2));
        
        result = await db.collection('users').insertOne(
          userDoc,
          { session }
        );
        
        if (DEBUG) console.log('User inserted successfully, ID:', result.insertedId);

        // Create a member document for the new user
        const memberDoc = {
          userId: result.insertedId,
          name,
          email,
          status: 'active',
          membershipType: 'basic',
          joinDate: now,
          lastVisit: now,
          totalVisits: 0,
          createdAt: now,
          updatedAt: now,
        };
        
        if (DEBUG) console.log('Inserting member document:', JSON.stringify(memberDoc, null, 2));
        
        const memberResult = await db.collection('members').insertOne(
          memberDoc,
          { session }
        );
        
        if (DEBUG) console.log('Member inserted successfully, ID:', memberResult.insertedId);
      });
    } catch (error) {
      if (DEBUG) console.error('Error during registration transaction:', error);
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
      if (DEBUG) console.log('Database session ended');
    }

    if (!result || !result.insertedId) {
      throw new Error('Failed to create user');
    }

    return NextResponse.json(
      { message: 'User created successfully', userId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to register user';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
