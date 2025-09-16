import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db-utils';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';

// Force dynamic rendering
// This route needs to be dynamically rendered because it uses currentUser()
// and needs to fetch fresh data on each request
// Dynamic behavior is automatically handled by Next.js in production
export const dynamic = process.env.NODE_ENV === "production" ? "auto" : "force-dynamic";

// Enable dynamic parameters
export const dynamicParams = true;

interface CheckInRequest {
  userId: string;
  checkInTime: string; // ISO string
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const { userId, checkInTime, notes } = await request.json() as CheckInRequest;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { db } = await getDb();
    const checkInDate = new Date(checkInTime);

    if (isNaN(checkInDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid check-in time' },
        { status: 400 }
      );
    }

    // Create a new scheduled check-in record
    const checkIn = await db.collection('CheckIn').insertOne({
      userId: new ObjectId(userId),
      checkInTime: checkInDate,
      status: 'scheduled',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Get the created check-in with user details
    const createdCheckIn = await db.collection('CheckIn').findOne({
      _id: checkIn.insertedId
    });

    // Get user details
    const user = await db.collection('User').findOne({
      _id: new ObjectId(userId)
    });

    if (!createdCheckIn) {
      throw new Error('Failed to create check-in');
    }

    return NextResponse.json({
      success: true,
      checkIn: {
        id: createdCheckIn._id,
        user: {
          id: user?._id,
          name: user?.name,
          email: user?.email
        },
        checkInTime: createdCheckIn.checkInTime,
        status: createdCheckIn.status,
        notes: createdCheckIn.notes,
        createdAt: createdCheckIn.createdAt,
        updatedAt: createdCheckIn.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create check-in',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await getDb();
    
    // Check if user is admin
    const user = await db.collection('User').findOne({ _id: new ObjectId(userId) });
    const isAdmin = user?.role === 'admin';
    
    // If not admin, only return current user's check-ins
    const query = isAdmin ? {} : { userId: new ObjectId(userId) };
    
    // Get check-ins with user details
    const checkIns = await db.collection('CheckIn')
      .aggregate([
        { $match: query },
        { $sort: { checkInTime: -1 } },
        {
          $lookup: {
            from: 'User',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 1,
            userId: 1,
            checkInTime: 1,
            status: 1,
            notes: 1,
            createdAt: 1,
            updatedAt: 1,
            user: {
              _id: 1,
              name: 1,
              email: 1
            }
          }
        }
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      checkIns: checkIns.map(checkIn => ({
        id: checkIn._id,
        user: {
          id: checkIn.user._id,
          name: checkIn.user.name,
          email: checkIn.user.email
        },
        checkInTime: checkIn.checkInTime,
        status: checkIn.status,
        notes: checkIn.notes,
        createdAt: checkIn.createdAt,
        updatedAt: checkIn.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch check-ins',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
