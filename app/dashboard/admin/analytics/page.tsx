"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard-layout";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";

// Simple chart using chart.js and react-chartjs-2
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
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

  // Mock trend data for the graph
  const [trendData, setTrendData] = useState({
    labels: [
      "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
    ],
    checkins: [62, 70, 89, 74, 80, 65, 55],
    revenue: [2800, 3200, 4100, 3500, 3900, 3100, 2900],
  });

  // Simulate fetching real data (replace with your API call)
  useEffect(() => {
    // Example: Replace this with your real API call
    const fetchStats = async () => {
      // Simulate API delay
      await new Promise((res) => setTimeout(res, 500));
      setStats({
        totalMembers: 236,
        newMembersThisMonth: 18,
        totalRevenue: 21500,
        revenueChange: 7.2,
        occupancyRate: 82,
        avgDailyCheckins: 74,
        peakDay: "Wednesday",
        peakHour: "2:00 PM",
        churnRate: 2.1,
      });
      setTrendData({
        labels: [
          "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
        ],
        checkins: [62, 70, 89, 74, 80, 65, 55],
        revenue: [2800, 3200, 4100, 3500, 3900, 3100, 2900],
      });
    };
    fetchStats();
  }, []);

  // Chart.js data and options
  const lineData = {
    labels: trendData.labels,
    datasets: [
      {
        label: "Check-ins",
        data: trendData.checkins,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.1)",
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Revenue ($)",
        data: trendData.revenue,
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
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Key metrics and trends for your coworking space</p>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Members</CardTitle>
              <CardDescription>Current active members</CardDescription>
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
              <CardDescription>This month</CardDescription>
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
    </DashboardLayout>
  );
}