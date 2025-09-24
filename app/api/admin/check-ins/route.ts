import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId, checkInTime, notes } = await request.json();

    // Validate required fields
    if (!userId || !checkInTime) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Create the check-in
    const checkIn = await prisma.scheduledCheckIn.create({
      data: {
        userId,
        checkInTime: new Date(checkInTime),
        status: 'scheduled',
        notes: notes || null,
      }
    });

    return NextResponse.json(checkIn);
  } catch (error) {
    console.error('Error creating check-in:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const checkIns = await prisma.scheduledCheckIn.findMany({
      orderBy: {
        checkInTime: 'desc',
      },
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
