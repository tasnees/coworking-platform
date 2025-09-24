import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// POST /api/checkins - Create a new check-in
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Allow staff and members to check in
    if (!session?.user || !['admin', 'staff', 'member'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { userId, location, notes } = data;

    // If user is a member, they can only check in themselves
    const targetUserId = session.user.role === 'member' ? session.user.id : userId;

    if (!targetUserId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has an active check-in
    const existingActiveCheckIn = await prisma.checkIn.findFirst({
      where: {
        userId: targetUserId,
        status: 'active'
      }
    });

    if (existingActiveCheckIn) {
      return NextResponse.json(
        { message: 'User already has an active check-in' },
        { status: 400 }
      );
    }

    // Create the check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: targetUserId,
        checkInTime: new Date(),
        status: 'active',
        location: location || 'Main Desk',
        notes
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      }
    });

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/checkins - Get all check-ins
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'completed', or null for all
    const userId = searchParams.get('userId'); // Filter by specific user
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};

    // If user is not admin/staff, only show their own check-ins
    if (!['admin', 'staff'].includes(session.user.role)) {
      where.userId = session.user.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    const checkIns = await prisma.checkIn.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { checkInTime: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
