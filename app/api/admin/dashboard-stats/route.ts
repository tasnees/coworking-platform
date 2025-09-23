import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
}

interface DashboardStatsResponse {
  stats: DashboardStat[];
}

export async function GET(): Promise<NextResponse<DashboardStatsResponse | { error: string }>> {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get total members
    const totalMembers = await prisma.user.count({
      where: { role: 'member' }
    });

    // Get active bookings (for today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeBookings = await prisma.booking.count({
      where: {
        startTime: {
          lte: new Date(),
        },
        endTime: {
          gte: new Date()
        },
        status: 'confirmed'
      }
    });

    // Get monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyRevenue = await prisma.booking.aggregate({
      _sum: {
        price: true,
      },
      where: {
        startTime: {
          gte: thirtyDaysAgo,
        },
        paid: true,
      },
    });

    // Get occupancy rate (for today)
    const totalSpaces = await prisma.resource.aggregate({
      _sum: {
        capacity: true,
      },
    });

    const totalCapacity = totalSpaces._sum.capacity || 1; // Avoid division by zero
    
    const occupiedSpaces = await prisma.booking.count({
      where: {
        startTime: {
          lte: new Date(),
        },
        endTime: {
          gte: new Date()
        },
        status: 'confirmed'
      }
    });

    const occupancyRate = Math.round((occupiedSpaces / totalCapacity) * 100);

    // Calculate changes from previous period (simplified)
    // In a real app, you'd compare with actual previous period data
    const stats = [
      {
        title: 'Total Members',
        value: totalMembers.toString(),
        change: '+12%', // This would be calculated based on previous period in a real app
        changeType: 'positive' as const,
      },
      {
        title: 'Active Bookings',
        value: activeBookings.toString(),
        change: activeBookings > 0 ? '+5%' : '0%',
        changeType: activeBookings > 0 ? 'positive' : 'negative' as const,
      },
      {
        title: 'Monthly Revenue',
        value: `$${monthlyRevenue._sum.price?.toLocaleString() || '0'}`,
        change: '+18%', // This would be calculated based on previous period in a real app
        changeType: 'positive' as const,
      },
      {
        title: 'Occupancy Rate',
        value: `${occupancyRate}%`,
        change: occupancyRate > 50 ? '+2%' : '-2%',
        changeType: occupancyRate > 50 ? 'positive' : 'negative' as const,
      },
    ];

    const response: DashboardStatsResponse = {
      stats: [
        {
          title: 'Total Members',
          value: totalMembers.toString(),
          change: '+12%', // This would be calculated based on previous period in a real app
          changeType: 'positive',
        },
        {
          title: 'Active Bookings',
          value: activeBookings.toString(),
          change: activeBookings > 0 ? '+5%' : '0%',
          changeType: activeBookings > 0 ? 'positive' : 'negative',
        },
        {
          title: 'Monthly Revenue',
          value: `$${monthlyRevenue._sum.price?.toLocaleString() || '0'}`,
          change: '+18%', // This would be calculated based on previous period in a real app
          changeType: 'positive',
        },
        {
          title: 'Occupancy Rate',
          value: `${occupancyRate}%`,
          change: occupancyRate > 50 ? '+2%' : '-2%',
          changeType: occupancyRate > 50 ? 'positive' : 'negative',
        },
      ],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
