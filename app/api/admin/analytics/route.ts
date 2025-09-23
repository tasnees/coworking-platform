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

    // Get current date and calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    // Get total members
    const totalMembers = await prisma.user.count({
      where: {
        status: 'active'
      }
    });

    // Get new members this month
    const newMembersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth
        },
        status: 'active'
      }
    });

    // Get total revenue (from paid bookings)
    const revenueData = await prisma.booking.aggregate({
      _sum: {
        price: true
      },
      where: {
        paid: true,
        startTime: {
          gte: startOfMonth
        }
      }
    });

    const totalRevenue = revenueData._sum.price || 0;

    // Get check-in data for the current week
    const checkInsThisWeek = await prisma.scheduledCheckIn.count({
      where: {
        checkInTime: {
          gte: startOfWeek
        },
        status: 'completed'
      }
    });

    // Calculate average daily check-ins
    const daysInWeek = 7;
    const avgDailyCheckins = Math.round(checkInsThisWeek / daysInWeek);

    // Get peak day and hour (simplified for now)
    const peakDay = 'Wednesday'; // This would require more complex aggregation
    const peakHour = '2:00 PM';  // This would require more complex aggregation

    // Calculate occupancy rate (simplified)
    const totalBookings = await prisma.booking.count({
      where: {
        startTime: {
          gte: startOfMonth
        },
        status: 'confirmed'
      }
    });

    // This is a simplified calculation - adjust based on your actual business logic
    const maxPossibleBookings = 1000; // Adjust this based on your capacity
    const occupancyRate = Math.min(100, Math.round((totalBookings / maxPossibleBookings) * 100));

    // Calculate churn rate (simplified)
    const cancelledMembers = await prisma.user.count({
      where: {
        status: 'cancelled',
        updatedAt: {
          gte: startOfMonth
        }
      }
    });

    const churnRate = totalMembers > 0 ? (cancelledMembers / totalMembers) * 100 : 0;

    // Get trend data for the past 7 days
    const trendLabels = [];
    const checkinData = [];
    const revenueTrend = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Get check-ins for the day
      const checkins = await prisma.scheduledCheckIn.count({
        where: {
          checkInTime: {
            gte: dayStart,
            lte: dayEnd
          },
          status: 'completed'
        }
      });
      
      // Get revenue for the day
      const revenue = await prisma.booking.aggregate({
        _sum: {
          price: true
        },
        where: {
          paid: true,
          startTime: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });
      
      trendLabels.push(dayStart.toLocaleDateString('en-US', { weekday: 'short' }));
      checkinData.push(checkins);
      revenueTrend.push(Number(revenue._sum.price) || 0);
    }

    return NextResponse.json({
      stats: {
        totalMembers,
        newMembersThisMonth,
        totalRevenue,
        revenueChange: 0, // This would require historical data to calculate
        occupancyRate,
        avgDailyCheckins,
        peakDay,
        peakHour,
        churnRate: parseFloat(churnRate.toFixed(1))
      },
      trendData: {
        labels: trendLabels,
        checkins: checkinData,
        revenue: revenueTrend
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
