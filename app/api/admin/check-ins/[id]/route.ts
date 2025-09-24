import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

type StatusUpdate = {
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { status } = (await request.json()) as StatusUpdate;

    // Validate status
    if (!['scheduled', 'completed', 'cancelled', 'missed'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 });
    }

    // Update the check-in
    const updatedCheckIn = await prisma.scheduledCheckIn.update({
      where: { id: params.id },
      data: {
        status,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json(updatedCheckIn);
  } catch (error) {
    console.error('Error updating check-in:', error);
    
    // Handle case where check-in is not found
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return new NextResponse('Check-in not found', { status: 404 });
    }
    
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
