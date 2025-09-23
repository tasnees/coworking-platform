import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const today = new Date();
    const recentBookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: today,
        },
        status: 'confirmed',
      },
      orderBy: {
        startTime: 'asc',
      },
      take: 4,
      include: {
        user: {
          select: {
            name: true,
          },
        },
        resource: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(recentBookings);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
