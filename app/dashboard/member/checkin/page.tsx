"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import { QrCode, Scan, Clock, MapPin, CheckCircle, AlertCircle, Wifi, Coffee, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface CheckInSession {
  id: string
  location: string
  checkInTime: string
  checkOutTime?: string
  duration?: string
  amenitiesUsed: string[]
}

interface Location {
  id: string
  name: string
  description: string
  status: "active" | "inactive"
  capacity: number
  currentOccupancy: number
}

export default function MemberCheckInPage() {
  const [activeTab, setActiveTab] = useState("checkin")
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [currentSession, setCurrentSession] = useState<CheckInSession | null>(null)
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [scanResult, setScanResult] = useState<string | null>(null)

  // Mock locations for check-in
  const locations: Location[] = [
    {
      id: "main-entrance",
      name: "Main Entrance",
      description: "Primary entrance with reception",
      status: "active",
      capacity: 100,
      currentOccupancy: 67
    },
    {
      id: "side-entrance",
      name: "Side Entrance",
      description: "Side entrance near parking",
      status: "active",
      capacity: 50,
      currentOccupancy: 23
    },
    {
      id: "back-entrance",
      name: "Back Entrance",
      description: "Back entrance near coffee shop",
      status: "active",
      capacity: 30,
      currentOccupancy: 12
    }
  ]

  // Mock check-in history
  const [checkInHistory, setCheckInHistory] = useState<CheckInSession[]>([
    {
      id: "1",
      location: "Main Entrance",
      checkInTime: "2024-01-26T09:15:00",
      checkOutTime: "2024-01-26T17:30:00",
      duration: "8h 15m",
      amenitiesUsed: ["WiFi", "Coffee", "Meeting Room B"]
    },
    {
      id: "2",
      location: "Side Entrance",
      checkInTime: "2024-01-25T10:30:00",
      checkOutTime: "2024-01-25T16:45:00",
      duration: "6h 15m",
      amenitiesUsed: ["WiFi", "Desk A-12"]
    },
    {
      id: "3",
      location: "Main Entrance",
      checkInTime: "2024-01-24T08:45:00",
      checkOutTime: "2024-01-24T18:00:00",
      duration: "9h 15m",
      amenitiesUsed: ["WiFi", "Phone Booth 3", "Printer"]
    }
  ])

  // Generate QR code for check-in
  const generateCheckInQr = (location: Location) => {
    const qrData = {
      type: "member_checkin",
      locationId: location.id,
      locationName: location.name,
      timestamp: new Date().toISOString(),
      memberId: "current_member", // In real app, this would be from auth
      token: Math.random().toString(36).substring(2, 15) // Mock token
    }
    return JSON.stringify(qrData)
  }

  // Simulate QR code scan
  const handleQrScan = (location: Location) => {
    const qrData = generateCheckInQr(location)
    setScanResult(qrData)
    setSelectedLocation(location)
    setShowQrDialog(true)
  }

  // Handle check-in
  const handleCheckIn = (location: Location) => {
    const newSession: CheckInSession = {
      id: Date.now().toString(),
      location: location.name,
      checkInTime: new Date().toISOString(),
      amenitiesUsed: []
    }
    setCurrentSession(newSession)
    setIsCheckedIn(true)
    setShowQrDialog(false)
  }

  // Handle check-out
  const handleCheckOut = () => {
    if (currentSession) {
      const checkOutTime = new Date().toISOString()
      const duration = calculateDuration(currentSession.checkInTime, checkOutTime)
      const completedSession = {
        ...currentSession,
        checkOutTime,
        duration,
        amenitiesUsed: ["WiFi", "Coffee"] // Mock amenities
      }
      setCheckInHistory(prev => [completedSession, ...prev])
      setCurrentSession(null)
      setIsCheckedIn(false)
    }
  }

  // Calculate duration between check-in and check-out
  const calculateDuration = (startTime: string, endTime: string): string => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  // Format date/time for display
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get current time
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const [currentTime, setCurrentTime] = useState(getCurrentTime())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <DashboardLayout userRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check-In</h1>
          <p className="text-muted-foreground">Check in to the workspace and track your visit.</p>
        </div>

        {/* Current Status Card */}
        <Card className={isCheckedIn ? "border-green-500" : "border-blue-500"}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Status</span>
              <Badge variant={isCheckedIn ? "default" : "secondary"}>
                {isCheckedIn ? "Checked In" : "Not Checked In"}
              </Badge>
            </CardTitle>
            <CardDescription>
              {isCheckedIn 
                ? `You checked in at ${formatDateTime(currentSession?.checkInTime || '')}` 
                : "Scan a QR code to check in to the workspace"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCheckedIn && currentSession ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Location: {currentSession.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Current time: {currentTime}</span>
                </div>
                <Button 
                  onClick={handleCheckOut} 
                  variant="destructive" 
                  className="w-full"
                >
                  Check Out
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Select a location below and scan the QR code to check in
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checkin">Check-In Locations</TabsTrigger>
            <TabsTrigger value="history">Check-In History</TabsTrigger>
          </TabsList>

          <TabsContent value="checkin" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => (
                <Card key={location.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                    <CardDescription>{location.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Capacity</span>
                        <Badge variant={location.currentOccupancy >= location.capacity ? "destructive" : "default"}>
                          {location.currentOccupancy}/{location.capacity}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={location.status === "active" ? "default" : "secondary"}>
                          {location.status}
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => handleQrScan(location)}
                        className="w-full"
                        disabled={location.status !== "active" || isCheckedIn}
                      >
                        <Scan className="h-4 w-4 mr-2" />
                        Scan QR Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {checkInHistory.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No check-in history</h3>
                  <p className="text-muted-foreground text-center">
                    Your check-in history will appear here after you check out.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {checkInHistory.map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{session.location}</span>
                        <Badge variant="outline">Completed</Badge>
                      </CardTitle>
                      <CardDescription>
                        {formatDateTime(session.checkInTime)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Duration: {session.duration}
                        </div>
                        {session.checkOutTime && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Checked out: {formatDateTime(session.checkOutTime)}
                          </div>
                        )}
                        {session.amenitiesUsed && session.amenitiesUsed.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex gap-1">
                              {session.amenitiesUsed.map((amenity, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* QR Code Dialog */}
        <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogDescription>
                Scan this QR code to check in at {selectedLocation?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="bg-white p-4 border rounded-lg">
                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                  <QrCode className="h-32 w-32 text-gray-600" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  QR Code for {selectedLocation?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  This QR code is valid for 5 minutes
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    if (selectedLocation) handleCheckIn(selectedLocation)
                  }}
                  className="w-full"
                >
                  Check In Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowQrDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}