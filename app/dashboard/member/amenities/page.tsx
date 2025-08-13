"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import DashboardLayout from "@/components/dashboard-layout"
import {
  Coffee,
  Printer,
  Wifi,
  Monitor,
  Headphones,
  Bike,
  Utensils,
  Package,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart
} from "lucide-react"
export default function AmenitiesPage() {
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const amenities = [
    {
      id: 1,
      name: "Coffee Machine",
      category: "Refreshments",
      location: "Kitchen Area",
      status: "operational",
      icon: Coffee,
      description: "Premium coffee machine with various options",
      lastMaintenance: "2025-06-15",
      nextMaintenance: "2025-08-15",
      usageStats: {
        daily: 45,
        weekly: 315,
        monthly: 1350
      }
    },
    {
      id: 2,
      name: "Color Printer",
      category: "Office Equipment",
      location: "Print Station",
      status: "operational",
      icon: Printer,
      description: "High-quality color laser printer",
      lastMaintenance: "2025-07-01",
      nextMaintenance: "2025-09-01",
      usageStats: {
        daily: 28,
        weekly: 196,
        monthly: 840
      }
    },
    {
      id: 3,
      name: "High-Speed WiFi",
      category: "Connectivity",
      location: "Entire Space",
      status: "operational",
      icon: Wifi,
      description: "200 Mbps fiber internet connection",
      lastMaintenance: "2025-07-10",
      nextMaintenance: "2025-08-10",
      usageStats: {
        daily: 120,
        weekly: 840,
        monthly: 3600
      }
    },
    {
      id: 4,
      name: "Conference Displays",
      category: "Meeting Equipment",
      location: "Meeting Rooms",
      status: "maintenance",
      icon: Monitor,
      description: "4K displays with wireless connectivity",
      lastMaintenance: "2025-06-20",
      nextMaintenance: "2025-07-25",
      usageStats: {
        daily: 15,
        weekly: 105,
        monthly: 450
      }
    },
    {
      id: 5,
      name: "Noise-Cancelling Headphones",
      category: "Office Equipment",
      location: "Front Desk",
      status: "operational",
      icon: Headphones,
      description: "Premium headphones available for checkout",
      lastMaintenance: "2025-07-05",
      nextMaintenance: "2025-09-05",
      usageStats: {
        daily: 12,
        weekly: 84,
        monthly: 360
      }
    },
    {
      id: 6,
      name: "Bike Storage",
      category: "Facilities",
      location: "Basement",
      status: "operational",
      icon: Bike,
      description: "Secure bike storage with 20 spaces",
      lastMaintenance: "2025-05-15",
      nextMaintenance: "2025-08-15",
      usageStats: {
        daily: 8,
        weekly: 56,
        monthly: 240
      }
    },
    {
      id: 7,
      name: "Kitchen Facilities",
      category: "Refreshments",
      location: "Kitchen Area",
      status: "operational",
      icon: Utensils,
      description: "Full kitchen with microwave, fridge, and dishwasher",
      lastMaintenance: "2025-07-01",
      nextMaintenance: "2025-08-01",
      usageStats: {
        daily: 35,
        weekly: 245,
        monthly: 1050
      }
    },
    {
      id: 8,
      name: "Package Acceptance",
      category: "Services",
      location: "Front Desk",
      status: "operational",
      icon: Package,
      description: "Package acceptance and storage service",
      lastMaintenance: null,
      nextMaintenance: null,
      usageStats: {
        daily: 10,
        weekly: 70,
        monthly: 300
      }
    },
  ]
  const maintenanceSchedule = [
    {
      id: 1,
      amenity: "Conference Displays",
      date: "2025-07-25",
      type: "Repair",
      technician: "Tech Solutions Inc.",
      notes: "Replace HDMI port on Room B display",
      status: "scheduled"
    },
    {
      id: 2,
      amenity: "Coffee Machine",
      date: "2025-08-15",
      type: "Regular Maintenance",
      technician: "BrewMasters",
      notes: "Descaling and filter replacement",
      status: "scheduled"
    },
    {
      id: 3,
      amenity: "High-Speed WiFi",
      date: "2025-08-10",
      type: "Regular Maintenance",
      technician: "NetConnect Services",
      notes: "Router firmware update and signal optimization",
      status: "scheduled"
    },
    {
      id: 4,
      amenity: "Printer",
      date: "2025-07-18",
      type: "Repair",
      technician: "PrintFix",
      notes: "Paper jam mechanism repair",
      status: "completed"
    },
  ]
  // Initialize client-side flag and state
  const [isLoading, setIsLoading] = useState(true);
  const [clientSideAmenities, setClientSideAmenities] = useState<typeof amenities | null>(null);
  const [clientSideMaintenance, setClientSideMaintenance] = useState<typeof maintenanceSchedule | null>(null);

  // Load data on client side only
  useEffect(() => {
    setIsClient(true);
    // Simulate API call with a small delay
    const timer = setTimeout(() => {
      setClientSideAmenities([...amenities]);
      setClientSideMaintenance([...maintenanceSchedule]);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [])
  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "default"
      case "maintenance":
        return "secondary"
      case "out-of-order":
        return "destructive"
      default:
        return "secondary"
    }
  }
  const getStatusIcon = (status: string) => {
    if (!isClient || isLoading) return AlertTriangle; // Fallback icon during SSR/loading
    switch (status) {
      case "operational":
        return CheckCircle2
      case "maintenance":
        return Clock
      case "out-of-order":
        return XCircle
      default:
        return AlertTriangle
    }
  }
  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "secondary"
      case "in-progress":
        return "outline"
      case "completed":
        return "default"
      default:
        return "secondary"
    }
  }
  // Show loading state during SSR or while loading
  if (!isClient || isLoading) {
    return (
      <DashboardLayout userRole="member">
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Use client-side data when available
  const displayAmenities = clientSideAmenities || [];
  const displayMaintenance = clientSideMaintenance || [];

  return (
    <DashboardLayout userRole="member">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Amenities</h1>
          <p className="text-muted-foreground">
            Explore all the amenities available to you as a member. Check their status, upcoming maintenance, and usage trends.
          </p>
        </div>
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amenities</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayAmenities.length}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operational</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayAmenities.filter(a => a.status === "operational").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {displayAmenities.length > 0 
                  ? `${Math.round((displayAmenities.filter(a => a.status === "operational").length / displayAmenities.length) * 100)}% of total amenities`
                  : 'No amenities available'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayAmenities.filter(a => a.status === "maintenance").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {displayAmenities.length > 0 
                  ? `${Math.round((displayAmenities.filter(a => a.status === "maintenance").length / displayAmenities.length) * 100)}% of total amenities`
                  : 'No amenities available'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Maintenance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayMaintenance.filter(m => m.status === "scheduled").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {displayMaintenance.length > 0 
                  ? `Next: ${displayMaintenance.find(m => m.status === "scheduled")?.date || "N/A"}`
                  : 'No scheduled maintenance'}
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
          </TabsList>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayAmenities.map((amenity) => {
                const StatusIcon = getStatusIcon(amenity.status)
                return (
                  <Card key={amenity.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <amenity.icon className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-base">{amenity.name}</CardTitle>
                        </div>
                        <Badge variant={getStatusColor(amenity.status)}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {amenity.status === "operational"
                            ? "Operational"
                            : amenity.status === "maintenance"
                            ? "Maintenance"
                            : "Out of Order"}
                        </Badge>
                      </div>
                      <CardDescription>{amenity.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Category:</span> {amenity.category}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span> {amenity.location}
                        </div>
                        {amenity.lastMaintenance && (
                          <div>
                            <span className="text-muted-foreground">Last Maintenance:</span> {amenity.lastMaintenance}
                          </div>
                        )}
                        {amenity.nextMaintenance && (
                          <div>
                            <span className="text-muted-foreground">Next Maintenance:</span> {amenity.nextMaintenance}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>Upcoming and past maintenance for amenities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayMaintenance.map((maintenance) => (
                    <div key={maintenance.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{maintenance.amenity}</p>
                          <Badge variant={getMaintenanceStatusColor(maintenance.status)}>
                            {maintenance.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {maintenance.date} • {maintenance.type} • {maintenance.technician}
                        </p>
                        <p className="text-sm text-muted-foreground">{maintenance.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Alerts</CardTitle>
                <CardDescription>Amenities that require attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Conference Displays</h4>
                        <p className="text-sm text-yellow-700">
                          Currently under maintenance. Scheduled repair: July 25, 2025
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-800">Coffee Machine</h4>
                        <p className="text-sm text-blue-700">
                          Regular maintenance due in 23 days (August 15, 2025)
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-800">High-Speed WiFi</h4>
                        <p className="text-sm text-blue-700">
                          Regular maintenance due in 18 days (August 10, 2025)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Usage Statistics Tab */}
          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Amenity Usage Statistics</CardTitle>
                <CardDescription>Track usage patterns for your amenities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <amenity.icon className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium">{amenity.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/10">
                            <BarChart className="mr-1 h-3 w-3" />
                            {amenity.usageStats.daily} uses/day
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Daily</span>
                            <span>{amenity.usageStats.daily} uses</span>
                          </div>
                          <Progress value={(amenity.usageStats.daily / 150) * 100} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Weekly</span>
                            <span>{amenity.usageStats.weekly} uses</span>
                          </div>
                          <Progress value={(amenity.usageStats.weekly / 1000) * 100} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Monthly</span>
                            <span>{amenity.usageStats.monthly} uses</span>
                          </div>
                          <Progress value={(amenity.usageStats.monthly / 4000) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Amenities</CardTitle>
                <CardDescription>Ranked by daily usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...amenities]
                    .sort((a, b) => b.usageStats.daily - a.usageStats.daily)
                    .slice(0, 5)
                    .map((amenity, index) => (
                      <div key={amenity.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{amenity.name}</p>
                            <p className="text-sm text-muted-foreground">{amenity.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{amenity.usageStats.daily} uses/day</p>
                          <p className="text-sm text-muted-foreground">
                            {amenity.usageStats.monthly} uses/month
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
