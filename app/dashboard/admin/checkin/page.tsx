"use client";

import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Calendar, Clock, CheckCircle, XCircle, Clock as ClockIcon, MoreVertical } from 'lucide-react';
// Using relative paths to the UI components
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Badge } from '../../../../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../../components/ui/dropdown-menu';
import { useToast } from '../../../../components/ui/use-toast';

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
  const { toast } = useToast();
  
  // Fetch check-ins based on the active tab
  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch this from your API
        // const response = await fetch(`/api/admin/check-ins?status=${activeTab}`);
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockCheckIns: ScheduledCheckIn[] = [
          {
            id: '1',
            user: { id: '1', name: 'John Doe', email: 'john@example.com' },
            checkInTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            status: 'scheduled',
            notes: 'Initial consultation',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            user: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
            checkInTime: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
            status: 'scheduled',
            notes: 'Follow-up meeting',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            user: { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
            checkInTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            status: 'completed',
            notes: 'Completed successfully',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        
        setCheckIns(mockCheckIns.filter(checkIn => {
          if (activeTab === 'upcoming') return checkIn.status === 'scheduled';
          if (activeTab === 'completed') return checkIn.status === 'completed';
          if (activeTab === 'cancelled') return checkIn.status === 'cancelled';
          if (activeTab === 'missed') return checkIn.status === 'missed';
          return true;
        }));
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
      // In a real app, you would make an API call to update the status
      // await fetch(`/api/admin/check-ins/${checkInId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus }),
      // });
      
      // Update local state for demo
      setCheckIns(prev => 
        prev.map(checkIn => 
          checkIn.id === checkInId 
            ? { ...checkIn, status: newStatus, updatedAt: new Date().toISOString() } 
            : checkIn
        )
      );
      
      toast({
        title: 'Success',
        description: `Check-in ${newStatus} successfully.`,
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
        <Button>
          Schedule New Check-in
        </Button>
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
