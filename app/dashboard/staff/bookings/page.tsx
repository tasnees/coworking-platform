"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Users, CreditCard, Search, Plus, Eye, Edit, Trash2, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DashboardLayout = dynamic(
  () => import('@/components/dashboard-layout'),
  { ssr: false }
);

interface Booking {
  id: string;
  memberName: string;
  memberEmail: string;
  resourceType: "desk" | "meeting_room" | "phone_booth" | "event_space";
  resourceName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  duration: number;
  price: number;
  notes?: string;
  createdAt: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
}

interface Resource {
  id: string;
  name: string;
  type: "desk" | "meeting_room" | "phone_booth" | "event_space";
  hourlyRate: number;
}

const mockBookings: Booking[] = [
  {
    id: "1",
    memberName: "John Doe",
    memberEmail: "john@example.com",
    resourceType: "desk",
    resourceName: "Hot Desk A1",
    date: "2023-06-15",
    startTime: "09:00",
    endTime: "17:00",
    status: "confirmed",
    duration: 8,
    price: 80,
    notes: "Regular workday",
    createdAt: "2023-06-10T10:30:00Z"
  },
 
];

const mockMembers: Member[] = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Jane Smith", email: "jane@example.com" },
];

const mockResources: Resource[] = [
  { id: "1", name: "Hot Desk A1", type: "desk", hourlyRate: 10 },
  { id: "2", name: "Meeting Room 1", type: "meeting_room", hourlyRate: 30 },
  { id: "3", name: "Phone Booth 1", type: "phone_booth", hourlyRate: 15 },
  { id: "4", name: "Event Space", type: "event_space", hourlyRate: 100 },
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getResourceIcon = (type: string): string => {
  switch (type) {
    case 'desk':
      return '💻';
    case 'meeting_room':
      return '👥';
    case 'phone_booth':
      return '📞';
    case 'event_space':
      return '🎪';
    default:
      return '📍';
  }
};

function StaffBookingsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");
  
  useEffect(() => {
    setIsClient(true);
    if (isAuthenticated === false) {
      router.push('/auth/login');
    } else if (isAuthenticated === true && bookings === null) {
     
      const timer = setTimeout(() => {
        setBookings([...mockBookings]);
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router, bookings]);

 
  const filteredBookings = useMemo(() => {
    if (!bookings || !Array.isArray(bookings)) return [];
    
    const searchLower = searchTerm ? searchTerm.toLowerCase() : '';
    const statusLower = statusFilter ? statusFilter.toLowerCase() : 'all';
    const resourceLower = resourceTypeFilter ? resourceTypeFilter.toLowerCase() : 'all';
    
    return bookings.filter(booking => {
      if (!booking) return false;
      
      const memberName = booking.memberName || '';
      const memberEmail = booking.memberEmail || '';
      const resourceName = booking.resourceName || '';
      
      const matchesSearch = 
        memberName.toLowerCase().includes(searchLower) ||
        memberEmail.toLowerCase().includes(searchLower) ||
        resourceName.toLowerCase().includes(searchLower);
        
      const matchesStatus = statusLower === 'all' || (booking.status || '') === statusLower;
      const matchesResource = resourceLower === 'all' || (booking.resourceType || '') === resourceLower;
        
      return matchesSearch && matchesStatus && matchesResource;
    });
  }, [bookings, searchTerm, statusFilter, resourceTypeFilter]);

 
  const totalBookings = bookings?.length || 0;
  const confirmedBookings = bookings?.filter(b => b?.status === 'confirmed').length || 0;
  const pendingBookings = bookings?.filter(b => b?.status === 'pending').length || 0;
  const totalRevenue = bookings?.reduce((sum, b) => sum + (b?.price || 0), 0) || 0;

 
  if (bookings === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage and track all workspace bookings
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      {}
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

      {}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>View and manage all bookings</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bookings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getResourceIcon(booking.resourceType)}</span>
                        <div>
                          <h3 className="font-medium">{booking.resourceName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.memberName} • {booking.memberEmail}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p>{booking.date}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time</p>
                          <p>{booking.startTime} - {booking.endTime}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p>{formatCurrency(booking.price)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingBooking(booking)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent>
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
                <DialogDescription>
                  View detailed information about this booking
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getResourceIcon(selectedBooking.resourceType)}</span>
                  <div>
                    <h3 className="text-lg font-medium">{selectedBooking.resourceName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedBooking.memberName} • {selectedBooking.memberEmail}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p>{selectedBooking.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Time</p>
                    <p>{selectedBooking.startTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Time</p>
                    <p>{selectedBooking.endTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p>{selectedBooking.duration} hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p>{formatCurrency(selectedBooking.price)}</p>
                  </div>
                </div>
                
                {selectedBooking.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="mt-1">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={showCreateDialog || !!editingBooking} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingBooking(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBooking ? 'Edit Booking' : 'Create New Booking'}</DialogTitle>
            <DialogDescription>
              {editingBooking 
                ? `Update booking for ${editingBooking.memberName}`
                : 'Create a new booking for a member'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Member</Label>
              <Select defaultValue={editingBooking?.memberEmail}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {mockMembers.map((member) => (
                    <SelectItem key={member.id} value={member.email}>
                      {member.name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Resource</Label>
              <Select defaultValue={editingBooking?.resourceName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent>
                  {mockResources.map((resource) => (
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
                <Input type="date" defaultValue={editingBooking?.date} />
              </div>
              <div>
                <Label>Start Time</Label>
                <Input type="time" defaultValue={editingBooking?.startTime} />
              </div>
              <div>
                <Label>Duration (hours)</Label>
                <Input 
                  type="number" 
                  min="0.5" 
                  step="0.5" 
                  defaultValue={editingBooking?.duration || 1} 
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select defaultValue={editingBooking?.status || 'confirmed'}>
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
              <Textarea placeholder="Any special requests or notes..." defaultValue={editingBooking?.notes} />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingBooking(null);
                }}
              >
                Cancel
              </Button>
              <Button>
                {editingBooking ? 'Save Changes' : 'Create Booking'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StaffBookingsPage;
