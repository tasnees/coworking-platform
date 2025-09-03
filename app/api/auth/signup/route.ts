import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { getDb } from '@/lib/db-utils';

// Enable debug logging
const debug = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEBUG]', new Date().toISOString(), ...args);
  }
};

interface UserDocument {
  name: string;
  email: string;
  password: string;
  role: 'member' | 'staff' | 'admin';
  createdAt: Date;
}

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    const { name, email, password, role } = await req.json();

    // Validate fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Ensure role is valid
    const allowedRoles = ['member', 'staff', 'admin'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    debug('Connecting to MongoDB...');
    const { db } = await getDb();
    debug('Using database:', db.databaseName);

    const usersCollection = db.collection('users');
    debug('Checking for existing user in users collection');
    
    // Check if email already exists in the users collection
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      debug('User already exists:', existingUser.email);
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user document
    const userDoc: UserDocument = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role as 'member' | 'staff' | 'admin',
      createdAt: new Date(),
    };

    // Insert into the users collection
    debug('Inserting new user into users collection:', { ...userDoc, password: '[HASHED]' });
    const result = await usersCollection.insertOne(userDoc);
    
    if (result.acknowledged && result.insertedId) {
      debug('User created successfully:', result.insertedId);
      return NextResponse.json(
        { 
          message: `${role} registered successfully`,
          userId: result.insertedId
        },
        { status: 201 }
      );
    } else {
      throw new Error('Failed to create user: Insert operation not acknowledged');
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
