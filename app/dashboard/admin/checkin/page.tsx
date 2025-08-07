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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Scan, Users, Clock, MapPin, Search, Download } from "lucide-react"
// Import file-saver using a type-safe dynamic import
let saveAs: (data: Blob | string, filename?: string) => void;
if (typeof window !== 'undefined') {
  import('file-saver').then(module => {
    saveAs = module.saveAs;
  });
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
function CheckInContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Mock data state - in a real app, this would come from an API
  const [activeCheckIns, setActiveCheckIns] = useState<Array<{
    id: string;
    name: string;
    type: 'member' | 'guest';
    checkInTime: string;
    duration: string;
    status: 'active' | 'expired' | 'extended';
  }>>([]);
  const [checkInLogs, setCheckInLogs] = useState<Array<{
    id: string;
    name: string;
    type: 'member' | 'guest';
    checkInTime: string;
    checkOutTime: string;
    duration: string;
  }>>([]);
  // Search query for active check-ins
  const [searchQuery, setSearchQuery] = useState('');
  // Load data on component mount
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setIsLoading(true);
        // Simulate API calls
        await Promise.all([
          // Simulate loading active check-ins
          new Promise(resolve => setTimeout(resolve, 500)).then(() => {
            setActiveCheckIns([
              {
                id: '1',
                name: 'John Doe',
                type: 'member',
                checkInTime: new Date().toISOString(),
                duration: '4h 30m',
                status: 'active',
              },
              {
                id: '2',
                name: 'Jane Smith',
                type: 'guest',
                checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                duration: '2h 15m',
                status: 'active',
              },
            ]);
          }),
          // Simulate loading check-in logs
          new Promise(resolve => setTimeout(resolve, 700)).then(() => {
            setCheckInLogs([
              {
                id: '101',
                name: 'Mike Johnson',
                type: 'member',
                checkInTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                checkOutTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
                duration: '1h 0m',
              },
              {
                id: '102',
                name: 'Sarah Williams',
                type: 'guest',
                checkInTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                checkOutTime: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
                duration: '1h 30m',
              },
            ]);
          }),
        ]);
        setError(null);
      } catch (err) {
        console.error('Error initializing check-in data:', err);
        setError('Failed to load check-in data. Please try again later.');
      } finally {
        setIsLoading(false);
        setIsMounted(true);
      }
    };
    initializeComponent();
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, []);
  // Define types for our data
  type CheckInLog = {
    id: number;
    member: string;
    time: string;
    location: string;
    status: 'checked-in' | 'checked-out';
    duration: string;
  };
  type CurrentlyInsideMember = {
    id: number;
    member: string;
    checkInTime: string;
    location: string;
    duration: string;
  };
  // Today's statistics
  const todayStats = {
    totalCheckIns: 89,
    currentlyInside: 67,
    peakTime: "2:30 PM",
    averageStay: "4.2 hours",
  };
  // Mock data for recent check-ins
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInLog[]>([]);
  // Mock data for currently inside members
  const [currentlyInside, setCurrentlyInside] = useState<CurrentlyInsideMember[]>([]);
  // Search term state
  const [searchTerm, setSearchTerm] = useState("");
  // Active tab state
  const [activeTab, setActiveTab] = useState("overview");
  // View log state
  const [viewLog, setViewLog] = useState<CheckInLog | null>(null);
  // Show loading state until component is mounted and data is loaded
  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  // Show error state if data loading failed
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
  const [qrLocations, setQrLocations] = useState([
    {
      id: 1,
      name: "Main Entrance",
      status: "active",
      description: "Primary entry point for members",
    },
    {
      id: 2,
      name: "Side Entrance",
      status: "inactive",
      description: "Secondary entry point",
    },
  ])
  // For editing QR location
  const [editQrDialogId, setEditQrDialogId] = useState<number | null>(null)
  const [editQrLocation, setEditQrLocation] = useState<any>(null)
  // For adding new QR location
  const [addQrDialogOpen, setAddQrDialogOpen] = useState(false)
  const [newQrLocation, setNewQrLocation] = useState({ name: "", description: "" })
  // For viewing log details (Dialog)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "checked-in":
        return "default"
      case "checked-out":
        return "secondary"
      default:
        return "secondary"
    }
  }
  // Generate QR code data (in a real app, this would be a proper QR code)
  const qrCodeData = `https://omnispace.app/checkin?location=main&timestamp=${Date.now()}`
  // --- Button Handlers ---
  // Download PNG (simulate)
  const handleDownloadPng = () => {
    const blob = new Blob([`QR PNG for: ${qrCodeData}`], { type: "image/png" })
    saveAs(blob, "main-entrance-qr.png")
  }
  // Download PDF (simulate)
  const handleDownloadPdf = () => {
    const blob = new Blob([`QR PDF for: ${qrCodeData}`], { type: "application/pdf" })
    saveAs(blob, "main-entrance-qr.pdf")
  }
  // Edit QR Location
  const handleEditQrLocation = (id: number) => {
    setQrLocations(locs =>
      locs.map(loc =>
        loc.id === id ? { ...loc, ...editQrLocation } : loc
      )
    )
    setEditQrDialogId(null)
    setEditQrLocation(null)
  }
  // Activate/Deactivate QR Location
  const handleToggleQrLocation = (id: number) => {
    setQrLocations(locs =>
      locs.map(loc =>
        loc.id === id
          ? { ...loc, status: loc.status === "active" ? "inactive" : "active" }
          : loc
      )
    )
  }
  // Generate New QR for location (simulate)
  const handleGenerateNewQr = (id: number) => {
    alert(`New QR code generated for location ID ${id}`)
  }
  // Add new QR location
  const handleAddQrLocation = () => {
    setQrLocations([
      ...qrLocations,
      {
        id: qrLocations.length + 1,
        name: newQrLocation.name,
        status: "inactive",
        description: newQrLocation.description,
      },
    ])
    setNewQrLocation({ name: "", description: "" })
    setAddQrDialogOpen(false)
  }
  // Export logs as CSV
  const handleExportLogs = () => {
    const csv = "Member,Time,Location,Status,Duration\n" +
      recentCheckIns.concat(recentCheckIns).map(log =>
        `${log.member},${log.time},${log.location},${log.status},${log.duration}`
      ).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    saveAs(blob, "checkin-logs.csv")
  }
  // View log details (open dialog instead of alert)
  const handleViewLogDetails = (log: any) => {
    setViewLog(log);
  };
  // Filtered logs based on search
  const filteredLogs = recentCheckIns
    .concat(recentCheckIns)
    .filter(
      (log) =>
        log.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  return (
    <DynamicDashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check-In Management</h1>
          <p className="text-muted-foreground">Monitor member check-ins and manage access control</p>
        </div>
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
              <Scan className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.totalCheckIns}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Inside</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.currentlyInside}</div>
              <p className="text-xs text-muted-foreground">Real-time occupancy</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.peakTime}</div>
              <p className="text-xs text-muted-foreground">Busiest hour today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Stay</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.averageStay}</div>
              <p className="text-xs text-muted-foreground">Per member today</p>
            </CardContent>
          </Card>
        </div>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="qr-codes">QR Codes</TabsTrigger>
            <TabsTrigger value="logs">Check-in Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Check-ins */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Check-ins</CardTitle>
                  <CardDescription>Latest member activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentCheckIns.map((checkIn) => (
                      <div key={checkIn.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{checkIn.member}</p>
                            <Badge variant={getStatusColor(checkIn.status)}>{checkIn.status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {checkIn.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {checkIn.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{checkIn.duration}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Currently Inside */}
              <Card>
                <CardHeader>
                  <CardTitle>Currently Inside</CardTitle>
                  <CardDescription>Members currently in the space</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentlyInside.map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{member.member}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Since {member.checkInTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {member.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">{member.duration}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="qr-codes" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* QR Code Generator */}
              <Card>
                <CardHeader>
                  <CardTitle>Generate QR Codes</CardTitle>
                  <CardDescription>Create QR codes for different entry points</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center p-8 border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 bg-black mx-auto flex items-center justify-center">
                        <QrCode className="h-24 w-24 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Main Entrance QR Code</p>
                        <p className="text-sm text-muted-foreground">Scan to check in</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleDownloadPng}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PNG
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={handleDownloadPdf}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {/* QR Code Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>QR Code Settings</CardTitle>
                  <CardDescription>Configure check-in locations and settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {qrLocations.map((loc) => (
                      <div key={loc.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{loc.name}</h4>
                          <Badge variant={loc.status === "active" ? "default" : "secondary"}>
                            {loc.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{loc.description}</p>
                        <div className="flex gap-2">
                          {/* Edit QR Location */}
                          <Dialog
                            open={editQrDialogId === loc.id}
                            onOpenChange={open => {
                              setEditQrDialogId(open ? loc.id : null)
                              setEditQrLocation(open ? { ...loc } : null)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => {
                                setEditQrDialogId(loc.id)
                                setEditQrLocation({ ...loc })
                              }}>
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px]">
                              <DialogHeader>
                                <DialogTitle>Edit QR Location</DialogTitle>
                                <DialogDescription>
                                  Edit details for <b>{loc.name}</b>.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label htmlFor="edit-qr-name" className="text-right">Name</label>
                                  <Input
                                    id="edit-qr-name"
                                    className="col-span-3"
                                    value={editQrLocation?.name || ""}
                                    onChange={e => setEditQrLocation((prev: any) => ({ ...prev, name: e.target.value }))}
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label htmlFor="edit-qr-desc" className="text-right">Description</label>
                                  <Input
                                    id="edit-qr-desc"
                                    className="col-span-3"
                                    value={editQrLocation?.description || ""}
                                    onChange={e => setEditQrLocation((prev: any) => ({ ...prev, description: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditQrDialogId(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={() => handleEditQrLocation(loc.id)}>
                                  Save Changes
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {/* Generate New QR */}
                          <Button variant="outline" size="sm" onClick={() => handleGenerateNewQr(loc.id)}>
                            Generate New
                          </Button>
                          {/* Activate/Deactivate */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleQrLocation(loc.id)}
                          >
                            {loc.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Add New Location */}
                  <Dialog open={addQrDialogOpen} onOpenChange={setAddQrDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => setAddQrDialogOpen(true)}>
                        Add New Location
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                      <DialogHeader>
                        <DialogTitle>Add New QR Location</DialogTitle>
                        <DialogDescription>
                          Add a new check-in location.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="new-qr-name" className="text-right">Name</label>
                          <Input
                            id="new-qr-name"
                            className="col-span-3"
                            value={newQrLocation.name}
                            onChange={e => setNewQrLocation({ ...newQrLocation, name: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="new-qr-desc" className="text-right">Description</label>
                          <Input
                            id="new-qr-desc"
                            className="col-span-3"
                            value={newQrLocation.description}
                            onChange={e => setNewQrLocation({ ...newQrLocation, description: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setAddQrDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddQrLocation}>
                          Add Location
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Check-in Logs</CardTitle>
                    <CardDescription>
                      Complete history of member check-ins and check-outs
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search logs..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" onClick={handleExportLogs}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLogs.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No logs found.
                    </div>
                  )}
                  {filteredLogs.map((log, index) => (
                    <div
                      key={`${log.id}-${index}`}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{log.member}</p>
                          <Badge variant={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {log.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {log.location}
                          </div>
                          <span>Duration: {log.duration}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewLogDetails(log)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Log Details Dialog */}
            <Dialog open={!!viewLog} onOpenChange={(open) => !open && setViewLog(null)}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Check-in Details</DialogTitle>
                  <DialogDescription>
                    Details for {viewLog?.member}
                  </DialogDescription>
                </DialogHeader>
                {viewLog && (
                  <div className="space-y-2 py-2">
                    <div>
                      <span className="font-medium">Member:</span> {viewLog.member}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {viewLog.time}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {viewLog.location}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <Badge variant={getStatusColor(viewLog.status)}>{viewLog.status}</Badge>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {viewLog.duration}
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setViewLog(null)}>
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </DynamicDashboardLayout>
  )
}
// Main page component with client-side only rendering
export default function CheckInPage() {
  return <CheckInContent />
}
