import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin or staff
    if (!session?.user?.role || !['admin', 'staff'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const bookingId = params.id;

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update the booking status to cancelled
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If booking is cancelled, we might want to send a notification email
    // This could be implemented here or in a separate service

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
