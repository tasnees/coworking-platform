"use client";

import * as React from 'react'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { addDays } from "date-fns"

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
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ResourceFormData {
  id?: string;
  name: string;
  type: string;
  capacity: number;
  hourlyRate: number;
  description: string;
  isActive: boolean;
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

interface FormErrors {
  member?: string;
  resource?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  timeRange?: string;
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Loader2, 
  Plus, 
  Save, 
  Pencil, 
  Trash2, 
  MapPin, 
  User, 
  CheckCircle2, 
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  FileText,
  Check,
  X,
  RefreshCw,
  Search,
  CalendarDays,
  MoreHorizontal
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import type { DateRange } from 'react-day-picker'


import { Fragment } from 'react'

function getStatusVariant(status: string) {
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

const getStatusColor = getStatusVariant;

export default function BookingsPage() {
  const { isLoaded: isUserLoaded, user } = useUser();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
 
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isDeletingResource, setIsDeletingResource] = useState(false);
  const [isSubmittingResource, setIsSubmittingResource] = useState(false);
  const [resourceFormData, setResourceFormData] = useState<ResourceFormData>({
    name: '',
    type: 'desk',
    capacity: 1,
    hourlyRate: 0,
    description: '',
    isActive: true
  });
  const [isEditingResource, setIsEditingResource] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'resources'>('bookings');
  
 
  const [isCreating, setIsCreating] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<FormData>({
    member: '',
    resource: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.member) errors.member = 'Please select a member';
    if (!formData.resource) errors.resource = 'Please select a resource';
    if (!formData.date) errors.date = 'Please select a date';
    if (!formData.startTime) errors.startTime = 'Please select a start time';
    if (!formData.endTime) errors.endTime = 'Please select an end time';
    
    if (formData.startTime && formData.endTime) {
      const [startHour, startMinute] = formData.startTime.split(':').map(Number);
      const [endHour, endMinute] = formData.endTime.split(':').map(Number);
      
      if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
        errors.timeRange = 'End time must be after start time';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkAvailability = async (): Promise<boolean> => {
    if (!formData.resource || !formData.date || !formData.startTime || !formData.endTime) {
      return false;
    }
    
    try {
      setIsCheckingAvailability(true);
      const response = await fetch('/api/bookings/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: formData.resource,
          date: formData.date.toISOString(),
          startTime: formData.startTime,
          endTime: formData.endTime,
         
          excludeBookingId: formData.member
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to check availability');
      }
      
      const { available } = await response.json();
      setIsAvailable(available);
      return available;
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability');
      return false;
    } finally {
      setIsCheckingAvailability(false);
    }
  };

 
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
      setFormErrors(prev => ({ ...prev, date: undefined }));
     
      setIsAvailable(null);
    }
  };
  
  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'startTime' && { endTime: '' })
    }));
    setFormErrors(prev => ({
      ...prev,
      [field]: undefined,
      timeRange: undefined
    }));
   
    setIsAvailable(null);
  };

 
  const handleOpenResourceDialog = (resource?: Resource) => {
    if (resource) {
      setResourceFormData({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        capacity: resource.capacity,
        hourlyRate: resource.hourlyRate,
        description: resource.description || '',
        isActive: resource.isActive
      });
      setIsEditingResource(true);
    } else {
      setResourceFormData({
        name: '',
        type: 'desk',
        capacity: 1,
        hourlyRate: 0,
        description: '',
        isActive: true
      });
      setIsEditingResource(false);
    }
    setIsResourceDialogOpen(true);
  };

  const handleResourceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setResourceFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              value
    }));
  };

  const handleSubmitResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingResource(true);
    
    try {
      const url = isEditingResource && resourceFormData.id 
        ? `/api/admin/resources/${resourceFormData.id}`
        : '/api/admin/resources';
      
      const method = isEditingResource ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to save resource');
      }

      const result = await response.json();
      toast.success(`Resource ${isEditingResource ? 'updated' : 'created'} successfully`);
      
     
      fetchResources();
      setIsResourceDialogOpen(false);
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error(`Failed to ${isEditingResource ? 'update' : 'create'} resource`);
    } finally {
      setIsSubmittingResource(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!resourceToDelete) return;
    
    setIsDeletingResource(true);
    
    try {
      const response = await fetch(`/api/admin/resources/${resourceToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }

      toast.success('Resource deleted successfully');
      
     
      fetchResources();
      setResourceToDelete(null);
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    } finally {
      setIsDeletingResource(false);
    }
  };

 
  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/admin/members', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/auth/sign-in');
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to load members');
      }

      const data: Member[] = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members. Please try again.');
      throw error;
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/admin/resources', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/auth/sign-in');
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to load resources');
      }

      const data: Resource[] = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources. Please try again.');
      throw error;
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/auth/sign-in');
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to load bookings');
      }

      const data: Booking[] = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings. Please try again.');
      throw error;
    }
  };

 
  useEffect(() => {
    if (!isUserLoaded) return;

   
    const userRole = user?.publicMetadata?.role;
    if (userRole !== 'admin') {
      router.push('/dashboard/unauthorized');
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchMembers(),
          fetchResources(),
          fetchBookings()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
        setIsMounted(true);
      }
    };

    loadData();
  }, [isUserLoaded, user]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
   
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
   
    if (isAvailable === null) {
      const available = await checkAvailability();
      if (!available) {
        toast.error('The selected time slot is not available');
        return;
      }
    } else if (!isAvailable) {
      toast.error('The selected time slot is not available');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Booking created successfully');
       
       
        document.getElementById('close-dialog')?.click();
       
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
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {activeTab === 'bookings' ? 'Bookings' : 'Resources'} Management
            </h1>
            <p className="text-muted-foreground">
              {activeTab === 'bookings' 
                ? 'Manage space reservations and availability' 
                : 'Manage available workspaces and meeting rooms'}
            </p>
          </div>
          
          {activeTab === 'bookings' ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Booking
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Booking</DialogTitle>
                  <DialogDescription>
                    Book a space for a member or walk-in customer.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateBooking} className="space-y-4">
                  <div className="grid gap-4">
                    {}
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button onClick={() => handleOpenResourceDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          )}
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={(value: string) => setActiveTab(value as 'bookings' | 'resources')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {activeTab === 'bookings' ? (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>View and manage upcoming reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.memberName}</TableCell>
                        <TableCell>{booking.resourceName}</TableCell>
                        <TableCell>{new Date(booking.startTime).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}
      
      {}
      <Dialog>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>Book a space for a member or walk-in customer.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="grid gap-4">
              {}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="member" className={formErrors.member ? 'text-destructive' : ''}>
                    Member {formErrors.member && <span className="text-xs text-destructive ml-1">*</span>}
                  </Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() => toast.info('Add new member functionality would go here')}
                    >
                      + New Member
                    </Button>
                  </div>
                  <Select 
                    value={formData.member} 
                    onValueChange={(value) => {
                      setFormData(prev => ({...prev, member: value}));
                      setFormErrors(prev => ({...prev, member: undefined}));
                    }}
                  >
                    <SelectTrigger className={formErrors.member ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-xs text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.member && (
                    <p className="text-sm text-destructive">{formErrors.member}</p>
                  )}
                </div>
                
                {}
                <div className="space-y-2">
                  <Label htmlFor="resource" className={formErrors.resource ? 'text-destructive' : ''}>
                    Resource {formErrors.resource && <span className="text-xs text-destructive ml-1">*</span>}
                  </Label>
                  <Select 
                    value={formData.resource} 
                    onValueChange={(value) => {
                      setFormData(prev => ({...prev, resource: value}));
                      setFormErrors(prev => ({...prev, resource: undefined}));
                      setIsAvailable(null);
                    }}
                  >
                    <SelectTrigger className={formErrors.resource ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select a resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                              <MapPin className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <div className="font-medium">{resource.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {resource.type} • {resource.capacity} people • ${resource.hourlyRate}/hr
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.resource && (
                    <p className="text-sm text-destructive">{formErrors.resource}</p>
                  )}
                </div>
                
                {}
                <div className="space-y-2">
                  <Label className={formErrors.date ? 'text-destructive' : ''}>
                    Date {formErrors.date && <span className="text-xs text-destructive ml-1">*</span>}
                  </Label>
                  <div className={`border rounded-md p-2 ${formErrors.date ? 'border-destructive' : ''}`}>
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={handleDateSelect}
                      className="rounded-md w-full"
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </div>
                  {formErrors.date && (
                    <p className="text-sm text-destructive">{formErrors.date}</p>
                  )}
                </div>
                
                {}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className={formErrors.startTime || formErrors.endTime || formErrors.timeRange ? 'text-destructive' : ''}>
                      Time {formErrors.startTime || formErrors.endTime ? (
                        <span className="text-xs text-destructive ml-1">*</span>
                      ) : null}
                    </Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-6 px-2"
                      disabled={!formData.startTime || !formData.endTime || isCheckingAvailability}
                      onClick={async () => {
                        const isValid = validateForm();
                        if (isValid) {
                          const available = await checkAvailability();
                          if (available) {
                            toast.success('This time slot is available!');
                          } else {
                            toast.error('This time slot is not available');
                          }
                        }
                      }}
                    >
                      {isCheckingAvailability ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 mr-1" />
                      )}
                      Check Availability
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Input 
                        id="startTime" 
                        type="time" 
                        value={formData.startTime}
                        onChange={(e) => handleTimeChange('startTime', e.target.value)}
                        className={formErrors.startTime || formErrors.timeRange ? 'border-destructive' : ''}
                      />
                      {formErrors.startTime && (
                        <p className="text-sm text-destructive">{formErrors.startTime}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Input 
                        id="endTime" 
                        type="time" 
                        value={formData.endTime}
                        onChange={(e) => handleTimeChange('endTime', e.target.value)}
                        className={formErrors.endTime || formErrors.timeRange ? 'border-destructive' : ''}
                        disabled={!formData.startTime}
                      />
                      {formErrors.endTime ? (
                        <p className="text-sm text-destructive">{formErrors.endTime}</p>
                      ) : formErrors.timeRange ? (
                        <p className="text-sm text-destructive">{formErrors.timeRange}</p>
                      ) : null}
                    </div>
                  </div>
                  {isAvailable !== null && (
                    <div className={`flex items-center text-sm ${isAvailable ? 'text-green-600' : 'text-destructive'}`}>
                      {isAvailable ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          <span>This time slot is available</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1.5" />
                          <span>This time slot is not available</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <span className="text-xs text-muted-foreground">
                      {formData.notes.length}/500
                    </span>
                  </div>
                  <textarea
                    id="notes"
                    placeholder="Any special requirements or notes for this booking?"
                    value={formData.notes}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setFormData({...formData, notes: e.target.value});
                      }
                    }}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={3}
                  />
                </div>
              </div>
              
              {}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('close-dialog')?.click()}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isCreating || isCheckingAvailability}
                  className="w-full sm:w-auto"
                >
                  {isCreating ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Create Booking
                    </span>
                  )}
                </Button>
              </div>
            </form>
            {}
            <button id="close-dialog" className="hidden" onClick={() => {}} />
          </DialogContent>
        </Dialog>
      
      {}
      <div className="grid gap-4">
        {activeTab === 'resources' ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Resources</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search resources..."
                    className="w-[200px]"
                   
                  />
                </div>
              </div>
              <CardDescription>
                Manage all available workspaces and meeting rooms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resources.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                    <MapPin className="h-full w-full" />
                  </div>
                  <h3 className="text-lg font-medium">No resources found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by adding a new resource
                  </p>
                  <Button onClick={() => handleOpenResourceDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Resource
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                      <div 
                        key={resource.id}
                        className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium flex items-center">
                              {resource.name}
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {resource.type}
                              </span>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {resource.description || 'No description'}
                            </p>
                            <div className="mt-2 flex items-center text-sm">
                              <span className="text-muted-foreground">
                                {resource.capacity} {resource.capacity === 1 ? 'person' : 'people'}
                              </span>
                              <span className="mx-2 text-muted-foreground">•</span>
                              <span className="font-medium">
                                ${resource.hourlyRate}/hr
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenResourceDialog(resource)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setResourceToDelete(resource.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-1.5 ${
                              resource.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            {resource.isActive ? 'Active' : 'Inactive'}
                          </div>
                          <div className="text-muted-foreground">
                            Added {new Date(resource.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
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
                                {booking.resourceName} • {new Date(booking.startTime).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
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
        )}
      </div>
      
      {}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditingResource ? 'Edit' : 'Add New'} Resource</DialogTitle>
            <DialogDescription>
              {isEditingResource 
                ? 'Update the resource details below.' 
                : 'Fill in the details to add a new resource.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitResource}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Resource Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={resourceFormData.name}
                  onChange={handleResourceInputChange}
                  placeholder="e.g., Conference Room A, Hot Desk 42"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    name="type"
                    value={resourceFormData.type}
                    onChange={handleResourceInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="desk">Desk</option>
                    <option value="meeting_room">Meeting Room</option>
                    <option value="conference_room">Conference Room</option>
                    <option value="private_office">Private Office</option>
                    <option value="event_space">Event Space</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={resourceFormData.capacity}
                    onChange={handleResourceInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={resourceFormData.hourlyRate}
                  onChange={handleResourceInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  name="description"
                  value={resourceFormData.description}
                  onChange={handleResourceInputChange}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Add any details about this resource..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  name="isActive"
                  checked={resourceFormData.isActive}
                  onCheckedChange={(checked) => 
                    setResourceFormData(prev => ({ ...prev, isActive: checked }))
                  }
                />
                <Label htmlFor="isActive">
                  {resourceFormData.isActive ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsResourceDialogOpen(false)}
                disabled={isSubmittingResource}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingResource}>
                {isSubmittingResource ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditingResource ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditingResource ? 'Update' : 'Create'} Resource
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <AlertDialog
        open={!!resourceToDelete}
        onOpenChange={(open) => !open && setResourceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this resource and all associated bookings. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingResource}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async (e) => {
                e.preventDefault();
                await handleDeleteResource();
              }}
              disabled={isDeletingResource}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingResource ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : 'Delete Resource'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
