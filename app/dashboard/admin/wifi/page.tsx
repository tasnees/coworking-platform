"use client"
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
// Import UI components
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
import { Wifi, WifiOff, RefreshCw, Copy, Users, Activity, Shield, AlertTriangle, Download, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
// Dynamically import the dashboard layout with SSR disabled
const DashboardLayout = dynamic(
  () => import('@/components/dashboard-layout'),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    ) 
  }
);
// Main page component
export default function WifiSettingsPage() {
  const [activeTab, setActiveTab] = useState("networks")
  const [showPassword, setShowPassword] = useState(false)
  const [showGuestPassword, setShowGuestPassword] = useState(false)
  const [newNetwork, setNewNetwork] = useState({
    name: '',
    type: '',
    password: '',
    bandwidth: '',
    active: true
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [guestSettings, setGuestSettings] = useState({
    selectedNetwork: "OmniSpace-Guest",
    password: "guest2025",
    autoRotatePassword: false,
    enableCaptivePortal: true,
    enableTimeLimit: true,
    timeLimitHours: 2,
    showPassword: false
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false)
  const [newAccessCode, setNewAccessCode] = useState({
    type: 'day',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default: 1 week from now
    usageLimit: 1,
    network: 'guest',
    code: ''
  })
  const [accessCodes, setAccessCodes] = useState([
    { id: 1, code: 'GUEST-1234', type: 'Day Pass', expiresAt: '2025-07-24', usageLimit: 1, usageCount: 0 },
    { id: 2, code: 'EVENT-5678', type: 'Event', expiresAt: '2025-07-30', usageLimit: 50, usageCount: 12 },
    { id: 3, code: 'TRIAL-9012', type: 'Trial', expiresAt: '2025-08-15', usageLimit: 5, usageCount: 2 },
  ])
  const [wifiNetworks, setWifiNetworks] = useState([
    {
      id: 1,
      name: "OmniSpace-Main",
      status: "active",
      type: "main",
      password: "omni$pace2025",
      bandwidth: "200 Mbps",
      connectedDevices: 42,
      usagePercent: 68,
    },
    {
      id: 2,
      name: "OmniSpace-Guest",
      status: "active",
      type: "guest",
      password: "guest2025",
      bandwidth: "50 Mbps",
      connectedDevices: 15,
      usagePercent: 32,
    },
    {
      id: 3,
      name: "OmniSpace-Staff",
      status: "active",
      type: "staff",
      password: "staff@omni2025",
      bandwidth: "100 Mbps",
      connectedDevices: 5,
      usagePercent: 12,
    },
    {
      id: 4,
      name: "OmniSpace-Events",
      status: "inactive",
      type: "events",
      password: "events2025",
      bandwidth: "100 Mbps",
      connectedDevices: 0,
      usagePercent: 0,
    },
  ])
  const membershipTypes = [
    { id: 1, name: "Day Pass", accessType: "Guest Network", timeLimit: "12 hours", deviceLimit: 1 },
    { id: 2, name: "Weekly Flex", accessType: "Main Network", timeLimit: "During operating hours", deviceLimit: 2 },
    { id: 3, name: "Monthly Pro", accessType: "Main Network", timeLimit: "24/7", deviceLimit: 3 },
    { id: 4, name: "Enterprise", accessType: "Main Network", timeLimit: "24/7", deviceLimit: 10 },
  ]
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "issue":
        return "destructive"
      default:
        return "secondary"
    }
  }
  const handleCreateNetwork = () => {
    // Basic validation
    if (!newNetwork.name || !newNetwork.type || !newNetwork.password || !newNetwork.bandwidth) {
      alert('Please fill in all required fields');
      return;
    }

    // Create new network object
    const newId = wifiNetworks.length > 0 ? Math.max(...wifiNetworks.map(n => n.id)) + 1 : 1;
    const networkToAdd = {
      id: newId,
      name: newNetwork.name,
      status: newNetwork.active ? 'active' : 'inactive',
      type: newNetwork.type,
      password: newNetwork.password,
      bandwidth: newNetwork.bandwidth,
      connectedDevices: 0,
      usagePercent: 0,
    };

    // In a real app, you would make an API call here to save the network
    console.log('Creating new network:', networkToAdd);
    
    // Show success message
    alert(`Network "${newNetwork.name}" created successfully!`);
    
    // Reset form and close dialog
    setNewNetwork({
      name: '',
      type: '',
      password: '',
      bandwidth: '',
      active: true
    });
    setIsDialogOpen(false);
    
    // Update the state with the new network
    setWifiNetworks([...wifiNetworks, networkToAdd]);
  };

  const getNetworkTypeColor = (type: string) => {
    switch (type) {
      case "main":
        return "default"
      case "guest":
        return "secondary"
      case "staff":
        return "outline"
      case "events":
        return "secondary"
      default:
        return "secondary"
    }
  }
  // Client-side only rendering
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">WiFi Settings</h1>
            <p className="text-muted-foreground">Manage WiFi networks and access for your coworking space</p>
          </div>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
        </div>
        {/* Status Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>WiFi Status</CardTitle>
            <CardDescription>Current network status and connectivity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 p-3">
                  <Wifi className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Networks Online</h3>
                  <p className="text-muted-foreground">3 of 4 networks active</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Connected Devices</h3>
                  <p className="text-muted-foreground">62 devices connected</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-100 p-3">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Bandwidth Usage</h3>
                  <p className="text-muted-foreground">128 Mbps / 200 Mbps</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="networks">Networks</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="codes">Access Codes</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          {/* Networks Tab */}
          <TabsContent value="networks" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>WiFi Networks</CardTitle>
                  <CardDescription>Manage your coworking space WiFi networks</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsDialogOpen(true)}>Add Network</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add WiFi Network</DialogTitle>
                      <DialogDescription>Create a new WiFi network for your coworking space.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="network-name" className="text-right">
                          Network Name
                        </Label>
                        <Input 
                          id="network-name" 
                          placeholder="e.g., OmniSpace-Premium" 
                          className="col-span-3" 
                          value={newNetwork.name}
                          onChange={(e) => setNewNetwork({...newNetwork, name: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="network-type" className="text-right">
                          Type
                        </Label>
                        <Select 
                          value={newNetwork.type}
                          onValueChange={(value) => setNewNetwork({...newNetwork, type: value})}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select network type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">Main</SelectItem>
                            <SelectItem value="guest">Guest</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="events">Events</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                          Password
                        </Label>
                        <Input 
                          id="password" 
                          type="password" 
                          className="col-span-3" 
                          value={newNetwork.password}
                          onChange={(e) => setNewNetwork({...newNetwork, password: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bandwidth" className="text-right">
                          Bandwidth
                        </Label>
                        <Input 
                          id="bandwidth" 
                          placeholder="e.g., 100 Mbps" 
                          className="col-span-3" 
                          value={newNetwork.bandwidth}
                          onChange={(e) => setNewNetwork({...newNetwork, bandwidth: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="active" className="text-right">
                          Active
                        </Label>
                        <Switch 
                          id="active" 
                          className="col-span-3" 
                          checked={newNetwork.active}
                          onCheckedChange={(checked) => setNewNetwork({...newNetwork, active: checked})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setNewNetwork({
                            name: '',
                            type: '',
                            password: '',
                            bandwidth: '',
                            active: true
                          });
                          setIsDialogOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateNetwork}>Create Network</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wifiNetworks.map((network) => (
                    <Card key={network.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/20 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{network.name}</CardTitle>
                            <Badge variant={getStatusColor(network.status)}>
                              {network.status === "active" ? "Online" : "Offline"}
                            </Badge>
                            <Badge variant={getNetworkTypeColor(network.type)}>{network.type}</Badge>
                          </div>
                          <Switch checked={network.status === "active"} />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Password:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">
                                  {showPassword && network.id === 1 ? network.password : "••••••••••"}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => network.id === 1 && setShowPassword(!showPassword)}
                                >
                                  {showPassword && network.id === 1 ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                  ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Bandwidth:</span>
                              <span>{network.bandwidth}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Connected Devices:</span>
                              <span>{network.connectedDevices}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Usage:</span>
                              <span>{network.usagePercent}%</span>
                            </div>
                            <Progress value={network.usagePercent} className="h-2" />
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                View Devices
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Access Control Tab */}
          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Membership WiFi Access</CardTitle>
                <CardDescription>Configure WiFi access for different membership types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {membershipTypes.map((membership) => (
                    <div key={membership.id} className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-4 md:items-center">
                      <div className="font-medium">{membership.name}</div>
                      <div>
                        <Select defaultValue={membership.accessType === "Main Network" ? "main" : "guest"}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">Main Network</SelectItem>
                            <SelectItem value="guest">Guest Network</SelectItem>
                            <SelectItem value="staff">Staff Network</SelectItem>
                            <SelectItem value="events">Events Network</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Select defaultValue={membership.timeLimit === "24/7" ? "24/7" : membership.timeLimit === "During operating hours" ? "operating" : "limited"}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time limit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="limited">Limited (12 hours)</SelectItem>
                            <SelectItem value="operating">During operating hours</SelectItem>
                            <SelectItem value="24/7">24/7 access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-4">
                        <Label htmlFor={`devices-${membership.id}`} className="w-32">
                          Device Limit:
                        </Label>
                        <Input
                          id={`devices-${membership.id}`}
                          type="number"
                          defaultValue={membership.deviceLimit}
                          className="w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Guest WiFi Settings</CardTitle>
                <CardDescription>Configure settings for guest WiFi access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="guest-network">Guest Network</Label>
                      <Select 
                        value={guestSettings.selectedNetwork}
                        onValueChange={(value) => setGuestSettings({...guestSettings, selectedNetwork: value})}
                      >
                        <SelectTrigger id="guest-network">
                          <SelectValue placeholder="Select guest network" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OmniSpace-Guest">OmniSpace-Guest</SelectItem>
                          <SelectItem value="OmniSpace-Events">OmniSpace-Events</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guest-password">Guest Password</Label>
                      <div className="flex gap-2">
                        <Input
                          id="guest-password"
                          type={guestSettings.showPassword ? "text" : "password"}
                          value={guestSettings.password}
                          onChange={(e) => setGuestSettings({...guestSettings, password: e.target.value})}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          onClick={() => setGuestSettings({...guestSettings, showPassword: !guestSettings.showPassword})}
                        >
                          {guestSettings.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-password">Auto-rotate guest password</Label>
                      <Switch 
                        id="auto-password" 
                        checked={guestSettings.autoRotatePassword}
                        onCheckedChange={(checked) => setGuestSettings({...guestSettings, autoRotatePassword: checked})}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically change the guest password every week
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="captive-portal">Enable captive portal</Label>
                      <Switch 
                        id="captive-portal" 
                        checked={guestSettings.enableCaptivePortal}
                        onCheckedChange={(checked) => setGuestSettings({...guestSettings, enableCaptivePortal: checked})}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Show a login page when guests connect to the WiFi
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="time-limit">Time limit for guest access</Label>
                      <Switch 
                        id="time-limit" 
                        checked={guestSettings.enableTimeLimit}
                        onCheckedChange={(checked) => setGuestSettings({...guestSettings, enableTimeLimit: checked})}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={guestSettings.timeLimitHours}
                        onChange={(e) => setGuestSettings({...guestSettings, timeLimitHours: parseInt(e.target.value) || 0})}
                        className="w-20" 
                        min="1"
                        max="24"
                      />
                      <span className="text-sm text-muted-foreground">hours</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      setIsSaving(true);
                      
                      // Validate inputs
                      if (!guestSettings.selectedNetwork) {
                        toast.error('Please select a network');
                        return;
                      }
                      
                      if (!guestSettings.password) {
                        toast.error('Please enter a password');
                        return;
                      }
                      
                      if (guestSettings.enableTimeLimit && (!guestSettings.timeLimitHours || guestSettings.timeLimitHours < 1 || guestSettings.timeLimitHours > 24)) {
                        toast.error('Please enter a valid time limit between 1 and 24 hours');
                        return;
                      }
                      
                      // Prepare the data to save
                      const settingsToSave = {
                        network: guestSettings.selectedNetwork,
                        password: guestSettings.password,
                        autoRotatePassword: guestSettings.autoRotatePassword,
                        enableCaptivePortal: guestSettings.enableCaptivePortal,
                        enableTimeLimit: guestSettings.enableTimeLimit,
                        timeLimitHours: guestSettings.timeLimitHours
                      };
                      
                      console.log('Saving guest settings:', settingsToSave);
                      
                      // Simulate API call with a delay
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      
                      // Update the networks list with the new password
                      setWifiNetworks(currentNetworks => 
                        currentNetworks.map(network => 
                          network.name === guestSettings.selectedNetwork 
                            ? { ...network, password: guestSettings.password }
                            : network
                        )
                      );
                      
                      // Show success message
                      toast.success('Guest WiFi settings saved successfully!', {
                        duration: 3000,
                      });
                      
                    } catch (error) {
                      console.error('Failed to save guest settings:', error);
                      toast.error('Failed to save guest settings. Please try again.', {
                        duration: 5000,
                      });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="min-w-[150px]"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <span>Save Guest Settings</span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          {/* Access Codes Tab */}
          <TabsContent value="codes" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>WiFi Access Codes</CardTitle>
                  <CardDescription>Generate and manage temporary WiFi access codes</CardDescription>
                </div>
                <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsCodeDialogOpen(true)}>Generate Code</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Access Code</DialogTitle>
                      <DialogDescription>Create a new temporary WiFi access code.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        setIsGenerating(true);
                        
                        // Generate a random code
                        const code = `CODE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                        
                        // Create new access code
                        const newCode = {
                          id: Date.now(),
                          code,
                          type: newAccessCode.type === 'day' ? 'Day Pass' : 
                                newAccessCode.type === 'event' ? 'Event' : 'Trial',
                          expiresAt: newAccessCode.expiresAt,
                          usageLimit: newAccessCode.usageLimit,
                          usageCount: 0,
                          network: newAccessCode.network
                        };
                        
                        // In a real app, you would make an API call here
                        console.log('Generating new access code:', newCode);
                        
                        // Simulate API call
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // Add to access codes list
                        setAccessCodes(prev => [newCode, ...prev]);
                        
                        // Show success message
                        toast.success('Access code generated successfully!', {
                          duration: 3000,
                        });
                        
                        // Reset form and close dialog
                        setNewAccessCode({
                          type: 'day',
                          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          usageLimit: 1,
                          network: 'guest',
                          code: ''
                        });
                        setIsCodeDialogOpen(false);
                        
                      } catch (error) {
                        console.error('Failed to generate access code:', error);
                        toast.error('Failed to generate access code. Please try again.', {
                          duration: 5000,
                        });
                      } finally {
                        setIsGenerating(false);
                      }
                    }}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="code-type" className="text-right">
                            Type
                          </Label>
                          <Select
                            value={newAccessCode.type}
                            onValueChange={(value) => setNewAccessCode({...newAccessCode, type: value})}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select code type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Day Pass</SelectItem>
                              <SelectItem value="event">Event</SelectItem>
                              <SelectItem value="trial">Trial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="expiry-date" className="text-right">
                            Expires
                          </Label>
                          <Input 
                            id="expiry-date" 
                            type="date" 
                            className="col-span-3" 
                            value={newAccessCode.expiresAt}
                            onChange={(e) => setNewAccessCode({...newAccessCode, expiresAt: e.target.value})}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="usage-limit" className="text-right">
                            Usage Limit
                          </Label>
                          <Input 
                            id="usage-limit" 
                            type="number" 
                            min="1"
                            value={newAccessCode.usageLimit}
                            onChange={(e) => setNewAccessCode({...newAccessCode, usageLimit: parseInt(e.target.value) || 1})}
                            className="col-span-3" 
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="network" className="text-right">
                            Network
                          </Label>
                          <Select
                            value={newAccessCode.network}
                            onValueChange={(value) => setNewAccessCode({...newAccessCode, network: value})}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select network" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="main">Main Network</SelectItem>
                              <SelectItem value="guest">Guest Network</SelectItem>
                              <SelectItem value="events">Events Network</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={() => {
                            setIsCodeDialogOpen(false);
                            // Reset form
                            setNewAccessCode({
                              type: 'day',
                              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                              usageLimit: 1,
                              network: 'guest',
                              code: ''
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isGenerating}>
                          {isGenerating ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : 'Generate Code'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accessCodes.map((code) => (
                    <div key={code.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-medium">{code.code}</p>
                          <Badge variant="outline">{code.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Expires: {code.expiresAt} • Usage: {code.usageCount}/{code.usageLimit}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(code.code);
                            toast.success('Code copied to clipboard!');
                          } catch (error) {
                            console.error('Failed to copy code:', error);
                            toast.error('Failed to copy code');
                          }
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          QR Code
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>WiFi Security Settings</CardTitle>
                <CardDescription>Configure security settings for your WiFi networks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="security-protocol">Security Protocol</Label>
                      <Select defaultValue="wpa3">
                        <SelectTrigger id="security-protocol">
                          <SelectValue placeholder="Select security protocol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wpa2">WPA2</SelectItem>
                          <SelectItem value="wpa3">WPA3</SelectItem>
                          <SelectItem value="wpa2-enterprise">WPA2-Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="encryption">Encryption</Label>
                      <Select defaultValue="aes">
                        <SelectTrigger id="encryption">
                          <SelectValue placeholder="Select encryption" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tkip">TKIP</SelectItem>
                          <SelectItem value="aes">AES</SelectItem>
                          <SelectItem value="tkip-aes">TKIP+AES</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mac-filtering">MAC Address Filtering</Label>
                      <Switch id="mac-filtering" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Only allow specific devices to connect to your networks
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hide-ssid">Hide Network Names (SSID)</Label>
                      <Switch id="hide-ssid" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hide your network names from being publicly visible
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isolation">Client Isolation</Label>
                      <Switch id="isolation" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Prevent connected devices from communicating with each other
                    </p>
                  </div>
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Security Recommendation</h4>
                        <p className="text-sm text-yellow-700">
                          We recommend changing your WiFi passwords every 90 days for optimal security.
                          Last password change: 45 days ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Security Settings</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Network Monitoring</CardTitle>
                <CardDescription>Monitor network activity and detect security threats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="intrusion-detection">Intrusion Detection</Label>
                      <Switch id="intrusion-detection" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically detect and block suspicious network activity
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bandwidth-limiting">Bandwidth Limiting</Label>
                      <Switch id="bandwidth-limiting" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Limit bandwidth for guest users to ensure fair usage
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content-filtering">Content Filtering</Label>
                      <Switch id="content-filtering" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Block access to inappropriate or malicious websites
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="activity-logs">Activity Logs</Label>
                      <Switch id="activity-logs" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Keep logs of network activity for security purposes
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline">
                      <Shield className="mr-2 h-4 w-4" />
                      View Security Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
