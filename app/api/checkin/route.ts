import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db-utils';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { notes } = await request.json();
    const { db } = await getDb();

    // Create a new check-in record
    const checkIn = await db.collection('CheckIn').insertOne({
      userId: user.id,
      checkInTime: new Date(),
      status: 'completed',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update user's last login time
    await db.collection('User').updateOne(
      { _id: new ObjectId(user.id) },
      { $set: { lastLogin: new Date() } }
    );

    return NextResponse.json({
      success: true,
      checkIn: {
        id: checkIn.insertedId,
        checkInTime: new Date(),
        status: 'completed',
        notes: notes || ''
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
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await getDb();
    
    // Get user's check-in history (most recent first)
    const checkIns = await db.collection('CheckIn')
      .find({ userId: user.id })
      .sort({ checkInTime: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      checkIns: checkIns.map(checkIn => ({
        id: checkIn._id,
        checkInTime: checkIn.checkInTime,
        status: checkIn.status,
        notes: checkIn.notes
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
