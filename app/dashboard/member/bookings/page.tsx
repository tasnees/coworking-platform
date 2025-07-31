"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import DashboardLayout from "@/components/dashboard-layout"
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Plus, Filter, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
interface Booking {
  id: number
  resource: string
  type: "desk" | "meeting-room" | "phone-booth" | "event-space"
  date: string
  startTime: string
  endTime: string
  status: "confirmed" | "pending" | "cancelled" | "completed"
  attendees?: number
  notes?: string
  cost: number
}
export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  // Mock data for bookings
  const currentBookings: Booking[] = [
    {
      id: 1,
      resource: "Desk A-12",
      type: "desk",
      date: "2024-01-28",
      startTime: "09:00",
      endTime: "17:00",
      status: "confirmed",
      notes: "Near the window",
      cost: 25
    },
    {
      id: 2,
      resource: "Meeting Room B",
      type: "meeting-room",
      date: "2024-01-30",
      startTime: "14:00",
      endTime: "16:00",
      status: "pending",
      attendees: 6,
      notes: "Team planning session",
      cost: 80
    },
    {
      id: 3,
      resource: "Phone Booth 3",
      type: "phone-booth",
      date: "2024-01-29",
      startTime: "10:30",
      endTime: "11:30",
      status: "confirmed",
      notes: "Client call",
      cost: 15
    }
  ]
  const bookingHistory: Booking[] = [
    {
      id: 4,
      resource: "Desk C-05",
      type: "desk",
      date: "2024-01-20",
      startTime: "09:00",
      endTime: "17:00",
      status: "completed",
      cost: 25
    },
    {
      id: 5,
      resource: "Meeting Room A",
      type: "meeting-room",
      date: "2024-01-18",
      startTime: "13:00",
      endTime: "15:00",
      status: "completed",
      attendees: 4,
      cost: 60
    },
    {
      id: 6,
      resource: "Event Space",
      type: "event-space",
      date: "2024-01-15",
      startTime: "18:00",
      endTime: "22:00",
      status: "cancelled",
      attendees: 20,
      cost: 200
    }
  ]
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }
  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: "default",
      pending: "secondary",
      cancelled: "destructive",
      completed: "outline"
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any} className="capitalize">
        {status}
      </Badge>
    )
  }
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "desk":
        return <MapPin className="h-4 w-4" />
      case "meeting-room":
        return <Users className="h-4 w-4" />
      case "phone-booth":
        return <MapPin className="h-4 w-4" />
      case "event-space":
        return <Calendar className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }
  const filterBookings = (bookings: Booking[]) => {
    return bookings.filter(booking => {
      const matchesSearch = booking.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || booking.status === filterStatus
      const matchesType = filterType === "all" || booking.type === filterType
      return matchesSearch && matchesStatus && matchesType
    })
  }
  const handleCancelBooking = (bookingId: number) => {
    // In a real app, this would make an API call
    console.log(`Cancelling booking ${bookingId}`)
  }
  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking)
  }
  const BookingCard = ({ booking, showActions = true }: { booking: Booking, showActions?: boolean }) => (
    <Card key={booking.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(booking.type)}
            <CardTitle className="text-lg">{booking.resource}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(booking.status)}
            {getStatusBadge(booking.status)}
          </div>
        </div>
        <CardDescription className="capitalize">
          {booking.type.replace("-", " ")} • ${booking.cost}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date(booking.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {booking.startTime} - {booking.endTime}
          </div>
          {booking.attendees && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {booking.attendees} attendees
            </div>
          )}
          {booking.notes && (
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Notes:</strong> {booking.notes}
            </p>
          )}
        </div>
        {showActions && booking.status !== "completed" && booking.status !== "cancelled" && (
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditBooking(booking)}
              className="flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              Edit
            </Button>
            {(booking.status === "confirmed" || booking.status === "pending") && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleCancelBooking(booking.id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
  const stats = [
    {
      title: "Active Bookings",
      value: currentBookings.filter(b => b.status === "confirmed" || b.status === "pending").length.toString(),
      icon: Calendar
    },
    {
      title: "This Month",
      value: (currentBookings.length + bookingHistory.length).toString(),
      icon: Clock
    },
    {
      title: "Total Spent",
      value: `$${[...currentBookings, ...bookingHistory].reduce((sum, b) => sum + b.cost, 0)}`,
      icon: MapPin
    },
    {
      title: "Upcoming",
      value: currentBookings.filter(b => b.status === "confirmed").length.toString(),
      icon: CheckCircle
    }
  ]
  return (
    <DashboardLayout userRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
            <p className="text-muted-foreground">Manage your workspace reservations and booking history.</p>
          </div>
          <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
                <DialogDescription>
                  Reserve a workspace for your upcoming visit.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="resource-type" className="text-right">
                    Type
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select resource type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desk">Desk</SelectItem>
                      <SelectItem value="meeting-room">Meeting Room</SelectItem>
                      <SelectItem value="phone-booth">Phone Booth</SelectItem>
                      <SelectItem value="event-space">Event Space</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start-time" className="text-right">
                    Start
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end-time" className="text-right">
                    End
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements..."
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewBookingOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsNewBookingOpen(false)}>
                  Create Booking
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="desk">Desk</SelectItem>
                  <SelectItem value="meeting-room">Meeting Room</SelectItem>
                  <SelectItem value="phone-booth">Phone Booth</SelectItem>
                  <SelectItem value="event-space">Event Space</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        {/* Bookings Tabs */}
        <Tabs defaultValue="current" className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">Current Bookings</TabsTrigger>
            <TabsTrigger value="history">Booking History</TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="space-y-4">
            {filterBookings(currentBookings).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No current bookings</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You don't have any current bookings matching your filters.
                  </p>
                  <Button onClick={() => setIsNewBookingOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Booking
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterBookings(currentBookings).map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            {filterBookings(bookingHistory).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No booking history</h3>
                  <p className="text-muted-foreground text-center">
                    Your completed and cancelled bookings will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterBookings(bookingHistory).map(booking => (
                  <BookingCard key={booking.id} booking={booking} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      {/* Edit Booking Dialog */}
      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Modify your booking details.
            </DialogDescription>
          </DialogHeader>
          {editingBooking && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">
                  Date
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  defaultValue={editingBooking.date}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-start-time" className="text-right">
                  Start
                </Label>
                <Input
                  id="edit-start-time"
                  type="time"
                  defaultValue={editingBooking.startTime}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-end-time" className="text-right">
                  End
                </Label>
                <Input
                  id="edit-end-time"
                  type="time"
                  defaultValue={editingBooking.endTime}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="edit-notes"
                  defaultValue={editingBooking.notes}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingBooking(null)}>
              Cancel
            </Button>
            <Button onClick={() => setEditingBooking(null)}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
