"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format, addDays } from "date-fns"
// Import UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import { CalendarDays, Clock, MapPin, Plus, Search, Loader2, RefreshCw, Edit, Trash2 } from "lucide-react"

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

// Main bookings page component with client-side rendering
export default function BookingsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const router = useRouter();
  const [viewMode, setViewMode] = useState("day")

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [formData, setFormData] = useState({
    resource: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    notes: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Bookings data
  const [bookings, setBookings] = useState<Array<{
    id: string;
    resourceName: string;
    resourceType: string;
    startTime: string;
    endTime: string;
    status: string;
    date: string;
    notes?: string;
  }>>([]);

  const [resources] = useState([
    { id: "507f1f77bcf86cd799439011", name: "Desk A-12", type: "Hot Desk", capacity: 1, hourlyRate: 15 },
    { id: "507f1f77bcf86cd799439012", name: "Meeting Room B", type: "Meeting Room", capacity: 8, hourlyRate: 50 },
    { id: "507f1f77bcf86cd799439013", name: "Private Office 3", type: "Private Office", capacity: 4, hourlyRate: 80 },
    { id: "507f1f77bcf86cd799439014", name: "Phone Booth 1", type: "Phone Booth", capacity: 1, hourlyRate: 10 },
  ]);

  // Load data on component mount
  useEffect(() => {
    setIsMounted(true);

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch user bookings
        const bookingsRes = await fetch('/api/bookings/user');

        if (!bookingsRes.ok) {
          if (bookingsRes.status === 401) {
            // Redirect to login if not authenticated
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch bookings');
        }

        const bookingsData = await bookingsRes.json();

        // Transform bookings data to match the expected format
        const formattedBookings = bookingsData.map((booking: any) => ({
          id: booking.id,
          resourceName: booking.resourceName || 'Unknown',
          resourceType: booking.resourceType || 'Unknown',
          status: booking.status || 'pending',
          date: new Date(booking.startTime).toISOString().split('T')[0],
          startTime: new Date(booking.startTime).toTimeString().slice(0, 5),
          endTime: new Date(booking.endTime).toTimeString().slice(0, 5),
          notes: booking.notes,
        }));

        setBookings(formattedBookings);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        // Fallback to mock data if API fails
        const mockBookings = [
          {
            id: '1',
            resourceName: "Desk A-12",
            resourceType: "Hot Desk",
            startTime: "09:00",
            endTime: "17:00",
            status: "confirmed",
            date: new Date().toISOString().split('T')[0],
            notes: "Working on project"
          },
          {
            id: '2',
            resourceName: "Meeting Room B",
            resourceType: "Meeting Room",
            startTime: "14:00",
            endTime: "16:00",
            status: "pending",
            date: new Date().toISOString().split('T')[0],
            notes: "Client meeting"
          },
        ];
        setBookings(mockBookings);
        toast.error('Using mock data. Could not connect to the server.');
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

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.resource) errors.resource = 'Resource is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endTime) errors.endTime = 'End time is required';

    // Validate time range
    if (formData.startTime && formData.endTime) {
      const [startHour, startMinute] = formData.startTime.split(':').map(Number);
      const [endHour, endMinute] = formData.endTime.split(':').map(Number);

      const startDate = new Date();
      startDate.setHours(startHour, startMinute, 0, 0);

      const endDate = new Date();
      endDate.setHours(endHour, endMinute, 0, 0);

      if (endDate <= startDate) {
        errors.endTime = 'End time must be after start time';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      // Create start and end datetime objects
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      // Validate time range
      if (startDateTime >= endDateTime) {
        setFormErrors({
          ...formErrors,
          endTime: 'End time must be after start time'
        });
        setIsSubmitting(false);
        return;
      }

      // Get the selected resource
      const selectedResource = resources.find(r => r.id === formData.resource);
      if (!selectedResource) {
        throw new Error('Selected resource not found');
      }

      // Prepare booking data
      const bookingData = {
        resourceId: formData.resource,
        resourceName: selectedResource.name,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes: formData.notes,
      };

      const response = await fetch('/api/bookings/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const newBooking = await response.json();

      // Update local state with the new booking
      setBookings(prev => [{
        id: newBooking.id,
        resourceName: selectedResource.name,
        resourceType: selectedResource.type,
        status: newBooking.status || 'pending',
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes,
      }, ...prev]);

      // Show success message and close dialog
      toast.success('Booking request sent successfully! Awaiting approval.');
      setRequestSent(true);

      // Reset form
      setFormData({
        resource: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '10:00',
        notes: ''
      });

      // Close the dialog after a brief delay to show the success message
      setTimeout(() => {
        const dialog = document.getElementById('create-booking-dialog') as HTMLDialogElement;
        if (dialog) {
          dialog.close();
          setRequestSent(false); // Reset for next time
        }
      }, 1500);

    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Update local state
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled' }
          : booking
      ));

      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your space reservations</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" id="create-booking-dialog">
            <DialogHeader>
              <DialogTitle>Request New Booking</DialogTitle>
              <DialogDescription>Request to book a space. Approval required for all bookings.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBooking}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="resource">Resource</Label>
                  <Select
                    value={formData.resource}
                    onValueChange={(value) => setFormData({...formData, resource: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} - ${resource.hourlyRate}/hr
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.resource && (
                    <p className="text-sm text-red-500">{formErrors.resource}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className={formErrors.date ? 'border-red-500' : ''}
                  />
                  {formErrors.date && (
                    <p className="text-sm text-red-500">{formErrors.date}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className={formErrors.startTime ? 'border-red-500' : ''}
                    />
                    {formErrors.startTime && (
                      <p className="text-sm text-red-500">{formErrors.startTime}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className={formErrors.endTime ? 'border-red-500' : ''}
                    />
                    {formErrors.endTime && (
                      <p className="text-sm text-red-500">{formErrors.endTime}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Any special requirements or notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const dialog = document.getElementById('create-booking-dialog') as HTMLDialogElement;
                    if (dialog) dialog.close();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Request...
                    </>
                  ) : requestSent ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Request Sent!
                    </>
                  ) : 'Request Booking'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search bookings..." className="pl-8" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>{selectedDate?.toDateString() || "Select a date to view bookings"}</CardDescription>
              </div>
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
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No bookings found</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first booking to get started</p>
                </div>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{booking.resourceName}</p>
                        <Badge variant={getStatusColor(booking.status as any)}>{booking.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.resourceType}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </div>
                      {booking.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{booking.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <Button variant="outline" size="sm">
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Available Resources</CardTitle>
          <CardDescription>Resources you can book</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {resources.map((resource) => (
              <div key={resource.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{resource.name}</h4>
                  <Badge variant="outline">{resource.type}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Capacity: {resource.capacity} • ${resource.hourlyRate}/hr
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  Available
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
