import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import type { Prisma, Booking, Resource } from '@prisma/client';

// This route needs to be dynamic because it uses auth() and headers
export const dynamic = 'force-dynamic';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
type ResourceType = Resource['type'];

export async function GET() {
  try {
    // Check if user is authenticated and has admin role
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Calculate total revenue (this would require payment records)
    const totalRevenue = 0; // Placeholder - implement actual calculation

    // Get all statistics in parallel
    const [
      totalMembers,
      activeBookings,
      availableResources,
      recentBookings,
      resourceStats
    ] = await Promise.all([
      // Total members count (excluding admins)
      prisma.user.count({
        where: { 
          role: { not: 'ADMIN' },
          status: 'active'
        }
      }),
      
      // Active bookings count (current time is between startTime and endTime)
      prisma.booking.count({
        where: {
          startTime: { lte: new Date() },
          endTime: { gte: new Date() },
          status: 'confirmed' as BookingStatus
        }
      }),
      
      // Available resources count
      prisma.resource.count({
        where: { 
          status: 'available'
        }
      }),
      
      // Recent bookings (last 5)
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { 
            select: { 
              name: true, 
              email: true 
            } 
          },
          resource: {
            select: {
              name: true,
              type: true
            }
          }
        }
      }),
      
      // Resource type statistics
      prisma.resource.groupBy({
        by: ['type'],
        _count: { _all: true },
        _sum: { 
          capacity: true 
        },
        where: { 
          status: 'available' 
        }
      })
    ]);

    // Process resource statistics
    const resourceTypeStats = resourceStats.map((resource: { 
      type: ResourceType; 
      _count: { _all: number }; 
      _sum: { capacity: number | null } 
    }) => ({
      type: resource.type,
      total: resource._count._all,
      available: resource._count._all, // This would be adjusted based on actual bookings
      capacity: resource._sum.capacity || 0
    }));

    // Format recent bookings
    const formattedBookings = recentBookings.map((booking: any) => ({
      id: booking.id,
      member: booking.user?.name || 'Unknown Member',
      resource: booking.resource?.name || 'Unknown Resource',
      type: booking.resource?.type || 'Unknown',
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status
    }));

    return NextResponse.json({
      stats: {
        totalMembers,
        activeBookings,
        totalRevenue,
        availableResources
      },
      resourceTypeStats,
      recentBookings: formattedBookings
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
