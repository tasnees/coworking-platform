"use client";

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import DashboardLayout from "@/components/dashboard-layout"
import { ZoomIn, ZoomOut, Maximize, Users, Square, Grid } from "lucide-react"
export default function FloorPlanPage() {
  const [activeTab, setActiveTab] = useState("main")
  const [zoomLevel, setZoomLevel] = useState(100)
  const floors = [
    { id: "main", name: "Main Floor", capacity: 80, occupancy: 52 },
    { id: "second", name: "Second Floor", capacity: 40, occupancy: 26 },
    { id: "basement", name: "Basement", capacity: 0, occupancy: 0 },
  ]
  const areas = [
    { id: 1, name: "Open Workspace", type: "workspace", capacity: 40, occupancy: 28, floor: "main" },
    { id: 2, name: "Meeting Room A", type: "meeting", capacity: 8, occupancy: 6, floor: "main" },
    { id: 3, name: "Meeting Room B", type: "meeting", capacity: 6, occupancy: 0, floor: "main" },
    { id: 4, name: "Phone Booth 1", type: "phone", capacity: 1, occupancy: 1, floor: "main" },
    { id: 5, name: "Phone Booth 2", type: "phone", capacity: 1, occupancy: 0, floor: "main" },
    { id: 6, name: "Kitchen", type: "common", capacity: 10, occupancy: 4, floor: "main" },
    { id: 7, name: "Lounge", type: "common", capacity: 14, occupancy: 8, floor: "main" },
    { id: 8, name: "Private Office 1", type: "office", capacity: 4, occupancy: 3, floor: "second" },
    { id: 9, name: "Private Office 2", type: "office", capacity: 4, occupancy: 4, floor: "second" },
    { id: 10, name: "Private Office 3", type: "office", capacity: 4, occupancy: 2, floor: "second" },
    { id: 11, name: "Conference Room", type: "meeting", capacity: 12, occupancy: 8, floor: "second" },
    { id: 12, name: "Quiet Zone", type: "workspace", capacity: 16, occupancy: 9, floor: "second" },
  ]
  const desks = [
    { id: "A1", type: "hot-desk", status: "occupied", member: "John Doe", area: 1, floor: "main" },
    { id: "A2", type: "hot-desk", status: "occupied", member: "Jane Smith", area: 1, floor: "main" },
    { id: "A3", type: "hot-desk", status: "available", member: null, area: 1, floor: "main" },
    { id: "A4", type: "hot-desk", status: "available", member: null, area: 1, floor: "main" },
    { id: "A5", type: "hot-desk", status: "occupied", member: "Mike Johnson", area: 1, floor: "main" },
    { id: "B1", type: "dedicated", status: "occupied", member: "Sarah Wilson", area: 1, floor: "main" },
    { id: "B2", type: "dedicated", status: "occupied", member: "Robert Brown", area: 1, floor: "main" },
    { id: "B3", type: "dedicated", status: "occupied", member: "Emily Davis", area: 1, floor: "main" },
    { id: "B4", type: "dedicated", status: "available", member: null, area: 1, floor: "main" },
    { id: "C1", type: "standing", status: "occupied", member: "David Lee", area: 1, floor: "main" },
    { id: "C2", type: "standing", status: "available", member: null, area: 1, floor: "main" },
    { id: "D1", type: "hot-desk", status: "occupied", member: "Lisa Chen", area: 12, floor: "second" },
    { id: "D2", type: "hot-desk", status: "occupied", member: "Tom Wilson", area: 12, floor: "second" },
    { id: "D3", type: "hot-desk", status: "available", member: null, area: 12, floor: "second" },
    { id: "D4", type: "dedicated", status: "occupied", member: "Karen White", area: 12, floor: "second" },
    { id: "D5", type: "dedicated", status: "occupied", member: "James Taylor", area: 12, floor: "second" },
  ]
  const filteredAreas = areas.filter(area => area.floor === activeTab)
  const filteredDesks = desks.filter(desk => desk.floor === activeTab)
  const currentFloor = floors.find(floor => floor.id === activeTab)
  return (
    <DashboardLayout userRole="member">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Floor Plan</h1>
          <p className="text-muted-foreground">View your coworking space layout and desk availability</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              {floors.map((floor) => (
                <TabsTrigger key={floor.id} value={floor.id}>
                  {floor.name}
                </TabsTrigger>
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
              <Card>
                <CardHeader>
                  <CardTitle>{floor.name}</CardTitle>
                  <CardDescription>
                    Capacity: {floor.capacity} • Current Occupancy: {floor.occupancy}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="relative border rounded-md bg-gray-50"
                    style={{
                      height: "400px",
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-muted-foreground">
                        {floor.id === "basement"
                          ? "Basement floor plan not configured yet"
                          : "Interactive floor plan would be displayed here"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Areas & Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredAreas.length > 0 ? (
                      filteredAreas.map((area) => (
                        <div key={area.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <p className="font-medium">{area.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Capacity: {area.capacity} • Occupancy: {area.occupancy}
                            </p>
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
              <Card>
                <CardHeader>
                  <CardTitle>Desks & Workstations</CardTitle>
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
                                  <p className="font-medium">{desk.type}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {areas.find((a) => a.id === desk.area)?.name}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                desk.status === "available"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
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
