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

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Coffee, 
  Printer, 
  Wifi, 
  Monitor, 
  Headphones, 
  Bike, 
  Utensils, 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart,
  Loader2
} from "lucide-react"

// Main component with proper loading state
export default function AmenitiesPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setIsClient(true)
  }, [])

  // Show loading state until component is mounted
  if (!isMounted || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  const [activeTab, setActiveTab] = useState("overview")
  const [amenities, setAmenities] = useState([
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
      availableFor: ["Day Pass", "Weekly Flex", "Monthly Pro", "Enterprise"],
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
      availableFor: ["Weekly Flex", "Monthly Pro", "Enterprise"],
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
      availableFor: ["Day Pass", "Weekly Flex", "Monthly Pro", "Enterprise"],
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
      availableFor: ["Weekly Flex", "Monthly Pro", "Enterprise"],
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
      availableFor: ["Monthly Pro", "Enterprise"],
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
      availableFor: ["Day Pass", "Weekly Flex", "Monthly Pro", "Enterprise"],
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
      availableFor: ["Day Pass", "Weekly Flex", "Monthly Pro", "Enterprise"],
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
      availableFor: ["Weekly Flex", "Monthly Pro", "Enterprise"],
      usageStats: {
        daily: 10,
        weekly: 70,
        monthly: 300
      }
    },
  ])
  const [editingAmenity, setEditingAmenity] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [amenityToDelete, setAmenityToDelete] = useState<any>(null)
  const handleEditAmenity = (amenity: any) => {
    setEditingAmenity(amenity)
    setShowEditDialog(true)
  }
  const handleDeleteAmenity = (amenity: any) => {
    setAmenityToDelete(amenity)
    setShowDeleteDialog(true)
  }
  const confirmDeleteAmenity = () => {
    if (amenityToDelete) {
      setAmenities(amenities.filter(a => a.id !== amenityToDelete.id))
      setShowDeleteDialog(false)
      setAmenityToDelete(null)
    }
  }
  const handleSaveEdit = () => {
    if (editingAmenity) {
      setAmenities(amenities.map(a => a.id === editingAmenity.id ? editingAmenity : a))
      setShowEditDialog(false)
      setEditingAmenity(null)
    }
  }
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
  const membershipTypes = [
    { id: 1, name: "Day Pass" },
    { id: 2, name: "Weekly Flex" },
    { id: 3, name: "Monthly Pro" },
    { id: 4, name: "Enterprise" },
  ]
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
  // Show loading state until component is mounted on client
  if (!isMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <DynamicDashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Amenities</h1>
            <p className="text-muted-foreground">Manage amenities and services for your coworking space</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Amenity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Amenity</DialogTitle>
                <DialogDescription>Add a new amenity or service to your coworking space.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amenity-name" className="text-right">
                    Name
                  </Label>
                  <Input id="amenity-name" placeholder="e.g., Standing Desk" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amenity-category" className="text-right">
                    Category
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office Equipment</SelectItem>
                      <SelectItem value="refreshments">Refreshments</SelectItem>
                      <SelectItem value="connectivity">Connectivity</SelectItem>
                      <SelectItem value="meeting">Meeting Equipment</SelectItem>
                      <SelectItem value="facilities">Facilities</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amenity-location" className="text-right">
                    Location
                  </Label>
                  <Input id="amenity-location" placeholder="e.g., Main Area" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amenity-description" className="text-right">
                    Description
                  </Label>
                  <Input id="amenity-description" placeholder="Brief description" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Available For</Label>
                  <div className="col-span-3 space-y-2">
                    {membershipTypes.map((type) => (
                      <div key={type.id} className="flex items-center gap-2">
                        <Switch id={`membership-${type.id}`} />
                        <Label htmlFor={`membership-${type.id}`}>{type.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amenity-status" className="text-right">
                    Status
                  </Label>
                  <Select defaultValue="operational">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="out-of-order">Out of Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Add Amenity</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amenities</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
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
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">87.5% of total amenities</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">12.5% of total amenities</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Maintenance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Next: Jul 25, 2025</p>
            </CardContent>
          </Card>
        </div>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="access">Membership Access</TabsTrigger>
            <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
          </TabsList>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {amenities.map((amenity) => {
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
                          {amenity.status === "operational" ? "Operational" : 
                            amenity.status === "maintenance" ? "Maintenance" : "Out of Order"}
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
                    <CardFooter className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditAmenity(amenity)}>
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAmenity(amenity)}>
                        <Trash2 className="mr-2 h-3 w-3" />
                        Remove
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Maintenance Schedule</CardTitle>
                  <CardDescription>Upcoming and past maintenance for amenities</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Schedule Maintenance</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule Maintenance</DialogTitle>
                      <DialogDescription>Schedule maintenance for an amenity.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="maintenance-amenity" className="text-right">
                          Amenity
                        </Label>
                        <Select>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select amenity" />
                          </SelectTrigger>
                          <SelectContent>
                            {amenities.map((amenity) => (
                              <SelectItem key={amenity.id} value={amenity.name}>
                                {amenity.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="maintenance-date" className="text-right">
                          Date
                        </Label>
                        <Input id="maintenance-date" type="date" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="maintenance-type" className="text-right">
                          Type
                        </Label>
                        <Select>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">Regular Maintenance</SelectItem>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="inspection">Inspection</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="maintenance-technician" className="text-right">
                          Technician
                        </Label>
                        <Input id="maintenance-technician" placeholder="e.g., ABC Repairs" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="maintenance-notes" className="text-right">
                          Notes
                        </Label>
                        <Input id="maintenance-notes" placeholder="Maintenance details" className="col-span-3" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Schedule</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceSchedule.map((maintenance) => (
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
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        {maintenance.status === "scheduled" && (
                          <Button variant="outline" size="sm">
                            Complete
                          </Button>
                        )}
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
          {/* Membership Access Tab */}
          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Amenity Access by Membership</CardTitle>
                <CardDescription>Configure which amenities are available for each membership type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {membershipTypes.map((membership) => (
                    <div key={membership.id} className="space-y-3">
                      <h3 className="font-medium">{membership.name}</h3>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {amenities.map((amenity) => {
                          const isAvailable = amenity.availableFor.includes(membership.name)
                          return (
                            <div key={amenity.id} className="flex items-center justify-between rounded-lg border p-3">
                              <div className="flex items-center gap-2">
                                <amenity.icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{amenity.name}</span>
                              </div>
                              <Switch checked={isAvailable} />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Access Settings</Button>
              </CardFooter>
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
        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Amenity</DialogTitle>
              <DialogDescription>Update the details for this amenity.</DialogDescription>
            </DialogHeader>
            {editingAmenity && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input 
                    id="edit-name" 
                    value={editingAmenity.name}
                    onChange={(e) => setEditingAmenity({...editingAmenity, name: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Category
                  </Label>
                  <Input 
                    id="edit-category" 
                    value={editingAmenity.category}
                    onChange={(e) => setEditingAmenity({...editingAmenity, category: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-location" className="text-right">
                    Location
                  </Label>
                  <Input 
                    id="edit-location" 
                    value={editingAmenity.location}
                    onChange={(e) => setEditingAmenity({...editingAmenity, location: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Description
                  </Label>
                  <Input 
                    id="edit-description" 
                    value={editingAmenity.description}
                    onChange={(e) => setEditingAmenity({...editingAmenity, description: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <Select 
                    value={editingAmenity.status}
                    onValueChange={(value) => setEditingAmenity({...editingAmenity, status: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="out-of-order">Out of Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{amenityToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteAmenity}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DynamicDashboardLayout>
  )
}
