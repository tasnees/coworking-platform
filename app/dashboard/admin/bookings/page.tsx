"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format, addDays } from "date-fns"

// Define types
interface Member {
  id: string;
  name: string;
  email: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  hourlyRate: number;
}

interface Booking {
  id: string;
  memberName: string;
  resourceName: string;
  startTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface FormData {
  member: string;
  resource: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes: string;
}

// Import UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
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
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Plus, 
  Search, 
  Loader2, 
  RefreshCw 
} from "lucide-react"

// Import types
import type { DateRange } from 'react-day-picker'

// Helper function to get badge variant based on status
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
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

export default function BookingsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    member: '',
    resource: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    notes: ''
  });

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
    }
  };

  const router = useRouter();

  // Load members and resources on component mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/admin/members');
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to load members');
        }
        const data: Member[] = await response.json();
        setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load members');
      }
    };
    
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resources');
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to load resources');
        }
        const data: Resource[] = await response.json();
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load resources');
      }
    };

    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings');
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to load bookings');
        }
        const data: Booking[] = await response.json();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load bookings');
      } finally {
        setIsLoading(false);
        setIsMounted(true);
      }
    };

    Promise.all([fetchMembers(), fetchResources(), fetchBookings()]);
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      if (!formData.member || !formData.resource || !formData.date || !formData.startTime || !formData.endTime) {
        toast.error('Please fill in all required fields');
        return;
      }
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Booking created successfully');
        // Refresh bookings
        // Close dialog
        document.getElementById('close-dialog')?.click();
        // Reset form
        setFormData({
          member: '',
          resource: '',
          date: new Date(),
          startTime: '',
          endTime: '',
          notes: ''
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings Management</h1>
          <p className="text-muted-foreground">Manage space reservations and availability</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
              <DialogDescription>Book a space for a member or walk-in customer.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBooking}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="member">Member</Label>
                  <Select 
                    value={formData.member} 
                    onValueChange={(value) => setFormData({...formData, member: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select a member</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
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
                      <SelectItem value="">Select a resource</SelectItem>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} ({resource.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="border rounded-md p-2">
                    <Calendar
                      mode="single"
                      selected={formData.date || new Date()}
                      onSelect={handleDateSelect}
                      className="rounded-md"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input 
                      id="startTime" 
                      type="time" 
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input 
                      id="endTime" 
                      type="time" 
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input 
                    id="notes" 
                    placeholder="Any special requirements?" 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('close-dialog')?.click()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : 'Create Booking'}
                </Button>
              </div>
            </form>
            {/* Hidden close button for programmatic closing */}
            <button id="close-dialog" className="hidden" onClick={() => {}} />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Main Content */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>View and manage upcoming reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming bookings found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{booking.memberName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.resourceName} • {format(new Date(booking.startTime), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Resource Availability</CardTitle>
            <CardDescription>Current status of all bookable resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <div key={resource.id} className="border rounded-lg p-4">
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
    </div>
  );
}
