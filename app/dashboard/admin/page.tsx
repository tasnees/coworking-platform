"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, DollarSign, TrendingUp, MapPin, Clock, Wifi, Coffee, BarChart, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Stat {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
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

  // Mock stats data
  const mockStats: Stat[] = [
    {
      title: 'Total Members',
      value: '124',
      change: '+12%',
      changeType: 'positive',
      icon: Users
    },
    {
      title: 'Active Bookings',
      value: '24',
      change: '+4%',
      changeType: 'positive',
      icon: Calendar
    },
    {
      title: 'Revenue',
      value: '$12,450',
      change: '+8.2%',
      changeType: 'positive',
      icon: DollarSign
    },
    {
      title: 'Available Spaces',
      value: '18/30',
      change: '-2',
      changeType: 'negative',
      icon: MapPin
    }
  ]

  useEffect(() => {
    // Only run on client
    setIsClient(true);
    
    const loadData = async () => {
      try {
        // Set loading state
        setIsLoading(true);
        
        // Initialize with mock data in case of errors
        const mockStats: Stat[] = [
          {
            title: 'Total Members',
            value: '0',
            change: '0%',
            changeType: 'positive',
            icon: Users
          },
          {
            title: 'Active Bookings',
            value: '0',
            change: '0%',
            changeType: 'positive',
            icon: Calendar
          },
          {
            title: 'Monthly Revenue',
            value: '$0',
            change: '0%',
            changeType: 'positive',
            icon: DollarSign
          },
          {
            title: 'Occupancy Rate',
            value: '0%',
            change: '0%',
            changeType: 'positive',
            icon: TrendingUp
          }
        ];

        // Try to fetch real data
        try {
          // Fetch stats from API
          const statsResponse = await fetch('/api/admin/dashboard-stats');
          if (statsResponse.ok) {
            const { stats: statsData } = await statsResponse.json();
            
            // Define the icon map with proper types
            const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
              'Total Members': Users,
              'Active Bookings': Calendar,
              'Monthly Revenue': DollarSign,
              'Occupancy Rate': TrendingUp,
            };
            
            // Map the stats to include icons
            const statsWithIcons = statsData.map((stat: { title: string }) => ({
              ...stat,
              icon: iconMap[stat.title] || BarChart
            }));
            
            setStats(statsWithIcons);
          } else {
            setStats(mockStats);
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
          setStats(mockStats);
        }

        // Load recent bookings
        try {
          const today = new Date();
          const recentBookingsResponse = await fetch('/api/admin/bookings/recent');
          
          if (recentBookingsResponse.ok) {
            const bookings = await recentBookingsResponse.json();
            const bookingsData: Booking[] = bookings.map((booking: any) => ({
              id: booking.id,
              member: booking.user?.name || 'Unknown Member',
              resource: `${booking.resource?.type || 'Resource'} - ${booking.resource?.name || 'Unknown'}`,
              time: `${new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              status: new Date() >= new Date(booking.startTime) && new Date() <= new Date(booking.endTime) ? 'active' : 'upcoming',
            }));
            setRecentBookings(bookingsData);
          } else {
            setRecentBookings([]);
          }
        } catch (error) {
          console.error("Error fetching recent bookings:", error);
          setRecentBookings([]);
        }

        // Load space status
        try {
          const spaceStatusResponse = await fetch('/api/admin/space-status');
          
          if (spaceStatusResponse.ok) {
            const spaceStatusData = await spaceStatusResponse.json();
            setSpaceStatus(spaceStatusData);
          } else {
            setSpaceStatus([]);
          }
        } catch (error) {
          console.error("Error fetching space status:", error);
          setSpaceStatus([]);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening at your coworking space today.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium truncate">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{stat.value}</div>
              <p className="text-xs text-muted-foreground truncate">
                <span className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width on large screens */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recent Bookings */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest space reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.length > 0 ? (
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
                {spaceStatus.map((space) => (
                  <div key={`space-${space.name.replace(/\s+/g, '-').toLowerCase()}`} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{space.name}</span>
                      <span className="text-muted-foreground">
                        {space.occupied}/{space.total}
                      </span>
                    </div>
                    <Progress value={(space.occupied / space.total) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - 1/3 width on large screens */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your coworking space efficiently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild className="h-20 flex-col gap-1.5 p-2">
                  <Link href="/dashboard/admin/floorplan" className="flex flex-col items-center justify-center">
                    <MapPin className="h-5 w-5 mb-1" />
                    <span className="text-xs text-center leading-tight">View Floor Plan</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 p-2 bg-transparent">
                  <Link href="/dashboard/admin/hours" className="flex flex-col items-center justify-center">
                    <Clock className="h-5 w-5 mb-1" />
                    <span className="text-xs text-center leading-tight">Manage Hours</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 p-2 bg-transparent">
                  <Link href="/dashboard/admin/wifi" className="flex flex-col items-center justify-center">
                    <Wifi className="h-5 w-5 mb-1" />
                    <span className="text-xs text-center leading-tight">WiFi Settings</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 p-2 bg-transparent">
                  <Link href="/dashboard/admin/amenities" className="flex flex-col items-center justify-center">
                    <Coffee className="h-5 w-5 mb-1" />
                    <span className="text-xs text-center leading-tight">Amenities</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Tools</CardTitle>
              <CardDescription>Access more administrative tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 p-2 bg-transparent">
                  <Link href="/dashboard/admin/analytics" className="flex flex-col items-center justify-center">
                    <BarChart className="h-5 w-5 mb-1" />
                    <span className="text-xs text-center leading-tight">Analytics</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 p-2 bg-transparent">
                  <Link href="/dashboard/admin/settings" className="flex flex-col items-center justify-center">
                    <Settings className="h-5 w-5 mb-1" />
                    <span className="text-xs text-center leading-tight">Settings</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Logout Button */}
      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
          <LogOut className="h-4 w-4 mr-1" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
