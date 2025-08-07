"use client"
import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
// Dynamically import the dashboard layout with SSR disabled
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
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Calendar, 
  Plus, 
  Save, 
  AlertTriangle 
} from "lucide-react"
// Mock data for regular hours
const mockRegularHours = [
  { id: 'monday', day: 'Monday', open: '09:00', close: '18:00', isClosed: false },
  { id: 'tuesday', day: 'Tuesday', open: '09:00', close: '18:00', isClosed: false },
  { id: 'wednesday', day: 'Wednesday', open: '09:00', close: '18:00', isClosed: false },
  { id: 'thursday', day: 'Thursday', open: '09:00', close: '18:00', isClosed: false },
  { id: 'friday', day: 'Friday', open: '09:00', close: '18:00', isClosed: false },
  { id: 'saturday', day: 'Saturday', open: '10:00', close: '16:00', isClosed: false },
  { id: 'sunday', day: 'Sunday', open: '', close: '', isClosed: true },
];

// Mock data for special hours
const mockSpecialHours = [
  { id: '1', name: 'New Year\'s Day', date: '2024-01-01', isClosed: true, open: '', close: '' },
  { id: '2', name: 'Christmas Day', date: '2024-12-25', isClosed: true, open: '', close: '' },
];

function HoursContent() {
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("regular")
  const [regularHours, setRegularHours] = useState<typeof mockRegularHours>([])
  const [specialHours, setSpecialHours] = useState<typeof mockSpecialHours>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    const loadData = async () => {
      try {
        // Simulate API call with a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (Math.random() < 0.1) { // Simulate potential API failure
          throw new Error('Failed to load hours data');
        }
        
        setRegularHours(mockRegularHours);
        setSpecialHours(mockSpecialHours);
        setIsMounted(true);
        setError(null);
      } catch (err) {
        console.error('Error loading hours data:', err);
        setError('Failed to load hours data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [])
  // Show loading state during SSR/hydration
  if (typeof window === 'undefined' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  // Show error state if data loading failed
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4 text-center">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }
  const [weekdays, setWeekdays] = useState([
    { id: 1, name: "Monday", open: "08:00", close: "20:00", is24Hours: false, isClosed: false },
    { id: 2, name: "Tuesday", open: "08:00", close: "20:00", is24Hours: false, isClosed: false },
    { id: 3, name: "Wednesday", open: "08:00", close: "20:00", is24Hours: false, isClosed: false },
    { id: 4, name: "Thursday", open: "08:00", close: "20:00", is24Hours: false, isClosed: false },
    { id: 5, name: "Friday", open: "08:00", close: "22:00", is24Hours: false, isClosed: false },
    { id: 6, name: "Saturday", open: "10:00", close: "18:00", is24Hours: false, isClosed: false },
    { id: 7, name: "Sunday", open: "12:00", close: "16:00", is24Hours: false, isClosed: true },
  ])
  const [specialDays, setSpecialDays] = useState([
    { id: 1, date: "2025-01-01", name: "New Year's Day", open: "", close: "", is24Hours: false, isClosed: true },
    { id: 2, date: "2025-12-25", name: "Christmas Day", open: "", close: "", is24Hours: false, isClosed: true },
    { id: 3, date: "2025-12-31", name: "New Year's Eve", open: "08:00", close: "15:00", is24Hours: false, isClosed: false },
  ])
  const [membershipAccess, setMembershipAccess] = useState([
    { id: 1, name: "Day Pass", accessHours: "Regular hours", has24HourAccess: false },
    { id: 2, name: "Weekly Flex", accessHours: "Regular hours", has24HourAccess: false },
    { id: 3, name: "Monthly Pro", accessHours: "Regular hours + Weekends", has24HourAccess: false },
    { id: 4, name: "Enterprise", accessHours: "24/7 Access", has24HourAccess: true },
  ])
  const handleWeekdayChange = (id: number, field: string, value: string | boolean) => {
    setWeekdays(prev => prev.map(day => 
      day.id === id ? { ...day, [field]: value } : day
    ))
  }
  const handleSpecialDayChange = (id: number, field: string, value: string | boolean) => {
    setSpecialDays(prev => prev.map(day => 
      day.id === id ? { ...day, [field]: value } : day
    ))
  }
  const handleMembershipChange = (id: number, field: string, value: boolean) => {
    setMembershipAccess(prev => prev.map(membership => 
      membership.id === id ? { ...membership, [field]: value } : membership
    ))
  }
  const handleNewSpecialDayChange = (field: string, value: string | boolean) => {
    setSpecialDays(prev => ({ ...prev, [field]: value }))
  }
  return (
    <DynamicDashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Hours</h1>
            <p className="text-muted-foreground">Configure operating hours and access schedules</p>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
        {/* Current Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Current Status</CardTitle>
            <CardDescription>Today's operating hours and access information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 p-3">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Open Today</h3>
                  <p className="text-muted-foreground">8:00 AM - 8:00 PM</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Staff Present
                  </Badge>
                  <span className="text-sm text-muted-foreground">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    24/7 Access
                  </Badge>
                  <span className="text-sm text-muted-foreground">Enterprise & Premium Members</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="regular">Regular Hours</TabsTrigger>
            <TabsTrigger value="special">Special Days</TabsTrigger>
            <TabsTrigger value="access">Membership Access</TabsTrigger>
          </TabsList>
          {/* Regular Hours Tab */}
          <TabsContent value="regular" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Regular Operating Hours</CardTitle>
                <CardDescription>Set your standard weekly operating hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weekdays.map((day) => (
                    <div key={day.id} className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-5 md:items-center">
                      <div className="font-medium">{day.name}</div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`${day.name}-closed`} className="text-sm">
                            Closed
                          </Label>
                          <Switch id={`${day.name}-closed`} checked={day.isClosed} onCheckedChange={(checked) => handleWeekdayChange(day.id, 'isClosed', checked)} />
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Label htmlFor={`${day.name}-24hours`} className="text-sm">
                            24 Hours
                          </Label>
                          <Switch id={`${day.name}-24hours`} checked={day.is24Hours} onCheckedChange={(checked) => handleWeekdayChange(day.id, 'is24Hours', checked)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 md:col-span-2">
                        <div className="space-y-1">
                          <Label htmlFor={`${day.name}-open`} className="text-xs">
                            Open
                          </Label>
                          <Input
                            id={`${day.name}-open`}
                            type="time"
                            value={day.open}
                            disabled={day.isClosed || day.is24Hours}
                            onChange={(e) => handleWeekdayChange(day.id, 'open', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`${day.name}-close`} className="text-xs">
                            Close
                          </Label>
                          <Input
                            id={`${day.name}-close`}
                            type="time"
                            value={day.close}
                            disabled={day.isClosed || day.is24Hours}
                            onChange={(e) => handleWeekdayChange(day.id, 'close', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Special Days Tab */}
          <TabsContent value="special" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Special Days & Holidays</CardTitle>
                  <CardDescription>Set custom hours for holidays and special events</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Special Day
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Special Day</DialogTitle>
                      <DialogDescription>Create a special day with custom operating hours.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="special-date" className="text-right">
                          Date
                        </Label>
                        <Input id="special-date" type="date" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="special-name" className="text-right">
                          Name
                        </Label>
                        <Input id="special-name" placeholder="e.g., Christmas Day" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <div className="text-right">Status</div>
                        <div className="col-span-3 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="special-closed">Closed</Label>
                            <Switch id="special-closed" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="special-24hours">24 Hours</Label>
                            <Switch id="special-24hours" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="special-open" className="text-right">
                          Open
                        </Label>
                        <Input id="special-open" type="time" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="special-close" className="text-right">
                          Close
                        </Label>
                        <Input id="special-close" type="time" className="col-span-3" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Add Special Day</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {specialDays.map((day) => (
                    <div key={day.id} className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-5 md:items-center">
                      <div className="space-y-1">
                        <div className="font-medium">{day.name}</div>
                        <div className="text-sm text-muted-foreground">{day.date}</div>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`special-${day.id}-closed`} className="text-sm">
                            Closed
                          </Label>
                          <Switch id={`special-${day.id}-closed`} checked={day.isClosed} onCheckedChange={(checked) => handleSpecialDayChange(day.id, 'isClosed', checked)} />
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Label htmlFor={`special-${day.id}-24hours`} className="text-sm">
                            24 Hours
                          </Label>
                          <Switch id={`special-${day.id}-24hours`} checked={day.is24Hours} onCheckedChange={(checked) => handleSpecialDayChange(day.id, 'is24Hours', checked)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 md:col-span-2">
                        <div className="space-y-1">
                          <Label htmlFor={`special-${day.id}-open`} className="text-xs">
                            Open
                          </Label>
                          <Input
                            id={`special-${day.id}-open`}
                            type="time"
                            value={day.open}
                            disabled={day.isClosed || day.is24Hours}
                            onChange={(e) => handleSpecialDayChange(day.id, 'open', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`special-${day.id}-close`} className="text-xs">
                            Close
                          </Label>
                          <Input
                            id={`special-${day.id}-close`}
                            type="time"
                            value={day.close}
                            disabled={day.isClosed || day.is24Hours}
                            onChange={(e) => handleSpecialDayChange(day.id, 'close', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Membership Access Tab */}
          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Membership Access Hours</CardTitle>
                <CardDescription>Configure access hours for different membership types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {membershipAccess.map((membership) => (
                    <div key={membership.id} className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-3 md:items-center">
                      <div className="font-medium">{membership.name}</div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`membership-${membership.id}-24hours`} className="text-sm">
                          24/7 Access
                        </Label>
                        <Switch id={`membership-${membership.id}-24hours`} checked={membership.has24HourAccess} onCheckedChange={(checked) => handleMembershipChange(membership.id, 'has24HourAccess', checked)} />
                      </div>
                      <div>
                        <Select defaultValue={membership.has24HourAccess ? "24/7" : "regular"} disabled={membership.has24HourAccess}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select access hours" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">Regular Hours</SelectItem>
                            <SelectItem value="extended">Extended Hours (6am-12am)</SelectItem>
                            <SelectItem value="weekends">Regular Hours + Weekends</SelectItem>
                            <SelectItem value="24/7">24/7 Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Access Control Settings</CardTitle>
                <CardDescription>Configure how members access the space outside staffed hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h4 className="font-medium">Key Card Access</h4>
                      <p className="text-sm text-muted-foreground">Allow members to enter using key cards</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h4 className="font-medium">Mobile App Access</h4>
                      <p className="text-sm text-muted-foreground">Allow members to enter using the mobile app</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h4 className="font-medium">PIN Code Access</h4>
                      <p className="text-sm text-muted-foreground">Allow members to enter using PIN codes</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4 bg-yellow-50">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Security Notification</h4>
                        <p className="text-sm text-yellow-700">
                          Members with 24/7 access must sign the after-hours agreement
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-yellow-600 bg-white text-yellow-700 hover:bg-yellow-50"
                      onClick={() => {
                        // Create modal for agreement display
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                        modal.innerHTML = `
                          <div class="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto m-4">
                            <div class="flex justify-between items-start mb-4">
                              <h3 class="text-lg font-semibold text-gray-900">After-Hours Access Agreement</h3>
                              <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              </button>
                            </div>
                            <div class="whitespace-pre-line text-sm text-gray-700 mb-6">
                              <h4 class="font-semibold mb-2">AFTER-HOURS ACCESS AGREEMENT</h4>
                              This agreement governs access to coworking facilities outside regular business hours.
                              <strong>TERMS AND CONDITIONS:</strong>
                              1. 24/7 access is granted to Enterprise and Premium members only
                              2. Members must maintain valid membership status
                              3. Security protocols must be followed at all times
                              4. Facility damage or misuse will result in access revocation
                              5. Emergency contact procedures must be maintained
                              <strong>SECURITY REQUIREMENTS:</strong>
                              - Personal access codes must not be shared
                              - All areas must be secured when leaving
                              - Report any suspicious activity immediately
                              - Emergency contact: Facility Manager
                              By accessing the facility after hours, members agree to these terms.
                            </div>
                            <div class="flex justify-end gap-2">
                              <button 
                                onclick="this.closest('.fixed').remove()" 
                                class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                              >
                                I Understand
                              </button>
                            </div>
                          </div>
                        `;
                        document.body.appendChild(modal);
                        // Close on outside click
                        modal.addEventListener('click', (e) => {
                          if (e.target === modal) modal.remove();
                        });
                      }}
                    >
                      View Agreement
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DynamicDashboardLayout>
  )
}
// Main page component with client-side only rendering
export default function HoursPage() {
  return <HoursContent />
}
