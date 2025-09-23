import { NextResponse } from 'next/server';
import getServerSession from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force this route to be dynamic (server-side only)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all resource types with their capacities
    const resources = await prisma.resource.groupBy({
      by: ['type'],
      _sum: {
        capacity: true,
      },
      _count: {
        _all: true,
      },
    });

    // Calculate occupied spaces for each resource type
    const spaceStatus = await Promise.all(
      resources.map(async (resource) => {
        const occupied = await prisma.booking.count({
          where: {
            resource: {
              type: resource.type,
            },
            startTime: {
              lte: new Date(),
            },
            endTime: {
              gte: new Date(),
            },
            status: 'confirmed',
          },
        });

        // Use capacity if available, otherwise count the number of resources
        const total = resource._sum.capacity || resource._count._all;
        
        return {
          name: resource.type,
          total,
          occupied,
          available: total - occupied,
        };
      })
    );

    return NextResponse.json(spaceStatus);
  } catch (error) {
    console.error('Error fetching space status:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
