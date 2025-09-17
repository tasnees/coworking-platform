"use client";

import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, Clock as ClockIcon, MoreVertical, User, Plus, Loader2 } from 'lucide-react';
// Using relative paths to the UI components
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Badge } from '../../../../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../../components/ui/dropdown-menu';
import { useToast } from '../../../../components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { cn } from '../../../../lib/utils';
import { Calendar } from '../../../../components/ui/calendar';

// Types
type CheckInStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface ScheduledCheckIn {
  id: string;
  user: User;
  checkInTime: string;
  status: CheckInStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Main CheckInPage component
export default function CheckInPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [checkIns, setCheckIns] = useState<ScheduledCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date());
  const [checkInTime, setCheckInTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  
  // Form state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Fetch check-ins based on the active tab
  // Fetch users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/members');
        if (!response.ok) throw new Error('Failed to fetch members');
        const data = await response.json();
        
        // Map the API response to match our User interface
        const memberUsers: User[] = data.map((member: any) => ({
          id: member.id,
          name: member.name || 'Unnamed Member',
          email: member.email || 'No email',
          image: member.image
        }));
        
        setUsers(memberUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load members. Please try again.',
          variant: 'destructive',
        });
      }
    };
    
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        setIsLoading(true);
        
        // Fetch check-ins from the API
        const response = await fetch('/api/admin/check-ins');
        
        if (!response.ok) {
          throw new Error('Failed to fetch check-ins');
        }
        
        const data = await response.json();
        
        // Filter check-ins based on active tab
        const filteredCheckIns = data.filter((checkIn: any) => {
          if (activeTab === 'upcoming') return checkIn.status === 'scheduled';
          if (activeTab === 'completed') return checkIn.status === 'completed';
          if (activeTab === 'cancelled') return checkIn.status === 'cancelled';
          if (activeTab === 'missed') return checkIn.status === 'missed';
          return true;
        });
        
        // Map the API response to match our ScheduledCheckIn interface
        const formattedCheckIns: ScheduledCheckIn[] = filteredCheckIns.map((checkIn: any) => ({
          id: checkIn.id,
          user: {
            id: checkIn.user.id,
            name: checkIn.user.name,
            email: checkIn.user.email,
            image: checkIn.user.image
          },
          checkInTime: checkIn.checkInTime,
          status: checkIn.status,
          notes: checkIn.notes || undefined,
          createdAt: checkIn.createdAt,
          updatedAt: checkIn.updatedAt
        }));
        
        setCheckIns(formattedCheckIns);
      } catch (error) {
        console.error('Error fetching check-ins:', error);
        toast({
          title: 'Error',
          description: 'Failed to load check-ins. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isMounted) {
      fetchCheckIns();
    }
  }, [activeTab, isMounted, toast]);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  const handleStatusChange = async (checkInId: string, newStatus: CheckInStatus) => {
    try {
      // Make API call to update the status
      const response = await fetch(`/api/admin/check-ins/${checkInId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update check-in status');
      }
      
      const updatedCheckIn = await response.json();
      
      // Update local state
      setCheckIns(prev => 
        prev.map(checkIn => 
          checkIn.id === checkInId 
            ? { 
                ...checkIn, 
                status: updatedCheckIn.status, 
                updatedAt: updatedCheckIn.updatedAt,
                notes: updatedCheckIn.notes || checkIn.notes
              } 
            : checkIn
        )
      );
      
      toast({
        title: 'Success',
        description: `Check-in marked as ${newStatus} successfully.`,
      });
    } catch (error) {
      console.error('Error updating check-in status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update check-in status. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleCreateCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Record<string, string> = {};
    if (!selectedUserId) errors.user = 'Please select a member';
    if (!checkInDate) errors.date = 'Please select a date';
    if (!checkInTime) errors.time = 'Please select a time';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Combine date and time
      if (!checkInDate) throw new Error('Check-in date is required');
      const [hours, minutes] = checkInTime.split(':').map(Number);
      const checkInDateTime = new Date(checkInDate);
      checkInDateTime.setHours(hours, minutes);
      
      // Make API call to create the check-in
      const response = await fetch('/api/admin/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          checkInTime: checkInDateTime.toISOString(),
          notes: notes || undefined,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create check-in');
      }
      
      const newCheckIn = await response.json();
      
      // Update local state with the new check-in
      setCheckIns(prev => [{
        id: newCheckIn.id,
        user: {
          id: newCheckIn.user.id,
          name: newCheckIn.user.name,
          email: newCheckIn.user.email,
          image: newCheckIn.user.image
        },
        checkInTime: newCheckIn.checkInTime,
        status: newCheckIn.status,
        notes: newCheckIn.notes || undefined,
        createdAt: newCheckIn.createdAt,
        updatedAt: newCheckIn.updatedAt
      }, ...prev]);
      
      // Reset form
      setSelectedUserId('');
      setCheckInDate(new Date());
      setCheckInTime('09:00');
      setNotes('');
      setFormErrors({});
      setIsDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Check-in scheduled successfully.',
      });
    } catch (error) {
      console.error('Error creating check-in:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to schedule check-in. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusBadge = (status: CheckInStatus) => {
    const statusConfig = {
      scheduled: { label: 'Scheduled', variant: 'default' as const, icon: <ClockIcon className="h-4 w-4 mr-1" /> },
      completed: { label: 'Completed', variant: 'secondary' as const, icon: <CheckCircle className="h-4 w-4 mr-1" /> },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: <XCircle className="h-4 w-4 mr-1" /> },
      missed: { label: 'Missed', variant: 'outline' as const, icon: <ClockIcon className="h-4 w-4 mr-1" /> },
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    
    return (
      <Badge variant={config.variant} className="flex items-center">
        {config.icon}
        {config.label}
      </Badge>
    );
  };
  
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Check-ins</h1>
          <p className="text-muted-foreground">
            View and manage all scheduled check-ins
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule New Check-in
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule New Check-in</DialogTitle>
              <DialogDescription>
                Schedule a new check-in for a member. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCheckIn}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="member">Member</Label>
                  <select
                    id="member"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a member</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  {formErrors.user && (
                    <p className="text-sm text-destructive">{formErrors.user}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !checkInDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkInDate ? (
                          format(checkInDate, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkInDate}
                        onSelect={setCheckInDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.date && (
                    <p className="text-sm text-destructive">{formErrors.date}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className={formErrors.time ? 'border-destructive' : ''}
                  />
                  {formErrors.time && (
                    <p className="text-sm text-destructive">{formErrors.time}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this check-in"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    'Schedule Check-in'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="upcoming" onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="missed">Missed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : checkIns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No {activeTab} check-ins found.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {checkIns.map((checkIn) => (
                <Card key={checkIn.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {checkIn.user.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {checkIn.user.email}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {getStatusBadge(checkIn.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {checkIn.status === 'scheduled' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(checkIn.id, 'completed')}
                                  className="text-green-600"
                                >
                                  Mark as Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(checkIn.id, 'cancelled')}
                                  className="text-destructive"
                                >
                                  Cancel Check-in
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(checkIn.checkInTime), 'PPP')}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {format(new Date(checkIn.checkInTime), 'p')}
                      <span className="mx-2">•</span>
                      {formatDistanceToNow(new Date(checkIn.checkInTime), { addSuffix: true })}
                    </div>
                    {checkIn.notes && (
                      <div className="pt-2 border-t mt-2">
                        <p className="text-sm text-muted-foreground">
                          {checkIn.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-4 border-t">
                    <div className="flex justify-between w-full items-center">
                      <span className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(new Date(checkIn.createdAt), { addSuffix: true })}
                      </span>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
