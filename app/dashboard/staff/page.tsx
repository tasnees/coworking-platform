"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import DashboardLayout from "@/components/dashboard-layout"
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2 as Loader,
  CreditCard, 
  Eye, 
  Edit, 
  UserPlus,
  Trash2,
  Search,
  Filter,
  Plus,
  PhoneCall,
  ActivitySquare,
  Settings2
} from "lucide-react"
import ProtectedRoute from "../../../components/ProtectedRoute"
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
}
interface Member {
  id: string
  name: string
  email: string
  membershipType: "basic" | "standard" | "premium" | "enterprise"
  status: "active" | "inactive" | "suspended"
  joinDate: string
  lastVisit: string
  totalBookings: number
  totalSpent: number
  credits: number
}
interface Resource {
  id: string
  name: string
  type: "desk" | "meeting_room" | "phone_booth" | "event_space"
  capacity: number
  status: "available" | "occupied" | "maintenance" | "reserved"
  hourlyRate: number
  dailyRate: number
  amenities: string[]
  currentBooking?: string
  nextAvailable: string
}
function StaffDashboardContent() {
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showBookingDetails, setShowBookingDetails] = useState(false)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [showCreateBookingDialog, setShowCreateBookingDialog] = useState(false)
  const [showManageResourcesDialog, setShowManageResourcesDialog] = useState(false)
  const [showEditMemberDialog, setShowEditMemberDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  // Form states
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    membershipType: 'basic' as 'basic' | 'standard' | 'premium' | 'enterprise'
  })
  const [newBooking, setNewBooking] = useState({
    memberId: '',
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: ''
  })
  const [newResource, setNewResource] = useState({
    name: '',
    type: 'desk' as 'desk' | 'meeting_room' | 'phone_booth' | 'event_space',
    capacity: 1,
    hourlyRate: 0,
    dailyRate: 0,
    amenities: ''
  })
  const [editMember, setEditMember] = useState({
    name: '',
    email: '',
    membershipType: 'basic' as 'basic' | 'standard' | 'premium' | 'enterprise',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    credits: 0
  })

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])
  // Handlers
  const handleAddMember = () => {
    console.log('Adding new member:', newMember)
    // Here you would typically make an API call
    setShowAddMemberDialog(false)
    setNewMember({ firstName: '', lastName: '', email: '', phone: '', membershipType: 'basic' as const })
  }
  const handleCreateBooking = () => {
    console.log('Creating new booking:', newBooking)
    // Here you would typically make an API call
    setShowCreateBookingDialog(false)
    setNewBooking({ memberId: '', resourceId: '', date: '', startTime: '', endTime: '', notes: '' })
  }
  const handleAddResource = () => {
    console.log('Adding new resource:', newResource)
    // Here you would typically make an API call
    setShowManageResourcesDialog(false)
    setNewResource({ name: '', type: 'desk' as const, capacity: 1, hourlyRate: 0, dailyRate: 0, amenities: '' })
  }
  const handleEditMember = (member: Member) => {
    setSelectedMember(member)
    setEditMember({
      name: member.name,
      email: member.email,
      membershipType: member.membershipType,
      status: member.status,
      credits: member.credits
    })
    setShowEditMemberDialog(true)
  }
  const handleUpdateMember = () => {
    console.log('Updating member:', selectedMember?.id, editMember)
    // Here you would typically make an API call
    setShowEditMemberDialog(false)
    setSelectedMember(null)
  }
  // Mock data
  const recentBookings: Booking[] = [
    {
      id: "bk-001",
      memberName: "Alice Johnson",
      memberEmail: "alice@example.com",
      resourceType: "meeting_room",
      resourceName: "Conference Room A",
      date: "2024-01-15",
      startTime: "09:00",
      endTime: "10:00",
      status: "confirmed",
      duration: 1,
      price: 50
    },
    {
      id: "bk-002",
      memberName: "Bob Smith",
      memberEmail: "bob@example.com",
      resourceType: "desk",
      resourceName: "Desk 12",
      date: "2024-01-15",
      startTime: "09:30",
      endTime: "17:00",
      status: "completed",
      duration: 7.5,
      price: 75
    },
    {
      id: "bk-003",
      memberName: "Carol Davis",
      memberEmail: "carol@example.com",
      resourceType: "phone_booth",
      resourceName: "Phone Booth 1",
      date: "2024-01-15",
      startTime: "11:00",
      endTime: "11:30",
      status: "pending",
      duration: 0.5,
      price: 15
    }
  ]
  const members: Member[] = [
    {
      id: "mem-001",
      name: "Alice Johnson",
      email: "alice@example.com",
      membershipType: "premium",
      status: "active",
      joinDate: "2024-01-01",
      lastVisit: "2024-01-15",
      totalBookings: 12,
      totalSpent: 850,
      credits: 45
    },
    {
      id: "mem-002",
      name: "Bob Smith",
      email: "bob@example.com",
      membershipType: "standard",
      status: "active",
      joinDate: "2023-12-15",
      lastVisit: "2024-01-15",
      totalBookings: 8,
      totalSpent: 320,
      credits: 22
    },
    {
      id: "mem-003",
      name: "Carol Davis",
      email: "carol@example.com",
      membershipType: "basic",
      status: "inactive",
      joinDate: "2023-11-20",
      lastVisit: "2024-01-10",
      totalBookings: 3,
      totalSpent: 90,
      credits: 5
    }
  ]
  const resources: Resource[] = [
    {
      id: "res-001",
      name: "Conference Room A",
      type: "meeting_room",
      capacity: 8,
      status: "occupied",
      hourlyRate: 50,
      dailyRate: 400,
      amenities: ["Projector", "Whiteboard", "Coffee", "WiFi"],
      currentBooking: "Alice Johnson",
      nextAvailable: "10:00"
    },
    {
      id: "res-002",
      name: "Desk 12",
      type: "desk",
      capacity: 1,
      status: "available",
      hourlyRate: 10,
      dailyRate: 80,
      amenities: ["Monitor", "Keyboard", "Mouse", "WiFi"],
      nextAvailable: "Now"
    },
    {
      id: "res-003",
      name: "Phone Booth 1",
      type: "phone_booth",
      capacity: 1,
      status: "available",
      hourlyRate: 30,
      dailyRate: 240,
      amenities: ["Phone", "WiFi", "Privacy"],
      nextAvailable: "Now"
    }
  ]
  const formatCurrency = (amount: number) => {
    if (!isClient) return `$${amount.toFixed(2)}`; // Fallback for SSR
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `$${amount.toFixed(2)}`; // Fallback if Intl is not available
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'active':
      case 'available':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'completed':
        return 'text-blue-600 bg-blue-100'
      case 'cancelled':
      case 'inactive':
      case 'occupied':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'desk':
        return <Users className="h-4 w-4" />
      case 'meeting_room':
        return <Users className="h-4 w-4" />
      case 'phone_booth':
        return <PhoneCall className="h-4 w-4" />
      case 'event_space':
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }
  return (
    <DashboardLayout userRole="staff">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">Manage members, bookings, and resources</p>
        </div>
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ActivitySquare className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{booking.memberName}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.resourceName} • {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            booking.status === "confirmed" ? "default" :
                            booking.status === "completed" ? "secondary" :
                            booking.status === "pending" ? "outline" : "destructive"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full"
                    onClick={() => setShowAddMemberDialog(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Member
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowCreateBookingDialog(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Booking
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowManageResourcesDialog(true)}
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Manage Resources
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Manage and monitor member bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{booking.memberName}</h4>
                          <p className="text-sm text-muted-foreground">{booking.memberEmail}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{booking.resourceName}</span>
                            <span>•</span>
                            <span>{booking.date}</span>
                            <span>•</span>
                            <span>{booking.startTime} - {booking.endTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowBookingDetails(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Members</CardTitle>
                <CardDescription>Manage member accounts and memberships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{member.membershipType}</span>
                            <span>•</span>
                            <span>Joined {member.joinDate}</span>
                            <span>•</span>
                            <span>{member.totalBookings} bookings</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditMember(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>Manage workspace resources and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <div key={resource.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {getResourceIcon(resource.type)}
                            {resource.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Capacity: {resource.capacity} • {formatCurrency(resource.hourlyRate)}/hour
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {resource.amenities.map((amenity) => (
                              <Badge key={amenity} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(resource.status)}>
                            {resource.status}
                          </Badge>
                          {resource.currentBooking && (
                            <p className="text-sm text-muted-foreground">
                              Booked by {resource.currentBooking}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Dialogs */}
        <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected booking
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Member: {selectedBooking.memberName}</h4>
                  <p className="text-sm text-muted-foreground">{selectedBooking.memberEmail}</p>
                </div>
                <div>
                  <h4 className="font-medium">Resource: {selectedBooking.resourceName}</h4>
                  <p className="text-sm text-muted-foreground">{selectedBooking.resourceType}</p>
                </div>
                <div>
                  <h4 className="font-medium">Time: {selectedBooking.date} {selectedBooking.startTime} - {selectedBooking.endTime}</h4>
                  <p className="text-sm text-muted-foreground">Duration: {selectedBooking.duration} hours</p>
                </div>
                <div>
                  <h4 className="font-medium">Price: {formatCurrency(selectedBooking.price)}</h4>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Create a new member account with basic details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter first name"
                  value={newMember.firstName}
                  onChange={(e) => setNewMember(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter last name"
                  value={newMember.lastName}
                  onChange={(e) => setNewMember(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter email address"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter phone number"
                  value={newMember.phone}
                  onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Membership Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={newMember.membershipType}
                  onChange={(e) => setNewMember(prev => ({ ...prev, membershipType: e.target.value as 'basic' | 'standard' | 'premium' | 'enterprise' }))}
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAddMemberDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleAddMember}
                >
                  Add Member
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showCreateBookingDialog} onOpenChange={setShowCreateBookingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Booking</DialogTitle>
              <DialogDescription>
                Create a new booking for a member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Member</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={newBooking.memberId}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, memberId: e.target.value }))}
                >
                  <option value="">Select member</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={newBooking.resourceId}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, resourceId: e.target.value }))}
                >
                  <option value="">Select resource</option>
                  {resources.map(resource => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} ({resource.type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border rounded-md"
                    value={newBooking.startTime}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border rounded-md"
                  value={newBooking.endTime}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (optional)</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Add any special requirements or notes"
                  rows={3}
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCreateBookingDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleCreateBooking}
                >
                  Create Booking
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showManageResourcesDialog} onOpenChange={setShowManageResourcesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
              <DialogDescription>
                Add a new workspace resource to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Conference Room A"
                  value={newResource.name}
                  onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={newResource.type}
                  onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value as 'desk' | 'meeting_room' | 'phone_booth' | 'event_space' }))}
                >
                  <option value="desk">Desk</option>
                  <option value="meeting_room">Meeting Room</option>
                  <option value="phone_booth">Phone Booth</option>
                  <option value="event_space">Event Space</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border rounded-md"
                    value={newResource.capacity}
                    onChange={(e) => setNewResource(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hourly Rate ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-md"
                    value={newResource.hourlyRate}
                    onChange={(e) => setNewResource(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Daily Rate ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-md"
                  value={newResource.dailyRate}
                  onChange={(e) => setNewResource(prev => ({ ...prev, dailyRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amenities (comma-separated)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., WiFi, Whiteboard, Projector"
                  value={newResource.amenities}
                  onChange={(e) => setNewResource(prev => ({ ...prev, amenities: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowManageResourcesDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleAddResource}
                >
                  Add Resource
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showEditMemberDialog} onOpenChange={setShowEditMemberDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
              <DialogDescription>
                Update member information for {selectedMember?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={editMember.name}
                  onChange={(e) => setEditMember(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  value={editMember.email}
                  onChange={(e) => setEditMember(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Membership Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={editMember.membershipType}
                  onChange={(e) => setEditMember(prev => ({ ...prev, membershipType: e.target.value as 'basic' | 'standard' | 'premium' | 'enterprise' }))}
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={editMember.status}
                  onChange={(e) => setEditMember(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'suspended' }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Credits</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border rounded-md"
                  value={editMember.credits}
                  onChange={(e) => setEditMember(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowEditMemberDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleUpdateMember}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
export default function StaffDashboard() {
  return (
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <StaffDashboardContent />
    </ProtectedRoute>
  )
}
