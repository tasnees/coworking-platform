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
    const { status } = await request.json();

    if (!status || !['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status. Must be "confirmed" or "cancelled"' },
        { status: 400 }
      );
    }

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

    // Update the booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
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

    // If booking is confirmed, we might want to send a confirmation email
    // This could be implemented here or in a separate service

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
