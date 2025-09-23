"use client";
import { useState, useEffect } from 'react';
// Import UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State for statistics
  const [stats, setStats] = useState({
    totalMembers: 0,
    newMembersThisMonth: 0,
    totalRevenue: 0,
    revenueChange: 0,
    occupancyRate: 0,
    avgDailyCheckins: 0,
    peakDay: "",
    peakHour: "",
    churnRate: 0,
  });
  // State for trend data
  const [trendData, setTrendData] = useState({
    labels: [] as string[],
    checkins: [] as number[],
    revenue: [] as number[],
  });
  // Dynamically import Chart.js and Line component on client side only
  const [Line, setLine] = useState<any>(null);
  useEffect(() => {
    // This effect only runs on the client side
    setIsMounted(true);
    // Dynamically import Chart.js and Line component
    const loadCharts = async () => {
      try {
        // Import Chart.js and registerables
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);
        // Import Line component from react-chartjs-2
        const { Line: LineChart } = await import('react-chartjs-2');
        setLine(() => LineChart);
        // Fetch data after charts are loaded
        await fetchAnalyticsData();
      } catch (err) {
        console.error('Failed to load charts:', err);
        setError('Failed to load analytics. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    // Fetch real analytics data
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/analytics');
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const data = await response.json();
        
        setStats({
          totalMembers: data.stats.totalMembers,
          newMembersThisMonth: data.stats.newMembersThisMonth,
          totalRevenue: data.stats.totalRevenue,
          revenueChange: data.stats.revenueChange,
          occupancyRate: data.stats.occupancyRate,
          avgDailyCheckins: data.stats.avgDailyCheckins,
          peakDay: data.stats.peakDay,
          peakHour: data.stats.peakHour,
          churnRate: data.stats.churnRate,
        });
        
        setTrendData({
          labels: data.trendData.labels,
          checkins: data.trendData.checkins,
          revenue: data.trendData.revenue,
        });
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadCharts();
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, []);
  // Don't render anything until the component is mounted on the client
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
    // Show loading state
  if (isLoading || !Line) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  // Chart.js data and options
  const lineData = {
    labels: trendData.labels.length > 0 ? trendData.labels : ['Loading...'],
    datasets: [
      {
        label: "Check-ins",
        data: trendData.checkins.length > 0 ? trendData.checkins : [0],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.1)",
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Revenue ($)",
        data: trendData.revenue.length > 0 ? trendData.revenue : [0],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.1)",
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Weekly Trends",
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: { display: true, text: "Check-ins" },
        grid: { drawOnChartArea: false },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: { display: true, text: "Revenue ($)" },
        grid: { drawOnChartArea: false },
      },
    },
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Members</CardTitle>
            <CardDescription>Active members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">{stats.totalMembers}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              +{stats.newMembersThisMonth} new this month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>This month (${stats.totalRevenue.toLocaleString()})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <span className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              <span className={stats.revenueChange >= 0 ? "text-green-600" : "text-red-600"}>
                {stats.revenueChange >= 0 ? "+" : ""}
                {stats.revenueChange}%
              </span>{" "}
              from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
            <CardDescription>Workspace utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span className="text-2xl font-bold">{stats.occupancyRate}%</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Peak: {stats.peakDay} at {stats.peakHour}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Avg. Daily Check-ins</CardTitle>
            <CardDescription>Member activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-purple-600" />
              <span className="text-2xl font-bold">{stats.avgDailyCheckins}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Churn rate: {stats.churnRate}%
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Weekly Trends</CardTitle>
          <CardDescription>
            Track check-ins and revenue for the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[350px]">
            <Line data={lineData} options={lineOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
