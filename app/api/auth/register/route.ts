import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB using the existing client utility
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'coworking-platform');

    // Start a session for transaction
    const session = client.startSession();
    let result: any = null;
    
    try {
      await session.withTransaction(async () => {
        // Check if user already exists
        const existingUser = await db.collection('users').findOne(
          { email },
          { session }
        );

        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await hash(password, 12);
        const now = new Date();

        // Create new user (default role is 'member')
        result = await db.collection('users').insertOne(
          {
            email,
            password: hashedPassword,
            name,
            role: 'member',
            emailVerified: null,
            image: null,
            status: 'active',
            createdAt: now,
            updatedAt: now,
          },
          { session }
        );

        // Create a member document for the new user
        await db.collection('members').insertOne(
          {
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
          },
          { session }
        );
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
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
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
