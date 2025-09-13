"use client"
import React, { useState, useEffect, ReactElement } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Clock, MapPin, Users, AlertCircle, Loader, CheckCircle, XCircle, Edit, Trash2, Plus, Search, Filter } from "lucide-react"
import Link from "next/link"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    }
  }
}
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
export default function BookingsPage(): JSX.Element {
  const [isClient, setIsClient] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  
  // Helper function to safely update editingBooking
  const updateEditingBooking = (updates: Partial<Booking>) => {
    if (!editingBooking) return;
    setEditingBooking({...editingBooking, ...updates});
  }
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([])
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([])
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    resource: "",
    type: "desk",
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "17:00",
    status: "pending",
    cost: 0,
    notes: ""
  })
  const { toast } = useToast()
  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])
  // Load bookings on component mount
  useEffect(() => {
    // In a real app, you would fetch this from your API
    const loadBookings = async () => {
      try {
        // Mock data - replace with actual API call
        const mockCurrentBookings: Booking[] = [
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
            date: new Date().toISOString().split('T')[0],
            startTime: "10:30",
            endTime: "11:30",
            status: "confirmed",
            notes: "Client call",
            cost: 15
          }
        ]
        
        const mockBookingHistory: Booking[] = [
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
        
        setCurrentBookings(mockCurrentBookings)
        setBookingHistory(mockBookingHistory)
      } catch (error) {
        console.error('Error loading bookings:', error)
        toast({
          title: "Error",
          description: "Failed to load bookings. Please try again.",
          variant: "destructive"
        })
      }
    }
    
    loadBookings()
  }, [])
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
  const handleDeleteBooking = async (id: number): Promise<void> => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return
    }
    
    setIsDeleting(id)
    
    try {
      // In a real app, you would make an API call here
      // await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update local state
      setCurrentBookings(prev => prev.filter(b => b.id !== id))
      setBookingHistory(prev => prev.filter(b => b.id !== id))
      
      toast({
        title: "Success",
        description: "Booking has been cancelled successfully."
      })
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(null)
    }
  }
  
  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking)
  }

  // Handle save edit with proper type safety
  const handleSaveEdit = async (booking: Booking): Promise<void> => {
    if (!editingBooking) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // In a real app, you would make an API call here
      // const response = await fetch(`/api/bookings/${booking.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(booking)
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setCurrentBookings(prev => 
        prev.map(b => b.id === booking.id ? booking : b)
      );
      
      setBookingHistory(prev => 
        prev.map(b => b.id === booking.id ? booking : b)
      );
      
      setEditingBooking(null);
      
      toast({
        title: "Success",
        description: "Booking has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCreateBooking = async (): Promise<void> => {
    if (!newBooking.resource || !newBooking.date || !newBooking.startTime || !newBooking.endTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }
    
    setIsSaving(true)
    
    try {
      // In a real app, you would make an API call here
      // const response = await fetch('/api/bookings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newBooking)
      // })
      // const data = await response.json()
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Create new booking with mock ID
      const createdBooking: Booking = {
        id: Math.max(0, ...currentBookings.map(b => b.id), ...bookingHistory.map(b => b.id)) + 1,
        resource: newBooking.resource || "",
        type: newBooking.type || "desk",
        date: newBooking.date || "",
        startTime: newBooking.startTime || "",
        endTime: newBooking.endTime || "",
        status: "pending",
        attendees: newBooking.attendees,
        notes: newBooking.notes,
        cost: newBooking.cost || 0
      }
      
      // Update local state
      setCurrentBookings(prev => [createdBooking, ...prev])
      
      // Reset form
      setNewBooking({
        resource: "",
        type: "desk",
        date: new Date().toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "17:00",
        status: "pending",
        cost: 0,
        notes: ""
      })
      
      setIsNewBookingOpen(false)
      
      toast({
        title: "Success",
        description: "Booking has been created successfully and is pending confirmation."
      })
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }
  const formatBookingDate = (dateString: string) => {
    if (!isClient || !dateString) return ''; // Return empty string during SSR or if dateString is falsy
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Fallback to original string if date parsing fails
    }
  };
  const BookingCard = ({ booking, showActions = true }: { booking: Booking, showActions?: boolean }): JSX.Element => (
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
            {formatBookingDate(booking.date)}
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
                onClick={() => handleDeleteBooking(booking.id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                disabled={isDeleting === booking.id}
              >
                {isDeleting === booking.id ? (
                  <Loader className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                {isDeleting === booking.id ? 'Deleting...' : 'Delete'}
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
    <div className="space-y-6">
      {/* Header */}
      <div>
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
              <DialogTitle>{editingBooking ? 'Edit Booking' : 'Create New Booking'}</DialogTitle>
              <DialogDescription>
                {editingBooking ? 'Update your booking details.' : 'Reserve a workspace for your upcoming visit.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resource" className="text-right">
                  Resource
                </Label>
                <Input
                  id="resource"
                  value={editingBooking?.resource || newBooking.resource || ''}
                  onChange={(e) => 
                    editingBooking 
                      ? setEditingBooking({...editingBooking, resource: e.target.value})
                      : setNewBooking({...newBooking, resource: e.target.value})
                  }
                  className="col-span-3"
                  placeholder="e.g., Desk A-12, Meeting Room B"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={editingBooking?.type || newBooking.type}
                    onValueChange={(value) => 
                      editingBooking
                        ? setEditingBooking({...editingBooking, type: value as any})
                        : setNewBooking({...newBooking, type: value as any})
                    }
                  >
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
                    value={editingBooking?.date || newBooking.date || ''}
                    onChange={(e) => 
                      editingBooking
                        ? setEditingBooking({...editingBooking, date: e.target.value})
                        : setNewBooking({...newBooking, date: e.target.value})
                    }
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
                    value={editingBooking?.startTime || newBooking.startTime || ''}
                    onChange={(e) => 
                      editingBooking
                        ? setEditingBooking({...editingBooking, startTime: e.target.value})
                        : setNewBooking({...newBooking, startTime: e.target.value})
                    }
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
                    value={editingBooking?.endTime || newBooking.endTime || ''}
                    onChange={(e) => 
                      editingBooking
                        ? setEditingBooking({...editingBooking, endTime: e.target.value})
                        : setNewBooking({...newBooking, endTime: e.target.value})
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="attendees" className="text-right">
                    Attendees
                  </Label>
                  <Input
                    id="attendees"
                    type="number"
                    min="1"
                    value={editingBooking?.attendees || newBooking.attendees || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      editingBooking
                        ? setEditingBooking({...editingBooking, attendees: value})
                        : setNewBooking({...newBooking, attendees: value})
                    }}
                    className="col-span-3"
                    placeholder="Number of attendees (for meeting rooms)"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="notes" className="text-right mt-2">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements..."
                    value={editingBooking?.notes || newBooking.notes || ''}
                    onChange={(e) => 
                      editingBooking
                        ? setEditingBooking({...editingBooking, notes: e.target.value})
                        : setNewBooking({...newBooking, notes: e.target.value})
                    }
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (editingBooking) {
                      setEditingBooking(null);
                    } else {
                      setIsNewBookingOpen(false);
                    }
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (editingBooking) {
                      handleSaveEdit(editingBooking);
                    } else {
                      handleCreateBooking();
                    }
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      {editingBooking ? 'Saving...' : 'Creating...'}
                    </>
                  ) : editingBooking ? 'Save Changes' : 'Create Booking'}
                </Button>
              </DialogFooter>
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
      <Dialog 
        open={Boolean(editingBooking)}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setEditingBooking(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Modify your booking details.
            </DialogDescription>
          </DialogHeader>
          {editingBooking ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">
                  Date
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  defaultValue={editingBooking?.date || ''}
                  className="col-span-3"
                  onChange={(e) => updateEditingBooking({ date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-start-time" className="text-right">
                  Start
                </Label>
                <Input
                  id="edit-start-time"
                  type="time"
                  defaultValue={editingBooking?.startTime || ''}
                  className="col-span-3"
                  onChange={(e) => updateEditingBooking({ startTime: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-end-time" className="text-right">
                  End
                </Label>
                <Input
                  id="edit-end-time"
                  type="time"
                  defaultValue={editingBooking?.endTime || ''}
                  className="col-span-3"
                  onChange={(e) => updateEditingBooking({ endTime: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="edit-notes"
                  defaultValue={editingBooking?.notes || ''}
                  className="col-span-3"
                  onChange={(e) => updateEditingBooking({ notes: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingBooking(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (editingBooking) {
                      handleSaveEdit(editingBooking).catch(console.error);
                    }
                  }}
                  disabled={!editingBooking || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

