"use client"
import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import DashboardLayout from "@/components/dashboard-layout"
import { 
  MapPin, 
  Users, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Maximize, 
  Minimize,
  ZoomIn,
  ZoomOut,
  Move,
  Layers,
  Grid,
  Square,
  Circle,
  Type,
  Save,
  Printer,
  Share2
} from "lucide-react"

// ---
// TYPE DEFINITIONS
// ---

interface Floor {
  id: string;
  name: string;
  level: number;
  capacity: number;
  occupancy: number;
  image?: string;
  description?: string;
  totalCapacity?: number;
  currentOccupancy?: number;
}

interface Area {
  id: number;
  name: string;
  type: string;
  floor: string;
  capacity: number;
  occupancy: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Desk {
  id: string;
  name?: string;
  type: string;
  status: string;
  floor: string;
  area?: string | number;
  member?: string | null;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  capacity?: number;
  occupancy?: number;
}

interface FloorStat {
  id: string;
  title: string;
  value: string;
  icon: React.ElementType;
  percentage: number;
}

// ---
// DATA DEFINITIONS
// You can define this data outside the component to ensure it's available for both
// the server (during prerendering) and the client.
// ---

const floors: Floor[] = [
  { 
    id: "main", 
    name: "Main Floor", 
    level: 1, 
    capacity: 80, 
    occupancy: 52, 
    totalCapacity: 80, 
    currentOccupancy: 52 
  },
  { 
    id: "second", 
    name: "Second Floor", 
    level: 2, 
    capacity: 40, 
    occupancy: 26, 
    totalCapacity: 40, 
    currentOccupancy: 26 
  },
  { 
    id: "basement", 
    name: "Basement", 
    level: 0, 
    capacity: 0, 
    occupancy: 0, 
    totalCapacity: 0, 
    currentOccupancy: 0 
  },
]

const areas: Area[] = [
  { id: 1, name: "Open Workspace", type: "workspace", capacity: 40, occupancy: 28, floor: "main", x: 0, y: 0, width: 10, height: 10 },
  { id: 2, name: "Meeting Room A", type: "meeting", capacity: 8, occupancy: 6, floor: "main", x: 10, y: 0, width: 4, height: 4 },
  { id: 3, name: "Meeting Room B", type: "meeting", capacity: 6, occupancy: 0, floor: "main", x: 14, y: 0, width: 4, height: 3 },
  { id: 4, name: "Phone Booth 1", type: "booth", capacity: 1, occupancy: 1, floor: "main", x: 0, y: 10, width: 2, height: 2 },
  { id: 5, name: "Phone Booth 2", type: "booth", capacity: 1, occupancy: 0, floor: "main", x: 2, y: 10, width: 2, height: 2 },
  { id: 6, name: "Lounge Area", type: "lounge", capacity: 12, occupancy: 4, floor: "main", x: 5, y: 10, width: 5, height: 4 },
  { id: 7, name: "Kitchen", type: "amenity", capacity: 8, occupancy: 2, floor: "main", x: 10, y: 10, width: 4, height: 4 },
  { id: 8, name: "Private Office 1", type: "office", capacity: 4, occupancy: 3, floor: "second", x: 0, y: 0, width: 4, height: 4 },
  { id: 9, name: "Private Office 2", type: "office", capacity: 6, occupancy: 6, floor: "second", x: 4, y: 0, width: 5, height: 5 },
  { id: 10, name: "Conference Room", type: "meeting", capacity: 12, occupancy: 8, floor: "second", x: 9, y: 0, width: 6, height: 4 },
  { id: 11, name: "Focus Room", type: "meeting", capacity: 2, occupancy: 1, floor: "second", x: 0, y: 4, width: 2, height: 2 },
  { id: 12, name: "Quiet Zone", type: "workspace", capacity: 16, occupancy: 9, floor: "second", x: 0, y: 6, width: 8, height: 6 },
]

const desks: Desk[] = [
  { id: "A1", name: "A1", type: "hot-desk", status: "occupied", member: "John Doe", area: 1, floor: "main", x: 1, y: 1, capacity: 1, occupancy: 1 },
  { id: "A2", name: "A2", type: "hot-desk", status: "occupied", member: "Jane Smith", area: 1, floor: "main", x: 2, y: 1, capacity: 1, occupancy: 1 },
  { id: "A3", name: "A3", type: "hot-desk", status: "available", member: null, area: 1, floor: "main", x: 3, y: 1, capacity: 1, occupancy: 0 },
  { id: "A4", name: "A4", type: "hot-desk", status: "available", member: null, area: 1, floor: "main", x: 4, y: 1, capacity: 1, occupancy: 0 },
  { id: "B1", name: "B1", type: "dedicated", status: "occupied", member: "Bob Johnson", area: 1, floor: "main", x: 1, y: 2, capacity: 1, occupancy: 1 },
  { id: "B2", name: "B2", type: "dedicated", status: "occupied", member: "Alice Brown", area: 1, floor: "main", x: 2, y: 2, capacity: 1, occupancy: 1 },
  { id: "MR1", name: "Meeting Room 1", type: "meeting", status: "occupied", member: "Team Standup", area: 2, floor: "main", x: 10, y: 1, capacity: 8, occupancy: 5 },
  { id: "MR2", name: "Meeting Room 2", type: "meeting", status: "available", member: null, area: 3, floor: "main", x: 14, y: 1, capacity: 6, occupancy: 0 },
  { id: "PB1", name: "Phone Booth 1", type: "phone", status: "occupied", member: "Mike Davis", area: 4, floor: "main", x: 0, y: 10, capacity: 1, occupancy: 1 },
  { id: "PB2", name: "Phone Booth 2", type: "phone", status: "available", member: null, area: 5, floor: "main", x: 2, y: 10, capacity: 1, occupancy: 0 },
  { id: "PO1", name: "Private Office 1", type: "private", status: "occupied", member: "Sarah Wilson", area: 8, floor: "second", x: 0, y: 0, capacity: 4, occupancy: 1 },
  { id: "PO2", name: "Private Office 2", type: "private", status: "occupied", member: "David Lee", area: 9, floor: "second", x: 4, y: 0, capacity: 6, occupancy: 1 },
  { id: "PO3", name: "Private Office 3", type: "private", status: "occupied", member: "Emma Garcia", area: 10, floor: "second", x: 9, y: 0, capacity: 12, occupancy: 1 },
  { id: "CR1", name: "Conference Room", type: "conference", status: "occupied", member: "Product Team", area: 11, floor: "second", x: 0, y: 4, capacity: 12, occupancy: 6 },
  { id: "QZ1", name: "Quiet Zone 1", type: "focus", status: "occupied", member: "Alex Chen", area: 12, floor: "second", x: 0, y: 6, capacity: 1, occupancy: 1 },
];

// ---
// HELPER FUNCTIONS (UNCHANGED)
// ---
const getAreaTypeLabel = (type: string) => {
  switch (type) {
    case "workspace": return "Workspace";
    case "meeting": return "Meeting Room";
    case "phone": return "Phone Booth";
    case "common": return "Common Area";
    case "office": return "Private Office";
    default: return type;
  }
}
const getAreaTypeColor = (type: string) => {
  switch (type) {
    case "workspace": return "bg-blue-100 text-blue-800";
    case "meeting": return "bg-purple-100 text-purple-800";
    case "phone": return "bg-green-100 text-green-800";
    case "common": return "bg-yellow-100 text-yellow-800";
    case "office": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}
const getDeskStatusColor = (status: string) => {
  switch (status) {
    case "occupied": return "bg-red-100 text-red-800";
    case "available": return "bg-green-100 text-green-800";
    case "reserved": return "bg-yellow-100 text-yellow-800";
    case "maintenance": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
}
const getDeskTypeLabel = (type: string) => {
  switch (type) {
    case "hot-desk": return "Hot Desk";
    case "dedicated": return "Dedicated Desk";
    case "standing": return "Standing Desk";
    default: return type;
  }
}

// ---
// MAIN COMPONENT
// ---
interface FloorStat {
  id: string;
  title: string;
  value: string;
  icon: React.ElementType;
  percentage: number;
}

// Helper function to safely get array length
const getSafeLength = (arr: any[] | undefined): number => {
  if (typeof window === 'undefined') return 0;
  try {
    return Array.isArray(arr) ? arr.length : 0;
  } catch (e) {
    return 0;
  }
};

// Safe data access for SSR
const safeFloors: Floor[] = typeof window !== 'undefined' ? floors : [];
const safeAreas: Area[] = typeof window !== 'undefined' ? areas : [];
const safeDesks: Desk[] = typeof window !== 'undefined' ? desks : [];

const getFloorStats = (floorId: string): FloorStat[] => {
  // Early return if running on server
  if (typeof window === 'undefined') {
    return [];
  }
  // Safely filter areas and desks, defaulting to empty arrays if undefined
  const currentFloor = safeFloors.find((floor: Floor) => floor.id === floorId) || safeFloors[0];
  const floorAreas = safeAccess.areas.filter((area: Area) => area.floor === currentFloor?.id) || [];
  const floorDesks = safeAccess.desks.filter((desk: Desk) => desk.floor === currentFloor?.id) || [];
  
  // Filter for meeting rooms with null checks
  const meetingRooms = Array.isArray(floorAreas) ? floorAreas.filter((area: any) => area?.type === 'meeting') : [];
  const occupiedMeetingRooms = Array.isArray(meetingRooms) ? meetingRooms.filter((room: any) => room?.occupancy > 0).length : 0;
  
  // Calculate total capacity and occupancy with null checks
  const totalCapacity = Array.isArray(floorAreas) ? floorAreas.reduce((total: number, area: Area) => total + (area.capacity || 0), 0) : 0;
  const areaOccupancy = floorAreas.reduce((total: number, area: Area) => total + (area.occupancy || 0), 0);
  const currentOccupancy = Array.isArray(floorDesks) ? floorDesks.filter((desk: any) => desk?.status === 'occupied').length : 0;

  return [
    { 
      id: 'capacity', 
      title: "Total Capacity", 
      value: totalCapacity.toString(), 
      icon: Users, 
      percentage: 0 
    },
    { 
      id: 'occupancy', 
      title: "Current Occupancy", 
      value: currentOccupancy.toString(), 
      icon: Users, 
      percentage: totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0 
    },
    { 
      id: 'meeting-rooms', 
      title: "Meeting Rooms", 
      value: `${occupiedMeetingRooms}/${meetingRooms.length}`, 
      icon: MapPin, 
      percentage: meetingRooms.length > 0 ? Math.round((occupiedMeetingRooms / meetingRooms.length) * 100) : 0 
    },
    { 
      id: 'revenue', 
      title: "Daily Revenue", 
      value: "$1,245", 
      icon: DollarSign, 
      percentage: 0 
    },
  ];
};

// Helper function to safely access array values
const safeAccess = typeof window === 'undefined' ? {
  floors: { find: () => null, filter: () => [] },
  areas: { find: () => undefined, filter: () => [] },
  desks: { filter: () => [] }
} : {
  floors: {
    find: (predicate: (floor: Floor) => boolean) => {
      try {
        return Array.isArray(safeFloors) ? safeFloors.find(predicate) : null;
      } catch (e) {
        return null;
      }
    },
    filter: (predicate: (floor: Floor) => boolean) => {
      try {
        return Array.isArray(safeFloors) ? safeFloors.filter(predicate) : [];
      } catch (e) {
        return [];
      }
    }
  },
  areas: {
    filter: (predicate: (area: Area) => boolean) => {
      try {
        return Array.isArray(safeAreas) ? safeAreas.filter(predicate) : [];
      } catch (e) {
        return [];
      }
    },
    find: (predicate: (area: Area) => boolean) => {
      try {
        return Array.isArray(safeAreas) ? safeAreas.find(predicate) : undefined;
      } catch (e) {
        return undefined;
      }
    }
  },
  desks: {
    filter: (predicate: (desk: Desk) => boolean) => {
      try {
        return Array.isArray(safeDesks) ? safeDesks.filter(predicate) : [];
      } catch (e) {
        return [];
      }
    }
  }
};

export default function FloorPlanPage() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("main");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [editMode, setEditMode] = useState(false);
  
  // Set client-side flag and initialize data
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ensure we have valid data before rendering
  if (!isClient) {
    return <div className="p-6">Loading floor plan...</div>;
  }

  // Calculate floor stats based on the active tab
  const floorStats = useMemo(() => {
    return getFloorStats(activeTab);
  }, [activeTab]);

  // Use `useMemo` to filter data once per render, improving performance
  const filteredAreas = useMemo(() => {
    return safeAccess.areas.filter((area: Area) => area && area.floor === activeTab);
  }, [activeTab, safeAreas]);

  const filteredDesks = useMemo(() => {
    return safeDesks.filter((desk: Desk) => desk && desk.floor === activeTab);
  }, [activeTab, safeDesks]);

  const currentFloor = useMemo(() => {
    return safeFloors.find((f: Floor) => f.id === activeTab) || safeFloors[0];
  }, [activeTab]);

  // Show loading state until client-side rendering is ready
  if (!isClient) {
    return <div className="p-6">Loading floor plan...</div>;
  }

  // Ensure we have valid data before rendering
  if (!safeFloors.length || !safeAreas.length || !safeDesks.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading floor plan data...</p>
      </div>
    );
  }
  
  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Floor Plan</h1>
            <p className="text-muted-foreground">Manage your coworking space layout and occupancy</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditMode(!editMode)}>
              {editMode ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Layout
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Layout
                </>
              )}
            </Button>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.isArray(floorStats) && floorStats.map((stat, index) => (
            <Card key={`stat-${index}-${stat.title || ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.percentage && (
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Floor Plan Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              {Array.isArray(floors) && floors.map((floor) => (
                floor && (
                  <TabsTrigger key={`floor-${floor.id}`} value={floor.id}>
                    {floor.name || `Floor ${floor.id}`}
                  </TabsTrigger>
                )
              ))}
            </TabsList>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                disabled={zoomLevel <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm">{zoomLevel}%</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                disabled={zoomLevel >= 150}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {floors.map((floor) => (
            <TabsContent key={floor.id} value={floor.id} className="space-y-4">
              {/* Floor Plan Visualization */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{floor.name}</CardTitle>
                      <CardDescription>
                        Capacity: {floor.capacity} • Current Occupancy: {floor.occupancy} (
                        {floor.capacity > 0 ? Math.round((floor.occupancy / floor.capacity) * 100) : 0}%)
                      </CardDescription>
                    </div>
                    {editMode && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Layers className="mr-2 h-4 w-4" />
                          Layers
                        </Button>
                        <Button variant="outline" size="sm">
                          <Grid className="mr-2 h-4 w-4" />
                          Add Area
                        </Button>
                        <Button variant="outline" size="sm">
                          <Square className="mr-2 h-4 w-4" />
                          Add Desk
                        </Button>
                        <Button variant="outline" size="sm">
                          <Type className="mr-2 h-4 w-4" />
                          Add Label
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="relative border rounded-md bg-gray-50"
                    style={{
                      height: "500px",
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: "top left",
                    }}
                  >
                    {/* This would be replaced with an actual interactive floor plan component */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-muted-foreground">
                        {floor.id === "basement" ? (
                          "Basement floor plan not configured yet"
                        ) : (
                          "Interactive floor plan would be displayed here"
                        )}
                      </p>
                    </div>
                    {/* Sample visualization elements - these would be positioned correctly in a real implementation */}
                    {floor.id !== "basement" && (
                      <>
                        <div className="absolute top-10 left-10 w-40 h-24 border border-blue-500 bg-blue-100 rounded-md flex items-center justify-center">
                          Open Workspace
                        </div>
                        <div className="absolute top-10 right-10 w-24 h-24 border border-purple-500 bg-purple-100 rounded-md flex items-center justify-center">
                          Meeting Room A
                        </div>
                        <div className="absolute bottom-10 left-10 w-32 h-20 border border-yellow-500 bg-yellow-100 rounded-md flex items-center justify-center">
                          Kitchen
                        </div>
                        <div className="absolute bottom-10 right-10 w-24 h-16 border border-green-500 bg-green-100 rounded-md flex items-center justify-center">
                          Phone Booth
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs">Workspace</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                      <span className="text-xs">Meeting Room</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="text-xs">Common Area</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-xs">Phone Booth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-xs">Private Office</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Import
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              
              {/* Areas List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Areas & Rooms</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Area
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Area</DialogTitle>
                          <DialogDescription>Create a new area or room in your floor plan.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="area-name" className="text-right">Name</Label>
                            <Input id="area-name" placeholder="e.g., Meeting Room C" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="area-type" className="text-right">Type</Label>
                            <Select>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select area type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="workspace">Workspace</SelectItem>
                                <SelectItem value="meeting">Meeting Room</SelectItem>
                                <SelectItem value="phone">Phone Booth</SelectItem>
                                <SelectItem value="common">Common Area</SelectItem>
                                <SelectItem value="office">Private Office</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="area-capacity" className="text-right">Capacity</Label>
                            <Input id="area-capacity" type="number" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="area-floor" className="text-right">Floor</Label>
                            <Select defaultValue={activeTab}>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select floor" />
                              </SelectTrigger>
                              <SelectContent>
                                {safeFloors.filter((floor: Floor) => Boolean(floor)).map((floor: Floor) => (
                                  <SelectItem key={floor.id} value={floor.id}>{floor.name || `Floor ${floor.id}`}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button>Add Area</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredAreas.length > 0 ? (
                      filteredAreas.map((area) => (
                        <div key={area.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{area.name}</p>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getAreaTypeColor(area.type)}`}>
                                {getAreaTypeLabel(area.type)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Capacity: {area.capacity} • Occupancy: {area.occupancy} (
                              {Math.round((area.occupancy / area.capacity) * 100)}%)
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                        <p className="text-muted-foreground">No areas configured for this floor</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Desks List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Desks & Workstations</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Desk
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Desk</DialogTitle>
                          <DialogDescription>Create a new desk or workstation in your floor plan.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="desk-id" className="text-right">Desk ID</Label>
                            <Input id="desk-id" placeholder="e.g., A6" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="desk-type" className="text-right">Type</Label>
                            <Select>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select desk type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hot-desk">Hot Desk</SelectItem>
                                <SelectItem value="dedicated">Dedicated Desk</SelectItem>
                                <SelectItem value="standing">Standing Desk</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="desk-area" className="text-right">Area</Label>
                            <Select>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select area" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredAreas.filter(area => area).map((area) => (
                                  <SelectItem key={area.id} value={area.id.toString()}>{area.name || `Area ${area.id}`}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="desk-status" className="text-right">Status</Label>
                            <Select defaultValue="available">
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="occupied">Occupied</SelectItem>
                                <SelectItem value="reserved">Reserved</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button>Add Desk</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredDesks.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredDesks.map((desk) => (
                          <div key={desk.id} className="rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-medium">
                                  {desk.id}
                                </div>
                                <div>
                                  <p className="font-medium">{getDeskTypeLabel(desk.type)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {safeAccess.areas.find((a: any) => a?.id === desk?.area)?.name || 'Unknown Area'}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDeskStatusColor(desk.status)}`}>
                                {desk.status}
                              </span>
                            </div>
                            {desk.member && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Assigned to:</span> {desk.member}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                        <p className="text-muted-foreground">No desks configured for this floor</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}