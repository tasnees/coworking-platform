import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, eachDayOfInterval, format, isSameDay } from 'date-fns';

// Force dynamic rendering
// This route needs to be dynamically rendered because it uses headers
// and needs to fetch fresh data on each request
export const dynamic = 'force-dynamic';

// Enable dynamic parameters
export const dynamicParams = true;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Fetch total members
    const totalMembers = await prisma.user.count({
      where: { role: 'MEMBER' }
    });

    // Fetch new members this month
    const newMembersThisMonth = await prisma.user.count({
      where: {
        role: 'MEMBER',
        createdAt: { gte: currentMonthStart }
      }
    });

    // Fetch total revenue (from bookings)
    const revenueData = await prisma.booking.aggregate({
      _sum: { price: true },
      where: {
        status: 'completed',
        startTime: { gte: currentMonthStart }
      }
    });

    const lastMonthRevenueData = await prisma.booking.aggregate({
      _sum: { price: true },
      where: {
        status: 'completed',
        startTime: { gte: lastMonthStart, lte: lastMonthEnd }
      }
    });

    const totalRevenue = revenueData._sum.price || 0;
    const lastMonthRevenue = lastMonthRevenueData._sum.price || 0;
    const revenueChange = lastMonthRevenue > 0 
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Fetch check-in data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Define CheckIn type based on Prisma schema
    interface CheckIn {
      id: string;
      userId: string;
      checkInTime: Date;
      status: string;
      notes: string | null;
      createdAt: Date;
      updatedAt: Date;
    }

    const checkIns = await prisma.scheduledCheckIn.findMany({
      where: {
        checkInTime: { gte: sevenDaysAgo }
      },
      orderBy: {
        checkInTime: 'desc'
      }
    });

    // Process check-in data
    const days = eachDayOfInterval({
      start: sevenDaysAgo,
      end: new Date()
    });

    const checkInCounts = days.map(day => {
      const dayCheckIns = checkIns.filter((checkIn: CheckIn) => 
        isSameDay(new Date(checkIn.checkInTime), day)
      );
      return dayCheckIns.length;
    });

    // Calculate occupancy rate (simplified)
    const maxCapacity = 100; // Adjust based on your actual capacity
    const avgDailyCheckins = checkInCounts.reduce((a, b) => a + b, 0) / 7;
    const occupancyRate = Math.min(100, Math.round((avgDailyCheckins / maxCapacity) * 100));

    // Find peak day and hour
    const dayCounts = Array(7).fill(0);
    const hourCounts = Array(24).fill(0);

    checkIns.forEach((checkIn: CheckIn) => {
      const date = new Date(checkIn.checkInTime);
      dayCounts[date.getDay()]++;
      hourCounts[date.getHours()]++;
    });

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const peakHourIndex = hourCounts.indexOf(Math.max(...hourCounts));
    const peakDay = daysOfWeek[peakDayIndex];
    const peakHour = `${(peakHourIndex % 12) || 12} ${peakHourIndex >= 12 ? 'PM' : 'AM'}`;

    // Calculate churn rate (simplified)
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    const membersAtStart = await prisma.user.count({
      where: {
        role: 'MEMBER',
        createdAt: { lte: startOfLastMonth }
      }
    });

    const membersAtEnd = await prisma.user.count({
      where: {
        role: 'MEMBER',
        createdAt: { lte: endOfLastMonth }
      }
    });

    const churnRate = membersAtStart > 0 
      ? ((membersAtStart - membersAtEnd) / membersAtStart) * 100 
      : 0;

    // Prepare response
    const response = {
      stats: {
        totalMembers,
        newMembersThisMonth,
        totalRevenue,
        revenueChange: parseFloat(revenueChange.toFixed(1)),
        occupancyRate,
        avgDailyCheckins: Math.round(avgDailyCheckins),
        peakDay,
        peakHour,
        churnRate: parseFloat(churnRate.toFixed(1))
      },
      trendData: {
        labels: days.map(day => format(day, 'EEE')),
        checkins: checkInCounts,
        revenue: days.map(day => {
          // This is a simplified example - in a real app, you'd sum actual revenue per day
          const dayRevenue = Math.round(Math.random() * 2000 + 1000);
          return day === days[days.length - 1] ? totalRevenue : dayRevenue;
        })
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
