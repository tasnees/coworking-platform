"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Copy, 
  Users, 
  Shield, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  Activity,
  Download,
  Loader2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger, 
  DialogFooter 
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/dashboard-layout";

// --- Types ---
type Theme = 'light' | 'dark';
type NetworkStatus = 'active' | 'inactive' | 'maintenance';

interface Network {
  id: string;
  name: string;
  status: NetworkStatus;
  type: 'main' | 'guest' | 'staff';
  password: string;
  connectedDevices: number;
  lastUpdated: string;
}

interface SecurityLog {
  id: number;
  timestamp: string;
  event: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  source: string;
  details: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// --- Contexts ---
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --- Custom Hooks ---
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

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

  // FIXED: Initialize state with mock data directly, will be available during SSR
  const [accessCodes, setAccessCodes] = useState<Array<{
    id: number
    code: string
    type: string
    expiresAt: string
    usageLimit: number
    usageCount: number
    network: string
    createdAt: string
  }>>([
    { id: 1, code: "GUEST-1234", type: "Day Pass", expiresAt: "2025-07-24", usageLimit: 1, usageCount: 0, network: "guest", createdAt: "2025-07-24" },
    { id: 2, code: "EVENT-5678", type: "Event", expiresAt: "2025-07-30", usageLimit: 50, usageCount: 12, network: "events", createdAt: "2025-07-29" },
    { id: 3, code: "TRIAL-9012", type: "Trial", expiresAt: "2025-08-15", usageLimit: 5, usageCount: 2, network: "guest", createdAt: "2025-07-28" },
  ])
  
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
                          {/* FIXED: Correctly closed SelectValue tag */}
                          <SelectValue placeholder="Select guest network" />
                        </SelectTrigger>
                        <SelectContent>
                          {wifiNetworks.filter(n => n.type === 'guest').map(n => (
                            <SelectItem key={n.id} value={n.name}>{n.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guest-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="guest-password"
                          type={showGuestPassword ? "text" : "password"}
                          value={guestPassword}
                          onChange={(e) => setGuestPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-1"
                          onClick={() => setShowGuestPassword(!showGuestPassword)}
                        >
                          {showGuestPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <Label htmlFor="guest-auto-rotate" className="flex flex-col space-y-1">
                        <span>Auto-rotate Password</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                          Automatically generate a new password every 30 days.
                        </span>
                      </Label>
                      <Switch
                        id="guest-auto-rotate"
                        checked={guestAutoRotate}
                        onCheckedChange={setGuestAutoRotate}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <Label htmlFor="guest-captive-portal" className="flex flex-col space-y-1">
                        <span>Captive Portal</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                          Require guests to agree to terms before connecting.
                        </span>
                      </Label>
                      <Switch
                        id="guest-captive-portal"
                        checked={guestCaptivePortal}
                        onCheckedChange={setGuestCaptivePortal}
                      />
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
                  <CardTitle>Guest Access Codes</CardTitle>
                  <CardDescription>Generate and manage temporary access codes for guests</CardDescription>
                </div>
                <Dialog open={generateCodeDialog} onOpenChange={setGenerateCodeDialog}>
                  <DialogTrigger asChild>
                    <Button>Generate Code</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate New Access Code</DialogTitle>
                      <DialogDescription>
                        Create a temporary, single-use access code for a guest.
                      </DialogDescription>
                    </DialogHeader>
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
                            <SelectItem value="week">Week Pass</SelectItem>
                            <SelectItem value="event">Event Pass</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="code-network" className="text-right">
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
                            <SelectItem value="guest">Guest</SelectItem>
                            <SelectItem value="events">Events</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expiresAt" className="text-right">
                          Expires At
                        </Label>
                        <Input
                          id="expiresAt"
                          type="date"
                          value={codeForm.expiresAt}
                          onChange={(e) => handleFormChange('expiresAt', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="usageLimit" className="text-right">
                          Usage Limit
                        </Label>
                        <Input
                          id="usageLimit"
                          type="number"
                          value={codeForm.usageLimit}
                          onChange={(e) => handleFormChange('usageLimit', parseInt(e.target.value))}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    {generatedCode && (
                      <div className="mt-4 rounded-lg bg-green-100 p-4 text-green-700">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Code generated successfully:</span>
                          <span className="font-mono text-xl">{generatedCode}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(generatedCode)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button onClick={handleGenerateCode} disabled={generatingCode}>
                        {generatingCode ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {accessCodes.map(code => (
                    <Card key={code.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {code.type}
                        </CardTitle>
                        <Badge>{code.network}</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold font-mono">{code.code}</div>
                          <div className="flex items-center gap-2">
                            <Dialog open={qrCodeDialog && selectedCode?.id === code.id} onOpenChange={setQrCodeDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleShowQrCode(code)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>QR Code</DialogTitle>
                                  <DialogDescription>
                                    Scan this QR code to connect to the WiFi network.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4 place-items-center">
                                  {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />}
                                  <p className="font-mono text-lg">{selectedCode?.code}</p>
                                </div>
                                <DialogFooter>
                                  <Button onClick={() => handleCopyCode(code.code)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Code
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleCopyCode(code.code)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Expires: {code.expiresAt}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Usage: {code.usageCount} of {code.usageLimit}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Network Security</CardTitle>
                <CardDescription>
                  Configure security settings and view network security logs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="firewall-status" className="flex flex-col space-y-1">
                      <span>Intrusion Detection</span>
                      <span className="font-normal leading-snug text-muted-foreground">
                        Monitor network for malicious activity.
                      </span>
                    </Label>
                    <Switch id="firewall-status" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="content-filtering" className="flex flex-col space-y-1">
                      <span>Content Filtering</span>
                      <span className="font-normal leading-snug text-muted-foreground">
                        Block access to inappropriate websites.
                      </span>
                    </Label>
                    <Switch id="content-filtering" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="isolated-guest" className="flex flex-col space-y-1">
                      <span>Isolated Guest Network</span>
                      <span className="font-normal leading-snug text-muted-foreground">
                        Prevent guest devices from accessing internal network resources.
                      </span>
                    </Label>
                    <Switch id="isolated-guest" defaultChecked />
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Security Logs</CardTitle>
                  <CardDescription>
                    Review recent security events and network anomalies.
                  </CardDescription>
                </div>
                <Dialog open={showSecurityLogs} onOpenChange={setShowSecurityLogs}>
                  <DialogTrigger asChild>
                    <Button onClick={handleViewSecurityLogs} disabled={loadingLogs}>
                      <Shield className={`mr-2 h-4 w-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                      {loadingLogs ? 'Loading...' : 'View Logs'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Network Security Logs</DialogTitle>
                      <DialogDescription>
                        A chronological list of network security events.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {securityLogs.length === 0 && !loadingLogs && (
                        <p className="text-center text-muted-foreground">No security logs found.</p>
                      )}
                      {securityLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-4 rounded-lg border p-4">
                          <div className="flex-shrink-0">
                            {log.severity === 'high' && <AlertTriangle className="h-6 w-6 text-red-500" />}
                            {log.severity === 'medium' && <Shield className="h-6 w-6 text-orange-500" />}
                            {log.severity === 'low' && <Shield className="h-6 w-6 text-yellow-500" />}
                            {log.severity === 'info' && <Shield className="h-6 w-6 text-blue-500" />}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{log.event}</h4>
                              <span className="text-sm text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{log.details}</p>
                            <p className="text-xs text-muted-foreground mt-1">Source: {log.source}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
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
              Update the settings for this WiFi network.
            </DialogDescription>
          </DialogHeader>
          {selectedNetwork && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-password" className="text-right">
                  Password
                </Label>
                <Input id="edit-password" className="col-span-3" defaultValue={selectedNetwork.password} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-bandwidth" className="text-right">
                  Bandwidth
                </Label>
                <Input id="edit-bandwidth" className="col-span-3" defaultValue={selectedNetwork.bandwidth} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* View Devices Dialog */}
      <Dialog open={showDevicesDialog} onOpenChange={setShowDevicesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connected Devices: {selectedNetwork?.name}</DialogTitle>
            <DialogDescription>
              A list of devices currently connected to this network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {mockConnectedDevices.map(device => (
              <div key={device.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h4 className="font-semibold">{device.name}</h4>
                  <p className="text-sm text-muted-foreground">{device.ip} - {device.mac}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Signal: {device.signal}%
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}