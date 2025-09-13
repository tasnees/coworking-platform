"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import DashboardLayout from "@/components/dashboard-layout"
import { Calendar, MapPin, Clock, Wifi, Coffee, BarChart, Settings, Users, CheckCircle, LogOut } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
export default function MemberDashboard() {
  const router = useRouter()
  const stats = [
    {
      title: "Upcoming Bookings",
      value: "2",
      change: "+1",
      changeType: "positive" as const,
      icon: Calendar,
    },
    {
      title: "Membership Status",
      value: "Active",
      change: "",
      changeType: "positive" as const,
      icon: CheckCircle,
    },
    {
      title: "Credits Left",
      value: "8",
      change: "-2",
      changeType: "negative" as const,
      icon: Users,
    },
    {
      title: "Last Visit",
      value: "Yesterday",
      change: "",
      changeType: "neutral" as const,
      icon: Clock,
    },
  ]
  const upcomingBookings = [
    { id: 1, resource: "Desk A-12", time: "Tomorrow, 9:00 AM - 5:00 PM", status: "confirmed" },
    { id: 2, resource: "Meeting Room B", time: "Friday, 2:00 PM - 4:00 PM", status: "pending" },
  ]
  const amenities = [
    { name: "WiFi", status: "Available" },
    { name: "Coffee", status: "Available" },
    { name: "Printer", status: "Out of Paper" },
    { name: "Snacks", status: "Available" },
  ]
  // Example activity data for the dialog
  const [activityOpen, setActivityOpen] = useState(false)
  const activityStats = [
    { label: "Bookings this month", value: 5 },
    { label: "Hours spent", value: 32 },
    { label: "Most used amenity", value: "Coffee Machine" },
    { label: "Last visit", value: "Yesterday" },
  ]
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Only run on client
    setIsClient(true)
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user")
    }
    router.push("/auth/login")
  }

  // Show loading state during SSR or initial client load
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome! Here’s your coworking activity and quick access to your tools.</p>
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
                {stat.change && (
                  <p className="text-xs text-muted-foreground">
                    <span className={
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : ""
                    }>
                      {stat.change}
                    </span>{" "}
                    {stat.changeType === "positive"
                      ? "since last week"
                      : stat.changeType === "negative"
                      ? "used this week"
                      : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
              <CardDescription>Your next reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.length === 0 && (
                  <div className="text-muted-foreground text-sm">No upcoming bookings.</div>
                )}
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{booking.resource}</p>
                      <p className="text-xs text-muted-foreground">{booking.time}</p>
                    </div>
                    <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Amenities Status */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>Current status of amenities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {amenities.map((amenity) => (
                  <div key={amenity.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{amenity.name}</span>
                    <Badge
                      variant={
                        amenity.status === "Available"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {amenity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your bookings and account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-20 flex-col gap-2">
                <Link href="/dashboard/member/bookings">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">Book a Space</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/dashboard/member/floorplan">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm">View Floor Plan</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/dashboard/member/wifi">
                  <Wifi className="h-5 w-5" />
                  <span className="text-sm">WiFi Access</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/dashboard/member/amenities">
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
            <CardTitle>More Tools</CardTitle>
            <CardDescription>Access your account and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* My Activity Dialog Button */}
              <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <BarChart className="h-5 w-5" />
                    <span className="text-sm">My Activity</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>My Activity</DialogTitle>
                    <DialogDescription>
                      Here’s a summary of your recent activity in the coworking space.
                    </DialogDescription>
                  </DialogHeader>
                  <ul className="space-y-2 mt-4">
                    {activityStats.map((stat, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span className="font-medium">{stat.label}</span>
                        <span>{stat.value}</span>
                      </li>
                    ))}
                  </ul>
                </DialogContent>
              </Dialog>
              {/* Sign Out Button */}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
