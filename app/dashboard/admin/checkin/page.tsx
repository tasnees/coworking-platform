"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import { QrCode, Scan, Users, Clock, MapPin, Search, Download } from "lucide-react"
import { saveAs } from "file-saver"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CheckInPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Add search state for logs
  const [searchTerm, setSearchTerm] = useState("");

  const todayStats = {
    totalCheckIns: 89,
    currentlyInside: 67,
    peakTime: "2:30 PM",
    averageStay: "4.2 hours",
  }

  const recentCheckIns = [
    {
      id: 1,
      member: "John Doe",
      time: "09:15 AM",
      location: "Main Entrance",
      status: "checked-in",
      duration: "3h 45m",
    },
    {
      id: 2,
      member: "Jane Smith",
      time: "10:30 AM",
      location: "Side Entrance",
      status: "checked-in",
      duration: "2h 30m",
    },
    {
      id: 3,
      member: "Mike Johnson",
      time: "08:45 AM",
      location: "Main Entrance",
      status: "checked-out",
      duration: "4h 15m",
    },
    {
      id: 4,
      member: "Sarah Wilson",
      time: "11:00 AM",
      location: "Main Entrance",
      status: "checked-in",
      duration: "1h 00m",
    },
  ]

  const currentlyInside = [
    { id: 1, member: "John Doe", checkInTime: "09:15 AM", location: "Hot Desk Area", duration: "3h 45m" },
    { id: 2, member: "Jane Smith", checkInTime: "10:30 AM", location: "Meeting Room B", duration: "2h 30m" },
    { id: 3, member: "Sarah Wilson", checkInTime: "11:00 AM", location: "Private Office 3", duration: "1h 00m" },
    { id: 4, member: "Alex Brown", checkInTime: "08:30 AM", location: "Hot Desk Area", duration: "4h 30m" },
  ]

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
  const [viewLog, setViewLog] = useState<any | null>(null);

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
    <DashboardLayout userRole="admin">
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
    </DashboardLayout>
  )
}
