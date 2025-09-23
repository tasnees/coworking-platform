import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Helper function to calculate booking price
function calculateBookingPrice(start: Date, end: Date, rate: number): number {
  const diffInMs = end.getTime() - start.getTime();
  const hours = diffInMs / (1000 * 60 * 60);
  return parseFloat((hours * rate).toFixed(2));
}

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { 
      userId, 
      resourceId, 
      resourceName,
      startTime, 
      endTime, 
      notes, 
      status = 'confirmed' 
    } = data;
    
    // Validate required fields
    if (!userId || !resourceId || !resourceName || !startTime || !endTime) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!userId || !startTime || !endTime) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user and resource exist
    const [user, resource] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true }
      }),
      prisma.resource.findUnique({
        where: { id: resourceId }
      })
    ]) as [
      { id: string; name: string | null; email: string | null } | null,
      { id: string; name: string; type: string; hourlyRate: number } | null
    ];

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    if (!resource) {
      return NextResponse.json(
        { message: 'Resource not found' },
        { status: 404 }
      );
    }

    // Check for time conflicts for the resource
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        resourceId,
        status: { not: 'cancelled' },
        OR: [
          // Existing booking starts during new booking
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
          // Existing booking ends during new booking
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
          // New booking is within existing booking
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { message: 'This time slot is already booked for the selected resource' },
        { status: 409 }
      );
    }

    // Create the booking with resource information
    const booking = await prisma.booking.create({
      data: {
        userId,
        resourceId,
        resourceName: resourceName || resource.name,
        resourceType: resource.type,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status,
        notes,
        price: calculateBookingPrice(
          new Date(startTime),
          new Date(endTime),
          resource.hourlyRate || 0
        ),
        paid: false
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

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {
      status: { not: 'cancelled' },
    };

    if (startDate) {
      where.startTime = {
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      where.endTime = {
        lte: new Date(endDate)
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
