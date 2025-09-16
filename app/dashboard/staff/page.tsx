"use client";

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import ProtectedRoute from "../../../components/ProtectedRoute"

interface Booking {
  id: string
  memberId: string
  memberName: string
  memberEmail: string
  resourceId: string
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
    case 'confirmed':
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'inactive':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'suspended':
    case 'cancelled':
    case 'maintenance':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'desk':
      return '🪑';
    case 'meeting_room':
      return '🚪';
    case 'phone_booth':
      return '📞';
    case 'event_space':
      return '🎪';
    default:
      return '📌';
  }
};

export default function StaffDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showCreateBookingDialog, setShowCreateBookingDialog] = useState(false);
  const [showManageResourcesDialog, setShowManageResourcesDialog] = useState(false);
  const [showEditMemberDialog, setShowEditMemberDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
 
  const [newMember, setNewMember] = useState<Partial<Member>>({});
  const [editMember, setEditMember] = useState<Partial<Member>>({});
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    id: '',
    memberId: '',
    memberName: '',
    memberEmail: '',
    resourceId: '',
    resourceType: 'desk',
    resourceName: '',
    date: '',
    startTime: '',
    endTime: '',
    status: 'pending',
    duration: 0,
    price: 0,
  });
  const [newResource, setNewResource] = useState<Partial<Resource>>({});
  
 
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

 
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
   
    setShowAddMemberDialog(false);
    setNewMember({});
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
   
    setShowEditMemberDialog(false);
    setEditMember({});
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
   
    setShowCreateBookingDialog(false);
    setNewBooking({});
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
   
    setShowManageResourcesDialog(false);
    setNewResource({});
  };

  useEffect(() => {
    setIsClient(true);
   
    setRecentBookings([
      {
        id: '1',
        memberId: '1',
        memberName: 'John Doe',
        memberEmail: 'john@example.com',
        resourceId: 'desk-1',
        resourceType: 'desk',
        resourceName: 'Desk A-12',
        date: '2023-06-15',
        startTime: '09:00',
        endTime: '17:00',
        status: 'confirmed',
        duration: 8,
        price: 50,
        notes: 'Regular booking'
      }
    ]);
    
    setMembers([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        membershipType: 'premium',
        status: 'active',
        joinDate: '2023-01-15',
        lastVisit: '2023-06-10',
        totalBookings: 12,
        totalSpent: 1200,
        credits: 5
      }
    ]);
    
    setResources([
      {
        id: '1',
        name: 'Desk A-12',
        type: 'desk',
        capacity: 1,
        status: 'available',
        hourlyRate: 10,
        dailyRate: 50,
        amenities: ['Power outlet', 'Monitor', 'Ergonomic chair'],
        nextAvailable: '2023-06-16T09:00:00Z'
      }
    ]);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

 
  const dialogs = (
    <>
      {}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>Add a new member to the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newMember.name || ''}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email || ''}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="membershipType">Membership Type</Label>
                <Select
                  value={newMember.membershipType || ''}
                  onValueChange={(value) => setNewMember({...newMember, membershipType: value as any})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select membership type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddMemberDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Detailed information about the selected booking</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Member: {selectedBooking.memberName}</h4>
                <p className="text-sm text-muted-foreground">{selectedBooking.memberEmail}</p>
              </div>
              <div>
                <p className="font-medium">Resource: {selectedBooking.resourceName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.date} • {selectedBooking.startTime} - {selectedBooking.endTime}
                </p>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <Badge className={getStatusColor(selectedBooking.status)}>
                  {selectedBooking.status}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Price</p>
                <p>{formatCurrency(selectedBooking.price || 0)}</p>
              </div>
              {selectedBooking.notes && (
                <div>
                  <p className="font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowBookingDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={showCreateBookingDialog} onOpenChange={setShowCreateBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>Create a new booking for a member</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="member">Member</Label>
                <Select
                  value={newBooking.memberId as string || ''}
                  onValueChange={(value) => setNewBooking({...newBooking, memberId: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="resource">Resource</Label>
                <Select
                  value={newBooking.resourceId as string || ''}
                  onValueChange={(value) => setNewBooking({...newBooking, resourceId: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name} ({resource.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newBooking.date as string || ''}
                    onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newBooking.startTime as string || ''}
                    onChange={(e) => setNewBooking({...newBooking, startTime: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newBooking.endTime as string || ''}
                    onChange={(e) => setNewBooking({...newBooking, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newBooking.notes as string || ''}
                  onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateBookingDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Booking</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={showManageResourcesDialog} onOpenChange={setShowManageResourcesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
            <DialogDescription>Add a new workspace resource to the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddResource} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="resourceName">Resource Name</Label>
                <Input
                  id="resourceName"
                  value={newResource.name || ''}
                  onChange={(e) => setNewResource({...newResource, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="resourceType">Type</Label>
                <Select
                  value={newResource.type || ''}
                  onValueChange={(value) => setNewResource({...newResource, type: value as any})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desk">Desk</SelectItem>
                    <SelectItem value="meeting_room">Meeting Room</SelectItem>
                    <SelectItem value="phone_booth">Phone Booth</SelectItem>
                    <SelectItem value="event_space">Event Space</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newResource.hourlyRate || ''}
                    onChange={(e) => setNewResource({...newResource, hourlyRate: Number(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dailyRate">Daily Rate ($)</Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newResource.dailyRate || ''}
                    onChange={(e) => setNewResource({...newResource, dailyRate: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={newResource.capacity || ''}
                  onChange={(e) => setNewResource({...newResource, capacity: Number(e.target.value)})}
                  required
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={newResource.status || 'available'}
                  onValueChange={(value) => setNewResource({...newResource, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowManageResourcesDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Resource</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={showEditMemberDialog} onOpenChange={setShowEditMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>Update member information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditMember} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={editMember.name || ''}
                  onChange={(e) => setEditMember({...editMember, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editMember.email || ''}
                  onChange={(e) => setEditMember({...editMember, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editMember.status || ''}
                  onValueChange={(value) => setEditMember({...editMember, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditMemberDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );

  return (
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">Manage members, bookings, and resources</p>
        </div>
        
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
                  {recentBookings.length > 0 ? (
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
                  ) : (
                    <p className="text-muted-foreground text-sm">No recent activity</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
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
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{booking.memberName}</h4>
                            <p className="text-sm text-muted-foreground">{booking.memberEmail}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground flex-wrap">
                              <span>{booking.resourceName}</span>
                              <span>•</span>
                              <span>{booking.date}</span>
                              <span>•</span>
                              <span>{booking.startTime} - {booking.endTime}</span>
                            </div>
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No bookings found</p>
                )}
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
                {members.length > 0 ? (
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div key={member.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <Badge variant="outline">{member.membershipType}</Badge>
                              <Badge 
                                variant={
                                  member.status === "active" ? "default" :
                                  member.status === "inactive" ? "secondary" : "destructive"
                                }
                              >
                                {member.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No members found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>Manage available workspaces and resources</CardDescription>
              </CardHeader>
              <CardContent>
                {resources.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                      <div key={resource.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{resource.name}</h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {resource.type.replace('_', ' ')}
                            </p>
                            <div className="mt-2 space-y-1 text-sm">
                              <p>Capacity: {resource.capacity} person{resource.capacity !== 1 ? 's' : ''}</p>
                              <p>Status: 
                                <Badge 
                                  variant={
                                    resource.status === "available" ? "default" :
                                    resource.status === "occupied" ? "secondary" :
                                    resource.status === "reserved" ? "outline" : "destructive"
                                  }
                                  className="ml-2"
                                >
                                  {resource.status}
                                </Badge>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No resources found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {dialogs}
    </ProtectedRoute>
  );
}
