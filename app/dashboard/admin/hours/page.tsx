"use client";

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
const DynamicDashboardLayout = dynamic(
  () => import('@/components/dashboard-layout'),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    ) 
  }
)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Calendar, 
  Plus, 
  Save, 
  AlertTriangle,
  RefreshCw,
  Check
} from "lucide-react"

type Weekday = {
  id: string;
  day: string;
  open: string;
  close: string;
  is24Hours: boolean;
  isClosed: boolean;
};

type SpecialDay = {
  id: string;
  date: string;
  name: string;
  open: string;
  close: string;
  is24Hours: boolean;
  isClosed: boolean;
};

type MembershipAccess = {
  id: string;
  name: string;
  accessHours: string;
  has24HourAccess: boolean;
};

function HoursContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("regular");
  const [regularHours, setRegularHours] = useState<Weekday[] | null>(null);
  const [specialHours, setSpecialHours] = useState<SpecialDay[] | null>(null);
  const [membershipAccess, setMembershipAccess] = useState<MembershipAccess[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

 
  const mockRegularHours: Weekday[] = [
    { id: 'monday', day: 'Monday', open: '09:00', close: '18:00', is24Hours: false, isClosed: false },
    { id: 'tuesday', day: 'Tuesday', open: '09:00', close: '18:00', is24Hours: false, isClosed: false },
    { id: 'wednesday', day: 'Wednesday', open: '09:00', close: '18:00', is24Hours: false, isClosed: false },
    { id: 'thursday', day: 'Thursday', open: '09:00', close: '18:00', is24Hours: false, isClosed: false },
    { id: 'friday', day: 'Friday', open: '09:00', close: '18:00', is24Hours: false, isClosed: false },
    { id: 'saturday', day: 'Saturday', open: '10:00', close: '16:00', is24Hours: false, isClosed: false },
    { id: 'sunday', day: 'Sunday', open: '', close: '', is24Hours: false, isClosed: true },
  ];

 
  const mockSpecialHours: SpecialDay[] = [
    { id: '1', name: 'New Year\'s Day', date: '2024-01-01', isClosed: true, open: '', close: '', is24Hours: false },
    { id: '2', name: 'Christmas Day', date: '2024-12-25', isClosed: true, open: '', close: '', is24Hours: false },
  ];

 
  const mockMembershipAccess: MembershipAccess[] = [
    { id: '1', name: '24/7 Access', accessHours: '00:00 - 23:59', has24HourAccess: true },
    { id: '2', name: 'Business Hours', accessHours: '09:00 - 18:00', has24HourAccess: false },
    { id: '3', name: 'Custom Hours', accessHours: 'Custom', has24HourAccess: false },
  ];

  useEffect(() => {
    const initializeData = async () => {
      try {
       
        await new Promise(resolve => setTimeout(resolve, 500));
        
       
        setRegularHours(mockRegularHours);
        setSpecialHours(mockSpecialHours);
        setMembershipAccess(mockMembershipAccess);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load hours data');
        setIsLoading(false);
      }
    };

    setIsMounted(true);
    initializeData();
  }, []);

 
  if (!isMounted || isLoading || regularHours === null || specialHours === null || membershipAccess === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-xl font-semibold">Error Loading Hours</h2>
        <p className="mb-4 text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Hours</h1>
          <p className="text-muted-foreground">
            Manage your business hours and special schedules
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={async () => {
              try {
                setIsSaving(true);
                setError(null);
                
               
               
               
               
               
               
               
               
               
               
               
               
                
               
                await new Promise(resolve => setTimeout(resolve, 1000));
                
               
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
                
                console.log('Saved changes:', { regularHours, specialHours, membershipAccess });
              } catch (err) {
                console.error('Error saving changes:', err);
                setError('Failed to save changes. Please try again.');
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          {saveSuccess && (
            <div className="ml-2 flex items-center text-sm text-green-600">
              <Check className="mr-1 h-4 w-4" />
              Changes saved successfully!
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="regular">Regular Hours</TabsTrigger>
          <TabsTrigger value="special">Special Hours</TabsTrigger>
          <TabsTrigger value="membership">Membership Access</TabsTrigger>
        </TabsList>

        <TabsContent value="regular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regular Business Hours</CardTitle>
              <CardDescription>
                Set your standard weekly business hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regularHours?.map((day) => (
                  <div key={day.id} className="flex items-center space-x-4 rounded-lg border p-4">
                    <div className="w-32 font-medium">{day.day}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="grid w-full max-w-[200px] grid-cols-2 gap-2">
                          <Input
                            type="time"
                            value={day.open}
                            disabled={day.isClosed || day.is24Hours}
                            onChange={(e) => {
                              const newHours = [...regularHours];
                              const dayIndex = newHours.findIndex((d) => d.id === day.id);
                              if (dayIndex !== -1) {
                                newHours[dayIndex] = { ...newHours[dayIndex], open: e.target.value };
                                setRegularHours(newHours);
                              }
                            }}
                          />
                          <Input
                            type="time"
                            value={day.close}
                            disabled={day.isClosed || day.is24Hours}
                            onChange={(e) => {
                              const newHours = [...regularHours];
                              const dayIndex = newHours.findIndex((d) => d.id === day.id);
                              if (dayIndex !== -1) {
                                newHours[dayIndex] = { ...newHours[dayIndex], close: e.target.value };
                                setRegularHours(newHours);
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Switch
                              id={`24h-${day.id}`}
                              checked={day.is24Hours}
                              onCheckedChange={(checked) => {
                                const newHours = [...regularHours];
                                const dayIndex = newHours.findIndex((d) => d.id === day.id);
                                if (dayIndex !== -1) {
                                  newHours[dayIndex] = {
                                    ...newHours[dayIndex],
                                    is24Hours: checked,
                                    isClosed: checked ? false : newHours[dayIndex].isClosed,
                                    open: checked ? '00:00' : newHours[dayIndex].open,
                                    close: checked ? '23:59' : newHours[dayIndex].close,
                                  };
                                  setRegularHours(newHours);
                                }
                              }}
                            />
                            <Label htmlFor={`24h-${day.id}`}>24h</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Switch
                              id={`closed-${day.id}`}
                              checked={day.isClosed}
                              onCheckedChange={(checked) => {
                                const newHours = [...regularHours];
                                const dayIndex = newHours.findIndex((d) => d.id === day.id);
                                if (dayIndex !== -1) {
                                  newHours[dayIndex] = {
                                    ...newHours[dayIndex],
                                    isClosed: checked,
                                    is24Hours: checked ? false : newHours[dayIndex].is24Hours,
                                  };
                                  setRegularHours(newHours);
                                }
                              }}
                              disabled={day.is24Hours}
                            />
                            <Label htmlFor={`closed-${day.id}`}>Closed</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Special Hours</CardTitle>
                  <CardDescription>
                    Add special hours for holidays and events
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Special Hours
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Special Hours</DialogTitle>
                      <DialogDescription>
                        Add special hours for holidays or events
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="event-name">Event Name</Label>
                        <Input id="event-name" placeholder="e.g., Christmas Day" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="event-date">Date</Label>
                        <Input id="event-date" type="date" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Hours</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="time" placeholder="Open" />
                          <Input type="time" placeholder="Close" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="all-day" />
                        <Label htmlFor="all-day">24 Hours</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="closed" />
                        <Label htmlFor="closed">Closed</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {specialHours?.map((event) => (
                  <div key={event.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {event.isClosed ? (
                        <Badge variant="destructive">Closed</Badge>
                      ) : event.is24Hours ? (
                        <Badge>24 Hours</Badge>
                      ) : (
                        <Badge variant="outline">
                          {event.open} - {event.close}
                        </Badge>
                      )}
                      <Button variant="ghost" size="icon">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </div>
                  </div>
                ))}
                {(!specialHours || specialHours.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No special hours</h3>
                    <p className="text-muted-foreground">
                      Add special hours for holidays and events
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="membership" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Membership Access Hours</CardTitle>
              <CardDescription>
                Set access hours for different membership types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">24/7 Access</h4>
                      <p className="text-sm text-muted-foreground">
                        Full access to the space 24/7
                      </p>
                    </div>
                    <Switch id="24-7-access" />
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Business Hours</h4>
                      <p className="text-sm text-muted-foreground">
                        Access during regular business hours only
                      </p>
                    </div>
                    <Switch id="business-hours" />
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Custom Hours</h4>
                      <p className="text-sm text-muted-foreground">
                        Set custom access hours
                      </p>
                    </div>
                    <Switch id="custom-hours" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const HoursPage: React.FC = () => {
  return <HoursContent />;
};

export default HoursPage;
