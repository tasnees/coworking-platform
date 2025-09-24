import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db-utils';

export async function GET() {
  try {
    // Check if we're in a build/static generation context
    // During static generation, process.env.NEXT_PHASE might be 'phase-production-build'
    // or we can check if the database connection would fail
    if (process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.NODE_ENV === 'production' && process.env.BUILDING) {
      console.log('Build time detected, returning mock data for list-users');
      return NextResponse.json({
        success: true,
        count: 0,
        users: [],
        note: 'API route called during build time'
      });
    }

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

    // During build time, return empty data instead of failing
    if (process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.NODE_ENV === 'production' && process.env.BUILDING) {
      console.log('Build time error, returning empty data');
      return NextResponse.json({
        success: true,
        count: 0,
        users: [],
        note: 'Database unavailable during build time'
      });
    }

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
