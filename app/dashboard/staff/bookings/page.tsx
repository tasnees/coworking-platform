"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Users, CreditCard, Filter, Search, Plus, Eye, Edit, Trash2, CheckCircle, Clock3, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
interface Booking {
  id: string
  memberName: string
  memberEmail: string
  resourceType: "desk" | "meeting_room" | "phone_booth" | "event_space"
  resourceName: string
  date: string
  startTime: string
  endTime: string
  status: "confirmed" | "pending" | "cancelled" | "completed"
  duration: number
  price: number
  notes?: string
  createdAt: string
}
interface Member {
  id: string
  name: string
  email: string
}
interface Resource {
  id: string
  name: string
  type: "desk" | "meeting_room" | "phone_booth" | "event_space"
  hourlyRate: number
}
// Mock data
const mockBookings: Booking[] = [
  {
    id: "1",
    memberName: "Alice Johnson",
    memberEmail: "alice@example.com",
    resourceType: "meeting_room",
    resourceName: "Conference Room A",
    date: "2024-07-28",
    startTime: "09:00",
    endTime: "11:00",
    status: "confirmed",
    duration: 2,
    price: 60,
    notes: "Team meeting with clients",
    createdAt: "2024-07-27T10:00:00Z"
  },
  {
    id: "2",
    memberName: "Bob Smith",
    memberEmail: "bob@example.com",
    resourceType: "desk",
    resourceName: "Hot Desk 5",
    date: "2024-07-28",
    startTime: "10:00",
    endTime: "18:00",
    status: "pending",
    duration: 8,
    price: 80,
    createdAt: "2024-07-27T14:30:00Z"
  },
  {
    id: "3",
    memberName: "Carol Davis",
    memberEmail: "carol@example.com",
    resourceType: "phone_booth",
    resourceName: "Phone Booth 1",
    date: "2024-07-29",
    startTime: "14:00",
    endTime: "15:00",
    status: "confirmed",
    duration: 1,
    price: 15,
    notes: "Client call",
    createdAt: "2024-07-27T09:15:00Z"
  },
  {
    id: "4",
    memberName: "David Wilson",
    memberEmail: "david@example.com",
    resourceType: "event_space",
    resourceName: "Main Event Hall",
    date: "2024-07-30",
    startTime: "09:00",
    endTime: "17:00",
    status: "confirmed",
    duration: 8,
    price: 400,
    notes: "Workshop event",
    createdAt: "2024-07-26T16:45:00Z"
  },
  {
    id: "5",
    memberName: "Eva Martinez",
    memberEmail: "eva@example.com",
    resourceType: "desk",
    resourceName: "Dedicated Desk 3",
    date: "2024-07-28",
    startTime: "08:00",
    endTime: "17:00",
    status: "completed",
    duration: 9,
    price: 90,
    createdAt: "2024-07-27T08:00:00Z"
  }
]
const mockMembers: Member[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "2", name: "Bob Smith", email: "bob@example.com" },
  { id: "3", name: "Carol Davis", email: "carol@example.com" },
  { id: "4", name: "David Wilson", email: "david@example.com" },
  { id: "5", name: "Eva Martinez", email: "eva@example.com" }
]
const mockResources: Resource[] = [
  { id: "1", name: "Conference Room A", type: "meeting_room", hourlyRate: 30 },
  { id: "2", name: "Hot Desk 5", type: "desk", hourlyRate: 10 },
  { id: "3", name: "Phone Booth 1", type: "phone_booth", hourlyRate: 15 },
  { id: "4", name: "Main Event Hall", type: "event_space", hourlyRate: 50 },
  { id: "5", name: "Dedicated Desk 3", type: "desk", hourlyRate: 10 }
]
// Helper function to safely format date
export default function StaffBookingsPage() {
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  
  // Set client-side flag and handle auth redirect
  useEffect(() => {
    setIsClient(true)
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])
  
  // Show loading state on server or during auth check
  if (!isClient || isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  const [bookings, setBookings] = useState<Booking[]>(() => [])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>(() => [])
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all")
  // Filter bookings based on search and filters
  const filterBookings = () => {
    if (!bookings?.length) return []
    let filtered = [...bookings]
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.memberEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.resourceName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }
    if (resourceTypeFilter !== "all") {
      filtered = filtered.filter(booking => booking.resourceType === resourceTypeFilter)
    }
    setFilteredBookings(filtered)
  }
  useEffect(() => {
    if (!Array.isArray(bookings)) {
      setFilteredBookings([]);
      return;
    }
    
    const filtered = bookings.filter(booking => {
      if (!booking) return false;
      
      const searchLower = searchTerm?.toLowerCase?.() || '';
      const matchesSearch = 
        (booking.memberName?.toLowerCase?.() || '').includes(searchLower) ||
        (booking.memberEmail?.toLowerCase?.() || '').includes(searchLower) ||
        (booking.resourceName?.toLowerCase?.() || '').includes(searchLower);
        
      const matchesStatus = 
        selectedStatus === 'all' || 
        booking.status === selectedStatus;
        
      return matchesSearch && matchesStatus;
    });
    
    setFilteredBookings(filtered || []);
  }, [bookings, searchTerm, selectedStatus])
  // Apply filters when any filter changes
  useEffect(() => {
    if (isClient) {
      filterBookings()
    }
  }, [searchTerm, statusFilter, resourceTypeFilter, bookings, isClient])
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'desk':
        return '🖥️'
      case 'meeting_room':
        return '🏢'
      case 'phone_booth':
        return '📞'
      case 'event_space':
        return '🎪'
      default:
        return '📍'
    }
  }
  const handleDeleteBooking = (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      setBookings(bookings.filter(b => b.id !== id))
      setFilteredBookings(filteredBookings.filter(b => b.id !== id))
    }
  }
  const handleCreateBooking = (bookingData: Partial<Booking>) => {
    const newBooking: Booking = {
      id: Date.now().toString(),
      memberName: bookingData.memberName || '',
      memberEmail: bookingData.memberEmail || '',
      resourceType: bookingData.resourceType || 'desk',
      resourceName: bookingData.resourceName || '',
      date: bookingData.date || '',
      startTime: bookingData.startTime || '',
      endTime: bookingData.endTime || '',
      status: bookingData.status || 'pending',
      duration: bookingData.duration || 1,
      price: bookingData.price || 0,
      notes: bookingData.notes,
      createdAt: new Date().toISOString()
    }
    setBookings([newBooking, ...bookings])
    setFilteredBookings([newBooking, ...filteredBookings])
    setShowCreateDialog(false)
  }
  const handleUpdateBooking = (updatedBooking: Booking) => {
    setBookings(bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b))
    setFilteredBookings(filteredBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b))
    setEditingBooking(null)
  }
  // Stats
  const totalBookings = bookings.length
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length
  const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0)
  // Show loading state during SSR/hydration
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  return (
    <DashboardLayout userRole="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Bookings Management</h1>
          <p className="text-muted-foreground">
            View, create, edit, and manage all member bookings
          </p>
        </div>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>
        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Manage bookings across all members and resources</CardDescription>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Booking
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by member, email, or resource..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="desk">Desk</SelectItem>
                  <SelectItem value="meeting_room">Meeting Room</SelectItem>
                  <SelectItem value="phone_booth">Phone Booth</SelectItem>
                  <SelectItem value="event_space">Event Space</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Bookings List */}
            <div className="space-y-4">
              {!filteredBookings?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bookings found matching your criteria
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getResourceIcon(booking.resourceType)}</span>
                          <div>
                            <h4 className="font-semibold">{booking.resourceName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.memberName} • {booking.memberEmail}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <p className="font-medium">{booking.date}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time:</span>
                            <p className="font-medium">{booking.startTime} - {booking.endTime}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <p className="font-medium">{booking.duration}h</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price:</span>
                            <p className="font-medium">{formatCurrency(booking.price)}</p>
                          </div>
                        </div>
                        {booking.notes && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Notes:</span>
                            <p className="text-gray-700">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingBooking(booking)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteBooking(booking.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        {/* View Booking Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Complete booking information
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Member</Label>
                    <p className="font-medium">{selectedBooking.memberName}</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking.memberEmail}</p>
                  </div>
                  <div>
                    <Label>Resource</Label>
                    <p className="font-medium">{selectedBooking.resourceName}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedBooking.resourceType.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <p className="font-medium">{selectedBooking.date}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Time</Label>
                    <p className="font-medium">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <p className="font-medium">{selectedBooking.duration} hours</p>
                  </div>
                </div>
                <div>
                  <Label>Price</Label>
                  <p className="font-medium">{formatCurrency(selectedBooking.price)}</p>
                </div>
                {selectedBooking.notes && (
                  <div>
                    <Label>Notes</Label>
                    <p className="text-sm">{selectedBooking.notes}</p>
                  </div>
                )}
                <div>
                  <Label>Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedBooking.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Edit Booking Dialog */}
        <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
              <DialogDescription>
                Modify booking details for {editingBooking?.memberName}
              </DialogDescription>
            </DialogHeader>
            {editingBooking && (
              <div className="space-y-4">
                <div>
                  <Label>Member</Label>
                  <Input value={editingBooking.memberName} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Resource</Label>
                  <Select defaultValue={editingBooking.resourceName}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockResources.map(resource => (
                        <SelectItem key={resource.id} value={resource.name}>
                          {resource.name} ({formatCurrency(resource.hourlyRate)}/hr)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" defaultValue={editingBooking.date} />
                  </div>
                  <div>
                    <Label>Start Time</Label>
                    <Input type="time" defaultValue={editingBooking.startTime} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (hours)</Label>
                    <Input 
                      type="number" 
                      min="0.5" 
                      step="0.5" 
                      defaultValue={editingBooking.duration} 
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select defaultValue={editingBooking.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea defaultValue={editingBooking.notes || ''} />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setEditingBooking(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    alert('Booking updated successfully!')
                    setEditingBooking(null)
                  }}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Create Booking Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
              <DialogDescription>
                Create a new booking for a member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Member</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMembers.map(member => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Resource</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockResources.map(resource => (
                      <SelectItem key={resource.id} value={resource.name}>
                        {resource.name} ({formatCurrency(resource.hourlyRate)}/hr)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (hours)</Label>
                  <Input type="number" min="0.5" step="0.5" placeholder="1.5" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select defaultValue="pending">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Optional notes..." />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  alert('Booking created successfully!')
                  setShowCreateDialog(false)
                }}>
                  Create Booking
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
