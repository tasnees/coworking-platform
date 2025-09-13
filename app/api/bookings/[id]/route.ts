import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 });
    }

    if (booking.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Instead of deleting, we'll mark it as cancelled
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
