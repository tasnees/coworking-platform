import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db-utils';

export async function GET() {
  try {
    const { db } = await getDb();
    const users = await db.collection('users').find({}).toArray();
    
    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        _id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to list users',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
