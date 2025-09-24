"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
// Import UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import {
  CalendarDays,
  Clock,
  MapPin,
  Search,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  CheckSquare,
  FileText
} from "lucide-react"

// Helper function to get badge variant based on status
function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}

// Main admin bookings page component
export default function AdminBookingsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [resources] = useState([
    { id: "507f1f77bcf86cd799439011", name: "Desk A-12", type: "Hot Desk", capacity: 1, hourlyRate: 15 },
    { id: "507f1f77bcf86cd799439012", name: "Meeting Room B", type: "Meeting Room", capacity: 8, hourlyRate: 50 },
    { id: "507f1f77bcf86cd799439013", name: "Private Office 3", type: "Private Office", capacity: 4, hourlyRate: 80 },
    { id: "507f1f77bcf86cd799439014", name: "Phone Booth 1", type: "Phone Booth", capacity: 1, hourlyRate: 10 },
  ]);
  const router = useRouter();

  // Bookings data
  const [allBookings, setAllBookings] = useState<Array<{
    id: string;
    user: { name: string; email: string };
    resourceName: string;
    resourceType: string;
    startTime: string;
    endTime: string;
    status: string;
    date: string;
    notes?: string;
    price: number;
    paid: boolean;
  }>>([]);

  const [pendingBookings, setPendingBookings] = useState<Array<{
    id: string;
    user: { name: string; email: string };
    resourceName: string;
    resourceType: string;
    startTime: string;
    endTime: string;
    status: string;
    date: string;
    notes?: string;
    price: number;
    paid: boolean;
  }>>([]);

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load data on component mount
  useEffect(() => {
    setIsMounted(true);

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch all bookings for admin
        const bookingsRes = await fetch('/api/bookings');

        if (!bookingsRes.ok) {
          if (bookingsRes.status === 401) {
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch bookings');
        }

        const bookingsData = await bookingsRes.json();

        // Transform bookings data
        const formattedBookings = bookingsData.map((booking: any) => ({
          id: booking.id,
          user: booking.user || { name: 'Unknown', email: 'No email' },
          resourceName: booking.resourceName || 'Unknown',
          resourceType: booking.resourceType || 'Unknown',
          status: booking.status || 'pending',
          date: new Date(booking.startTime).toISOString().split('T')[0],
          startTime: new Date(booking.startTime).toTimeString().slice(0, 5),
          endTime: new Date(booking.endTime).toTimeString().slice(0, 5),
          notes: booking.notes,
          price: booking.price || 0,
          paid: booking.paid || false,
        }));

        // Separate pending bookings from all bookings
        const pending = formattedBookings.filter((b: any) => b.status === 'pending');
        const all = formattedBookings;

        setPendingBookings(pending);
        setAllBookings(all);
        setError(null);

      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load bookings data');
        setPendingBookings([]);
        setAllBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [router]);

  // Don't render anything until the component is mounted on the client
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle booking approval
  const handleApproveBooking = async (bookingId: string) => {
    try {
      setIsProcessing(true);

      const response = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve booking');
      }

      // Update local state
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
      setAllBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'confirmed' } : b
      ));

      toast.success('Booking approved successfully');
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle booking rejection
  const handleRejectBooking = async (bookingId: string) => {
    try {
      setIsProcessing(true);

      const response = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject booking');
      }

      // Update local state
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
      setAllBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));

      toast.success('Booking rejected successfully');
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter bookings based on search and status
  const filteredAllBookings = allBookings.filter(booking => {
    const matchesSearch =
      booking.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.resourceName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredPendingBookings = pendingBookings.filter(booking => {
    const matchesSearch =
      booking.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.resourceName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
          <p className="text-muted-foreground">Manage booking requests and view all reservations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              All reservations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allBookings.filter(b => b.status === 'confirmed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${allBookings.filter(b => b.paid).reduce((sum, b) => sum + b.price, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total paid bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bookings..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Bookings Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Pending Booking Requests
              </CardTitle>
              <CardDescription>
                Review and approve booking requests from members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No pending requests</p>
                  <p className="text-sm text-muted-foreground mt-1">All booking requests have been processed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPendingBookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50/50">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{booking.user.name}</p>
                            <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                          </div>
                          <Badge variant="secondary">{booking.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.resourceName} ({booking.resourceType})
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.startTime} - {booking.endTime}
                          </div>
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground bg-white p-2 rounded border">
                            {booking.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectBooking(booking.id)}
                          disabled={isProcessing}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="mr-2 h-4 w-4" />
                          )}
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveBooking(booking.id)}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                          )}
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Bookings Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Bookings
              </CardTitle>
              <CardDescription>
                View and manage all booking reservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allBookings.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No bookings found</p>
                  <p className="text-sm text-muted-foreground mt-1">No reservations have been made yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAllBookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{booking.user.name}</p>
                            <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                          </div>
                          <Badge variant={getStatusColor(booking.status)}>{booking.status}</Badge>
                          {booking.paid && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Paid
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.resourceName} ({booking.resourceType})
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.startTime} - {booking.endTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">${booking.price}</span>
                          </div>
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded border">
                            {booking.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {booking.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveBooking(booking.id)}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isProcessing ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
