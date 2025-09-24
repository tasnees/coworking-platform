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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogoutButton } from "@/components/auth/LogoutButton"

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">OmniSpace</h1>
            <Badge variant="secondary" className="ml-2 text-xs">
              ADMIN
            </Badge>
          </div>

          <div className="flex items-center gap-x-4 relative">
            <Button variant="ghost" size="sm" aria-label="Notifications">
              <BarChart className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder-user.jpg"
                      alt="Admin User"
                    />
                    <AvatarFallback>AU</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 absolute right-0 mt-2 z-50">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Admin User
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@omnispaces.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/admin/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="w-full">
                  <LogoutButton
                    className="w-full justify-start px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    redirectPath="/auth/login"
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your coworking space operations</p>
        </div>

        <div className="mt-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    {' '}from last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-2">
            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest booking activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{booking.member}</p>
                        <p className="text-sm text-muted-foreground">{booking.resource}</p>
                      </div>
                      <Badge
                        variant={
                          booking.status === 'active' ? 'default' :
                          booking.status === 'upcoming' ? 'secondary' : 'outline'
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Space Status */}
            <Card>
              <CardHeader>
                <CardTitle>Space Status</CardTitle>
                <CardDescription>Current utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spaceStatus.map((space, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{space.name}</span>
                        <span>{space.occupied}/{space.total}</span>
                      </div>
                      <Progress
                        value={(space.occupied / space.total) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button asChild className="h-20 flex-col">
                    <Link href="/dashboard/admin/members">
                      <Users className="h-6 w-6 mb-2" />
                      Manage Members
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex-col">
                    <Link href="/dashboard/admin/bookings">
                      <Calendar className="h-6 w-6 mb-2" />
                      View Bookings
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex-col">
                    <Link href="/dashboard/admin/analytics">
                      <BarChart className="h-6 w-6 mb-2" />
                      Analytics
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex-col">
                    <Link href="/dashboard/admin/settings">
                      <Settings className="h-6 w-6 mb-2" />
                      Settings
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
