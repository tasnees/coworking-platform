import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

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

    const client = await clientPromise;
    const db = client.db('users');

    // Check if email already exists in that specific collection
    const existingUser = await db.collection(role).findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: `Email already registered as ${role}` },
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

    // Insert into the correct collection based on role
    await db.collection(role).insertOne(userDoc);

    return NextResponse.json(
      { message: `${role} registered successfully` },
      { status: 201 }
    );
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
