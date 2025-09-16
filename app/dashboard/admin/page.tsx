"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Wifi, 
  Coffee, 
  BarChart, 
  Settings, 
  LogOut, 
  Loader2 
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import * as React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { UserRole } from "@/lib/auth-types"

interface Stat {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
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
  capacity?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  Wifi,
  Coffee,
  BarChart,
  Settings,
  LogOut
} as const;

export default function AdminDashboard() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [stats, setStats] = useState<Stat[]>([])
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [spaceStatus, setSpaceStatus] = useState<SpaceStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
 
  const mockSpaceStatus: SpaceStatus[] = [
    { name: 'Desks', total: 20, occupied: 12, available: 8 },
    { name: 'Meeting Rooms', total: 5, occupied: 2, available: 3 },
    { name: 'Private Offices', total: 8, occupied: 5, available: 3 },
  ]

 
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
     
      if (process.env.NODE_ENV === 'development') {
        setStats([
          {
            title: 'Total Members',
            value: '124',
            change: '+12%',
            changeType: 'positive',
            icon: 'Users'
          },
          {
            title: 'Active Bookings',
            value: '24',
            change: '+5%',
            changeType: 'positive',
            icon: 'Calendar'
          },
          {
            title: 'Total Revenue',
            value: '$12,540',
            change: '+8.2%',
            changeType: 'positive',
            icon: 'DollarSign',
            className: 'bg-green-100 dark:bg-green-900'
          },
          {
            title: 'Available Spaces',
            value: '14',
            change: '-3%',
            changeType: 'negative',
            icon: 'MapPin',
            className: 'bg-purple-100 dark:bg-purple-900'
          }
        ])
        
        setRecentBookings([
          {
            id: 1,
            member: 'Alex Johnson',
            resource: 'Meeting Room A',
            time: '10:00 AM - 11:30 AM',
            status: 'active'
          },
          {
            id: 2,
            member: 'Sam Wilson',
            resource: 'Desk #24',
            time: '9:00 AM - 5:00 PM',
            status: 'active'
          },
          {
            id: 3,
            member: 'Taylor Swift',
            resource: 'Private Office #3',
            time: '2:00 PM - 4:00 PM',
            status: 'upcoming'
          }
        ])
        
        setSpaceStatus(mockSpaceStatus)
        return
      }
      
     
      const response = await fetch('/api/admin/stats', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const data = await response.json()
      setStats(data.stats || [])
      setRecentBookings(data.recentBookings || [])
      setSpaceStatus(data.spaceStatus || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    setIsClient(true)
    fetchDashboardData()
    
   
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  if (!isClient) {
    return null
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg max-w-md text-center">
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm mt-2">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={fetchDashboardData}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
     
      const { SignOutButton } = await import('@clerk/nextjs')
      return <SignOutButton redirectUrl="/" />
    } catch (error) {
      console.error('Error during sign out:', error)
      return null
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening at your workspace today.</p>
      </div>
      
      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.className || 'bg-blue-100 dark:bg-blue-900'}`}>
                  {iconMap[stat.icon] ? 
                    React.createElement(iconMap[stat.icon], { className: "h-6 w-6 text-blue-600 dark:text-blue-300" }) : 
                    null
                  }
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                      {stat.change}
                    </span>{" "}
                    from last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {}
      <div className="grid gap-6 lg:grid-cols-3">
        {}
        <div className="space-y-6 lg:col-span-2">
          {}
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
          
          {}
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
        
        {}
        <div className="space-y-6">
          {}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your workspace</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/admin/bookings')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                New Booking
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/admin/members')}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Members
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/admin/floorplan')}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Manage Spaces
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/admin/memberships')}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Memberships & Billing
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/admin/wifi')}
              >
                <Wifi className="mr-2 h-4 w-4" />
                WiFi Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/admin/amenities')}
              >
                <Coffee className="mr-2 h-4 w-4" />
                Amenities
              </Button>
            </CardContent>
          </Card>
          
          {}
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
      
      {}
      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
          <LogOut className="h-4 w-4 mr-1" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
