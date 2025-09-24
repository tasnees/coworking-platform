import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// PATCH /api/checkins/[id]/checkout - Check out a user
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Allow staff, admin, and members to check out
    if (!session?.user || !['admin', 'staff', 'member'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const checkInId = params.id;
    const data = await request.json();
    const { location, notes } = data;

    // Find the check-in
    const checkIn = await prisma.checkIn.findUnique({
      where: { id: checkInId },
    });

    if (!checkIn) {
      return NextResponse.json(
        { message: 'Check-in not found' },
        { status: 404 }
      );
    }

    // If user is a member, they can only check out themselves
    if (session.user.role === 'member' && checkIn.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if already checked out
    if (checkIn.status === 'completed') {
      return NextResponse.json(
        { message: 'User is already checked out' },
        { status: 400 }
      );
    }

    // Update the check-in
    const updatedCheckIn = await prisma.checkIn.update({
      where: { id: checkInId },
      data: {
        checkOutTime: new Date(),
        status: 'completed',
        location: location || checkIn.location,
        notes: notes || checkIn.notes
      }
    });

    return NextResponse.json(updatedCheckIn, { status: 200 });
  } catch (error) {
    console.error('Error checking out:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
