"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import DashboardLayout from "@/components/dashboard-layout"
import { Wifi, WifiOff, RefreshCw, Copy, Users, Activity, Shield, AlertTriangle, Download, Eye, EyeOff, Loader2 } from "lucide-react"
// Type definitions
interface SecurityLog {
  id: number
  timestamp: string
  event: string
  severity: 'high' | 'medium' | 'low' | 'info'
  source: string
  details: string
}
export default function WifiSettingsPage() {
  const [activeTab, setActiveTab] = useState("networks")
  const [showPassword, setShowPassword] = useState(false)
  const [showGuestPassword, setShowGuestPassword] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  // Ensure consistent client-side rendering
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString())
  }, [])
  // Add state for form inputs
  const [guestPassword, setGuestPassword] = useState("guest2025")
  const [guestNetwork, setGuestNetwork] = useState("OmniSpace-Guest")
  const [guestAutoRotate, setGuestAutoRotate] = useState(true)
  const [guestCaptivePortal, setGuestCaptivePortal] = useState(true)
  const [membershipNetwork, setMembershipNetwork] = useState("main")
  const [membershipTimeLimit, setMembershipTimeLimit] = useState("24")
  const [membershipDeviceLimit, setMembershipDeviceLimit] = useState("3")
  // Add state for network data
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
      name: "OmniSpace-Events",
      status: "active",
      type: "events",
      password: "events2025",
      bandwidth: "100 Mbps",
      connectedDevices: 8,
      usagePercent: 45,
    },
  ])
  // Add state for membership settings
  const [membershipTypes, setMembershipTypes] = useState([
    {
      id: 1,
      name: "Basic",
      accessType: "Guest Network",
      timeLimit: "During operating hours",
      deviceLimit: 2,
    },
    {
      id: 2,
      name: "Standard",
      accessType: "Main Network",
      timeLimit: "During operating hours",
      deviceLimit: 3,
    },
    {
      id: 3,
      name: "Premium",
      accessType: "Main Network",
      timeLimit: "24/7",
      deviceLimit: 5,
    },
    {
      id: 4,
      name: "Enterprise",
      accessType: "Main Network",
      timeLimit: "24/7",
      deviceLimit: 10,
    },
  ])
  // Add handlers for membership updates
  const handleMembershipChange = (id: number, field: string, value: string | number) => {
    setMembershipTypes(prev =>
      prev.map(membership =>
        membership.id === id ? { ...membership, [field]: value } : membership
      )
    )
  }
  // Add refresh functionality
  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Simulate updated network data with random variations
    setWifiNetworks(prev => prev.map(network => ({
      ...network,
      connectedDevices: Math.max(0, Math.floor(network.connectedDevices + (Math.random() - 0.5) * 10)),
      usagePercent: Math.max(0, Math.min(100, Math.floor(network.usagePercent + (Math.random() - 0.5) * 15)))
    })))
    setLastUpdated(new Date().toLocaleTimeString())
    setIsRefreshing(false)
  }
  // Add handlers for save operations
  const handleSaveAccessControl = async () => {
    setSaveLoading(prev => ({ ...prev, accessControl: true }))
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    // Show success notification
    setSaveNotifications(prev => ({ ...prev, accessControl: true }))
    setSaveLoading(prev => ({ ...prev, accessControl: false }))
    // Hide notification after 3 seconds
    setTimeout(() => {
      setSaveNotifications(prev => ({ ...prev, accessControl: false }))
    }, 3000)
  }
  const handleSaveGuestSettings = async () => {
    setSaveLoading(prev => ({ ...prev, guestSettings: true }))
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    // Show success notification
    setSaveNotifications(prev => ({ ...prev, guestSettings: true }))
    setSaveLoading(prev => ({ ...prev, guestSettings: false }))
    // Hide notification after 3 seconds
    setTimeout(() => {
      setSaveNotifications(prev => ({ ...prev, guestSettings: false }))
    }, 3000)
  }
  const handleSaveSecuritySettings = async () => {
    setSaveLoading(prev => ({ ...prev, securitySettings: true }))
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    // Show success notification
    setSaveNotifications(prev => ({ ...prev, securitySettings: true }))
    setSaveLoading(prev => ({ ...prev, securitySettings: false }))
    // Hide notification after 3 seconds
    setTimeout(() => {
      setSaveNotifications(prev => ({ ...prev, securitySettings: false }))
    }, 3000)
  }
  // Add handlers for Generate Code functionality
  const handleGenerateCode = async () => {
    setGeneratingCode(true)
    // Simulate API call to generate code
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Generate a random 8-character code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    // Create new access code
    const newCode = {
      id: accessCodes.length + 1,
      code: code,
      type: codeForm.type,
      expiresAt: codeForm.expiresAt,
      usageLimit: codeForm.usageLimit,
      usageCount: 0,
      network: codeForm.network,
      createdAt: new Date().toISOString().split('T')[0]
    }
    // Add to access codes
    setAccessCodes(prev => [...prev, newCode])
    setGeneratedCode(code)
    setGeneratingCode(false)
    // Reset form and close dialog after 2 seconds
    setTimeout(() => {
      setGenerateCodeDialog(false)
      setCodeForm({
        type: 'day',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: 1,
        network: 'guest'
      })
      setGeneratedCode(null)
    }, 2000)
  }
  const handleFormChange = (field: keyof typeof codeForm, value: string | number) => {
    setCodeForm(prev => ({ ...prev, [field]: value }))
  }
  // Add handlers for QR code and copy functionality
  const handleCopyCode = async (code: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';  // Prevent scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopySuccess(code);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }
  const handleShowQrCode = (code: typeof accessCodes[0]) => {
    if (typeof window === 'undefined') return;
    
    setSelectedCode(code);
    // Generate QR code URL (using a mock API for demonstration)
    const qrData = `WIFI:T:WPA;S:${code.network};P:${code.code};;`;
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`);
    setQrCodeDialog(true);
  }
  // Add handler for security logs
  const handleViewSecurityLogs = async () => {
    setLoadingLogs(true)
    setShowSecurityLogs(true)
    // Simulate API call to fetch security logs
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Mock security logs data
    const mockLogs: SecurityLog[] = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        event: 'Suspicious login attempt blocked',
        severity: 'high',
        source: '192.168.1.100',
        details: 'Multiple failed login attempts detected from unknown device'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        event: 'MAC address blocked',
        severity: 'medium',
        source: '00:1A:2B:3C:4D:5E',
        details: 'Device blocked due to policy violation'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        event: 'Bandwidth limit exceeded',
        severity: 'low',
        source: '192.168.1.105',
        details: 'Guest user exceeded daily bandwidth limit'
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        event: 'Content filter triggered',
        severity: 'medium',
        source: '192.168.1.110',
        details: 'Attempted access to blocked website category'
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        event: 'New device connected',
        severity: 'info',
        source: '192.168.1.150',
        details: 'New device successfully connected to guest network'
      }
    ]
    setSecurityLogs(mockLogs)
    setLoadingLogs(false)
  }
  // Add state for save notifications and loading
  const [saveNotifications, setSaveNotifications] = useState({
    accessControl: false,
    guestSettings: false,
    securitySettings: false
  })
  const [saveLoading, setSaveLoading] = useState({
    accessControl: false,
    guestSettings: false,
    securitySettings: false
  })
  // Add state for Generate Code dialog
  const [generateCodeDialog, setGenerateCodeDialog] = useState(false)
  const [codeForm, setCodeForm] = useState({
    type: 'day',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 1,
    network: 'guest'
  })
  const [generatingCode, setGeneratingCode] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  // Add state for QR codes and copy functionality
  const [qrCodeDialog, setQrCodeDialog] = useState(false)
  const [selectedCode, setSelectedCode] = useState<typeof accessCodes[0] | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])
  // Add state for security logs
  const [showSecurityLogs, setShowSecurityLogs] = useState(false)
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  // Add state for dialogs
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDevicesDialog, setShowDevicesDialog] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<typeof wifiNetworks[0] | null>(null)
  // Mock connected devices data for dialog
  const mockConnectedDevices = [
    { id: 1, name: "John's MacBook Pro", ip: "192.168.1.101", mac: "A1:B2:C3:D4:E5:F6", type: "Laptop", signal: 85 },
    { id: 2, name: "Sarah's iPhone", ip: "192.168.1.102", mac: "B2:C3:D4:E5:F6:A1", type: "Phone", signal: 92 },
    { id: 3, name: "Conference Room TV", ip: "192.168.1.103", mac: "C3:D4:E5:F6:A1:B2", type: "Smart TV", signal: 78 },
    { id: 4, name: "Office Printer", ip: "192.168.1.104", mac: "D4:E5:F6:A1:B2:C3", type: "Printer", signal: 65 },
  ]
  // Add handlers for network actions
  const handleCopyPassword = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password)
      setCopySuccess(password)
      setTimeout(() => setCopySuccess(null), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy password:', err)
    }
  }
  const handleEditNetwork = (networkId: number) => {
    const network = wifiNetworks.find(n => n.id === networkId)
    if (network) {
      setSelectedNetwork(network)
      setShowEditDialog(true)
    }
  }
  const handleViewDevices = (networkId: number) => {
    const network = wifiNetworks.find(n => n.id === networkId)
    if (network) {
      setSelectedNetwork(network)
      setShowDevicesDialog(true)
    }
  }
  // Initialize state with empty array, will be populated in useEffect
  const [accessCodes, setAccessCodes] = useState<Array<{
    id: number
    code: string
    type: string
    expiresAt: string
    usageLimit: number
    usageCount: number
    network: string
    createdAt: string
  }>>([])

  // Initialize access codes on client side only
  useEffect(() => {
    setAccessCodes([
      { id: 1, code: "GUEST-1234", type: "Day Pass", expiresAt: "2025-07-24", usageLimit: 1, usageCount: 0, network: "guest", createdAt: "2025-07-24" },
      { id: 2, code: "EVENT-5678", type: "Event", expiresAt: "2025-07-30", usageLimit: 50, usageCount: 12, network: "events", createdAt: "2025-07-29" },
      { id: 3, code: "TRIAL-9012", type: "Trial", expiresAt: "2025-08-15", usageLimit: 5, usageCount: 2, network: "guest", createdAt: "2025-07-28" },
    ])
  }, [])
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
  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">WiFi Settings</h1>
            <p className="text-muted-foreground">Manage WiFi networks and access for your coworking space</p>
          </div>
          <Button onClick={handleRefreshStatus} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
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
                  <p className="text-muted-foreground">{wifiNetworks.filter(n => n.status === 'active').length} of {wifiNetworks.length} networks active</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Connected Devices</h3>
                  <p className="text-muted-foreground">{wifiNetworks.reduce((sum, network) => sum + network.connectedDevices, 0)} devices connected</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-100 p-3">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Bandwidth Usage</h3>
                  <p className="text-muted-foreground">
                    {wifiNetworks.reduce((sum, network) => sum + (parseInt(network.bandwidth) * network.usagePercent / 100), 0).toFixed(0)} Mbps / {wifiNetworks.reduce((sum, network) => sum + parseInt(network.bandwidth), 0)} Mbps
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Last updated: {lastUpdated || 'Loading...'}</p>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Add Network</Button>
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
                        <Input id="network-name" placeholder="e.g., OmniSpace-Premium" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="network-type" className="text-right">
                          Type
                        </Label>
                        <Select>
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
                        <Input id="password" type="password" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bandwidth" className="text-right">
                          Bandwidth
                        </Label>
                        <Input id="bandwidth" placeholder="e.g., 100 Mbps" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="active" className="text-right">
                          Active
                        </Label>
                        <Switch id="active" className="col-span-3" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Create Network</Button>
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
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleCopyPassword(network.password)}
                                  title="Copy password"
                                >
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
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditNetwork(network.id)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDevices(network.id)}
                              >
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
                        <Select
                          value={membership.accessType === "Main Network" ? "main" : "guest"}
                          onValueChange={(value) => handleMembershipChange(membership.id, 'accessType',
                            value === 'main' ? 'Main Network' :
                              value === 'guest' ? 'Guest Network' :
                                value === 'staff' ? 'Staff Network' : 'Events Network'
                          )}
                        >
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
                        <Select
                          value={membership.timeLimit === "24/7" ? "24/7" : membership.timeLimit === "During operating hours" ? "operating" : "limited"}
                          onValueChange={(value) => handleMembershipChange(membership.id, 'timeLimit',
                            value === '24/7' ? '24/7' :
                              value === 'operating' ? 'During operating hours' : 'Limited (12 hours)'
                          )}
                        >
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
                          value={membership.deviceLimit}
                          onChange={(e) => handleMembershipChange(membership.id, 'deviceLimit', parseInt(e.target.value))}
                          className="w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSaveAccessControl}
                  disabled={saveLoading.accessControl}
                >
                  {saveLoading.accessControl ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
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
                        value={guestNetwork}
                        onValueChange={setGuestNetwork}
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
                          type={showGuestPassword ? "text" : "password"}
                          value={guestPassword}
                          onChange={(e) => setGuestPassword(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowGuestPassword(!showGuestPassword)}
                        >
                          {showGuestPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-password">Auto-rotate guest password</Label>
                      <Switch id="auto-password" checked={guestAutoRotate} onCheckedChange={setGuestAutoRotate} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically change the guest password every week
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="captive-portal">Enable captive portal</Label>
                      <Switch id="captive-portal" checked={guestCaptivePortal} onCheckedChange={setGuestCaptivePortal} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Show a login page when guests connect to the WiFi
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="time-limit">Time limit for guest access</Label>
                      <Switch id="time-limit" defaultChecked />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue={2} className="w-20" />
                      <span className="text-sm text-muted-foreground">hours</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSaveGuestSettings}
                  disabled={saveLoading.guestSettings}
                >
                  {saveLoading.guestSettings ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Guest Settings'
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Generate Code</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Access Code</DialogTitle>
                      <DialogDescription>Create a new temporary WiFi access code.</DialogDescription>
                    </DialogHeader>
                    {generatedCode ? (
                      <div className="text-center py-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-green-600 mb-2">Generated Successfully!</p>
                          <p className="font-mono text-2xl font-bold text-green-900">{generatedCode}</p>
                          <p className="text-sm text-muted-foreground mt-2">Copy this code and share it with your guest</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code-type" className="text-right">
                              Type
                            </Label>
                            <Select
                              value={codeForm.type}
                              onValueChange={(value) => handleFormChange('type', value)}
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
                              value={codeForm.expiresAt}
                              onChange={(e) => handleFormChange('expiresAt', e.target.value)}
                              className="col-span-3" 
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="usage-limit" className="text-right">
                              Usage Limit
                            </Label>
                            <Input 
                              id="usage-limit" 
                              type="number" 
                              value={codeForm.usageLimit}
                              onChange={(e) => handleFormChange('usageLimit', parseInt(e.target.value))}
                              min={1}
                              className="col-span-3" 
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="network" className="text-right">
                              Network
                            </Label>
                            <Select
                              value={codeForm.network}
                              onValueChange={(value) => handleFormChange('network', value)}
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
                            variant="outline" 
                            onClick={() => setGenerateCodeDialog(false)}
                            disabled={generatingCode}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleGenerateCode}
                            disabled={generatingCode}
                          >
                            {generatingCode ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              'Generate Code'
                            )}
                          </Button>
                        </div>
                      </>
                    )}
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
                          onClick={() => handleCopyCode(code.code)}
                          disabled={copySuccess === code.code}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {copySuccess === code.code ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleShowQrCode(code)}
                        >
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
                <Button 
                  onClick={handleSaveSecuritySettings}
                  disabled={saveLoading.securitySettings}
                >
                  {saveLoading.securitySettings ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Security Settings'
                  )}
                </Button>
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
                    <Button 
                      variant="outline"
                      onClick={handleViewSecurityLogs}
                      disabled={loadingLogs}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      {loadingLogs ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'View Security Logs'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Edit Network Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Network: {selectedNetwork?.name}</DialogTitle>
            <DialogDescription>
              Modify the settings for the {selectedNetwork?.name} network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="network-name" className="text-right">
                Name
              </Label>
              <Input
                id="network-name"
                defaultValue={selectedNetwork?.name}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="network-password" className="text-right">
                Password
              </Label>
              <Input
                id="network-password"
                defaultValue={selectedNetwork?.password}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="network-type" className="text-right">
                Type
              </Label>
              <Select defaultValue={selectedNetwork?.type}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Network</SelectItem>
                  <SelectItem value="guest">Guest Network</SelectItem>
                  <SelectItem value="staff">Staff Network</SelectItem>
                  <SelectItem value="events">Events Network</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="network-status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Switch defaultChecked={selectedNetwork?.status === 'active'} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowEditDialog(false)}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* View Devices Dialog */}
      <Dialog open={showDevicesDialog} onOpenChange={setShowDevicesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connected Devices: {selectedNetwork?.name}</DialogTitle>
            <DialogDescription>
              View all devices currently connected to the {selectedNetwork?.name} network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              Total devices: {selectedNetwork?.connectedDevices || 0}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {mockConnectedDevices.map((device) => (
                <Card key={device.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-sm text-muted-foreground">
                        IP: {device.ip} | MAC: {device.mac}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Type: {device.type} | Signal: {device.signal}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={device.signal > 80 ? "default" : device.signal > 50 ? "secondary" : "destructive"}>
                        {device.signal}%
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowDevicesDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Copy Success Indicator */}
      {copySuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          Password copied to clipboard!
        </div>
      )}
      {/* Save Success Indicators */}
      {saveNotifications.accessControl && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          Access control settings saved successfully!
        </div>
      )}
      {saveNotifications.guestSettings && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          Guest WiFi settings saved successfully!
        </div>
      )}
      {saveNotifications.securitySettings && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          Security settings saved successfully!
        </div>
      )}
      {/* QR Code Dialog */}
      <Dialog open={qrCodeDialog} onOpenChange={setQrCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>WiFi QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to connect to the WiFi network
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            {selectedCode && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium">Network: {selectedCode.network}</p>
                  <p className="text-sm">Code: {selectedCode.code}</p>
                  <p className="text-sm">Expires: {selectedCode.expiresAt}</p>
                </div>
                {qrCodeUrl && (
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt={`QR code for ${selectedCode.network}`}
                      className="border border-gray-200 rounded-lg"
                    />
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  <p>Scan with your phone's camera or QR code app</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrCodeDialog(false)}>
              Close
            </Button>
            <Button onClick={() => handleCopyCode(selectedCode?.code || '')}>
              Copy Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Security Logs Dialog */}
      <Dialog open={showSecurityLogs} onOpenChange={setShowSecurityLogs}>
        <DialogContent className="max-w-4xl max-h-[80vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-semibold">Security Logs</DialogTitle>
            <DialogDescription className="text-sm">
              Recent security events and network activity logs
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
            {loadingLogs ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                <p className="text-sm text-muted-foreground">Loading security logs...</p>
              </div>
            ) : securityLogs.length > 0 ? (
              <div className="p-6 space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total Events', value: securityLogs.length, color: 'blue' },
                    { label: 'High Risk', value: securityLogs.filter(l => l.severity === 'high').length, color: 'red' },
                    { label: 'Medium Risk', value: securityLogs.filter(l => l.severity === 'medium').length, color: 'yellow' },
                    { label: 'Low Risk', value: securityLogs.filter(l => l.severity === 'low').length, color: 'green' }
                  ].map((summary, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className={`text-2xl font-bold text-${summary.color}-600`}>{summary.value}</div>
                      <div className="text-xs text-gray-600 mt-1">{summary.label}</div>
                    </div>
                  ))}
                </div>
                {/* Logs Timeline */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700 mb-4">Activity Timeline</h3>
                  {securityLogs.map((log) => (
                    <div key={log.id} className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-0">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                        log.severity === 'high' ? 'bg-red-500' :
                        log.severity === 'medium' ? 'bg-yellow-500' :
                        log.severity === 'low' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={
                                log.severity === 'high' ? 'destructive' :
                                log.severity === 'medium' ? 'secondary' :
                                log.severity === 'low' ? 'outline' :
                                'default'
                              }
                              className={log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                            >
                              {log.severity.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium text-gray-900">{log.event}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Source:</span>
                            <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{log.source}</code>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{log.details}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">No Security Logs</p>
                <p className="text-sm text-muted-foreground">Security logs will appear here when events occur</p>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setShowSecurityLogs(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
