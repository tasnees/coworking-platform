"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import DashboardLayout from "@/components/dashboard-layout"
import { Users, Calendar, DollarSign, TrendingUp, MapPin, Clock, Wifi, Coffee, BarChart, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Stat {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ComponentType<{ className?: string }>;
}

interface Booking {
  id: number;
  member: string;
  resource: string;
  time: string;
  status: 'active' | 'upcoming' | 'completed';
}

interface SpaceStatus {
  name: string;
  total: number;
  occupied: number;
  available: number;
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [stats, setStats] = useState<Stat[]>([])
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [spaceStatus, setSpaceStatus] = useState<SpaceStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only run on client
    setIsClient(true)
    
    // Simulate data fetching
    const loadData = async () => {
      try {
        // In a real app, you would fetch this data from an API
        const statsData: Stat[] = [
          {
            title: "Total Members",
            value: "1,234",
            change: "+12%",
            changeType: "positive",
            icon: Users,
          },
          {
            title: "Active Bookings",
            value: "89",
            change: "+5%",
            changeType: "positive",
            icon: Calendar,
          },
          {
            title: "Monthly Revenue",
            value: "$45,231",
            change: "+18%",
            changeType: "positive",
            icon: DollarSign,
          },
          {
            title: "Occupancy Rate",
            value: "78%",
            change: "-2%",
            changeType: "negative",
            icon: TrendingUp,
          },
        ]

        const bookingsData: Booking[] = [
          { id: 1, member: "John Doe", resource: "Desk A-12", time: "9:00 AM - 5:00 PM", status: "active" },
          { id: 2, member: "Jane Smith", resource: "Meeting Room B", time: "2:00 PM - 4:00 PM", status: "upcoming" },
          { id: 3, member: "Mike Johnson", resource: "Private Office 3", time: "10:00 AM - 6:00 PM", status: "active" },
          { id: 4, member: "Sarah Wilson", resource: "Desk C-05", time: "1:00 PM - 7:00 PM", status: "upcoming" },
        ]

        const spaceStatusData: SpaceStatus[] = [
          { name: "Hot Desks", total: 50, occupied: 38, available: 12 },
          { name: "Meeting Rooms", total: 8, occupied: 3, available: 5 },
          { name: "Private Offices", total: 12, occupied: 9, available: 3 },
          { name: "Phone Booths", total: 6, occupied: 2, available: 4 },
        ]

        setStats(statsData)
        setRecentBookings(bookingsData)
        setSpaceStatus(spaceStatusData)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user")
      router.push("/auth/login")
    }
  }
  // Show loading state during initial data load
  if (!isClient || isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at your coworking space today.</p>
        </div>
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest space reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(recentBookings) && recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <div key={`booking-${booking.id}`} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{booking.member}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.resource} • {booking.time}
                        </p>
                      </div>
                      <Badge variant={booking.status === "active" ? "default" : "secondary"}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent bookings found</p>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Space Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Space Utilization</CardTitle>
              <CardDescription>Real-time occupancy status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(spaceStatus) && spaceStatus.length > 0 ? (
                  spaceStatus.map((space) => (
                    <div key={`space-${space.name.replace(/\s+/g, '-').toLowerCase()}`} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{space.name}</span>
                        <span className="text-muted-foreground">
                          {space.occupied}/{space.total}
                        </span>
                      </div>
                      <Progress value={(space.occupied / space.total) * 100} className="h-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No space status data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your coworking space efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-20 flex-col gap-2">
                <Link href="/dashboard/admin/floorplan">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm">View Floor Plan</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/dashboard/admin/hours">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm">Manage Hours</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/dashboard/admin/wifi">
                  <Wifi className="h-5 w-5" />
                  <span className="text-sm">WiFi Settings</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/dashboard/admin/amenities">
                  <Coffee className="h-5 w-5" />
                  <span className="text-sm">Amenities</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Additional Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Tools</CardTitle>
            <CardDescription>Access more administrative tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/dashboard/admin/analytics">
                  <BarChart className="h-5 w-5" />
                  <span className="text-sm">Analytics</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/dashboard/admin/settings">
                  <Settings className="h-5 w-5" />
                  <span className="text-sm">Settings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Logout Button */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
