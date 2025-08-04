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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  CreditCard, 
  Plus, 
  Search, 
  Users, 
  DollarSign, 
  Calendar, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  History, 
  FileText 
} from "lucide-react"
function MembershipsContent() {
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("plans")
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show loading state until component is mounted
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // State for plans and editing
  const [membershipPlans, setMembershipPlans] = useState([
    {
      id: 1,
      name: "Day Pass",
      type: "daily",
      price: 25,
      features: ["Hot desk access", "WiFi", "Coffee/Tea", "Basic amenities"],
      active: true,
      members: 45,
    },
    {
      id: 2,
      name: "Weekly Flex",
      type: "weekly",
      price: 150,
      features: ["Hot desk access", "Meeting room credits (2hrs)", "WiFi", "All amenities", "Locker"],
      active: true,
      members: 23,
    },
    {
      id: 3,
      name: "Monthly Pro",
      type: "monthly",
      price: 450,
      features: ["Dedicated desk", "Meeting room credits (10hrs)", "Private locker", "All amenities", "24/7 access"],
      active: true,
      members: 156,
    },
    {
      id: 4,
      name: "Enterprise",
      type: "monthly",
      price: 1200,
      features: [
        "Private office",
        "Unlimited meeting rooms",
        "Dedicated phone line",
        "All amenities",
        "24/7 access",
        "Priority support",
      ],
      active: true,
      members: 12,
    },
  ])
  // Edit dialog state
  const [editDialogOpenId, setEditDialogOpenId] = useState<number | null>(null)
  const [editPlan, setEditPlan] = useState<any>(null)
  // Handler for Edit Plan
  const handleEditPlan = (id: number) => {
    setMembershipPlans(plans =>
      plans.map(plan =>
        plan.id === id ? { ...plan, ...editPlan } : plan
      )
    )
    setEditDialogOpenId(null)
    setEditPlan(null)
  }
  // Handler for Deactivate/Activate
  const handleTogglePlanActive = (id: number) => {
    setMembershipPlans(plans =>
      plans.map(plan =>
        plan.id === id ? { ...plan, active: !plan.active } : plan
      )
    )
  }
  const members = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      plan: "Monthly Pro",
      status: "active",
      startDate: "2024-01-15",
      nextBilling: "2024-02-15",
      amount: 450,
      memberSince: "2023-05-10",
      autoRenew: true,
      usageStats: {
        deskHours: 120,
        meetingRoomHours: 8,
        amenitiesUsed: ["WiFi", "Coffee", "Printer"]
      }
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      plan: "Weekly Flex",
      status: "active",
      startDate: "2024-01-15",
      nextBilling: "2024-01-22",
      amount: 150,
      memberSince: "2023-08-22",
      autoRenew: true,
      usageStats: {
        deskHours: 35,
        meetingRoomHours: 2,
        amenitiesUsed: ["WiFi", "Coffee"]
      }
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      plan: "Day Pass",
      status: "expired",
      startDate: "2024-01-10",
      nextBilling: null,
      amount: 25,
      memberSince: "2023-12-05",
      autoRenew: false,
      usageStats: {
        deskHours: 8,
        meetingRoomHours: 0,
        amenitiesUsed: ["WiFi"]
      }
    },
  ]
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "expired":
        return "destructive"
      case "pending":
        return "secondary"
      default:
        return "secondary"
    }
  }
  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "secondary"
      case "weekly":
        return "default"
      case "monthly":
        return "default"
      default:
        return "secondary"
    }
  }
  return (
    <DynamicDashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Membership Management</h1>
            <p className="text-muted-foreground">Manage membership plans and member subscriptions</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Membership Plan</DialogTitle>
                <DialogDescription>Add a new membership plan for your coworking space.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="planName" className="text-right">
                    Plan Name
                  </Label>
                  <Input id="planName" placeholder="e.g., Premium Monthly" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="planType" className="text-right">
                    Type
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price ($)
                  </Label>
                  <Input id="price" type="number" placeholder="0.00" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="features" className="text-right">
                    Features
                  </Label>
                  <Input id="features" placeholder="Comma-separated features" className="col-span-3" />
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
                <Button>Create Plan</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">236</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+18%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">All plans active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renewal Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="plans">Membership Plans</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="history">Membership History</TabsTrigger>
          </TabsList>
          <TabsContent value="plans" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {membershipPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {plan.name}
                        <Badge variant={getPlanTypeColor(plan.type)}>{plan.type}</Badge>
                      </CardTitle>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${plan.price}</div>
                        <div className="text-sm text-muted-foreground">
                          per {plan.type === "daily" ? "day" : plan.type === "weekly" ? "week" : "month"}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Active Members</span>
                        <span className="font-medium">{plan.members}</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Features:</p>
                        <ul className="space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="h-3 w-3 text-green-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2 pt-2">
                        {/* Edit Plan Button */}
                        <Dialog
                          open={editDialogOpenId === plan.id}
                          onOpenChange={open => {
                            setEditDialogOpenId(open ? plan.id : null)
                            setEditPlan(open ? { ...plan } : null)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                              onClick={() => {
                                setEditDialogOpenId(plan.id)
                                setEditPlan({ ...plan })
                              }}
                            >
                              Edit Plan
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Edit Membership Plan</DialogTitle>
                              <DialogDescription>
                                Edit details for the <b>{plan.name}</b> plan.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-planName" className="text-right">
                                  Plan Name
                                </Label>
                                <Input
                                  id="edit-planName"
                                  className="col-span-3"
                                  value={editPlan?.name || ""}
                                  onChange={e => setEditPlan((prev: any) => ({ ...prev, name: e.target.value }))}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-planType" className="text-right">
                                  Type
                                </Label>
                                <Select
                                  value={editPlan?.type || ""}
                                  onValueChange={val => setEditPlan((prev: any) => ({ ...prev, type: val }))}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select plan type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-price" className="text-right">
                                  Price ($)
                                </Label>
                                <Input
                                  id="edit-price"
                                  type="number"
                                  className="col-span-3"
                                  value={editPlan?.price || ""}
                                  onChange={e => setEditPlan((prev: any) => ({ ...prev, price: Number(e.target.value) }))}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-features" className="text-right">
                                  Features
                                </Label>
                                <Input
                                  id="edit-features"
                                  className="col-span-3"
                                  value={editPlan?.features?.join(", ") || ""}
                                  onChange={e =>
                                    setEditPlan((prev: any) => ({
                                      ...prev,
                                      features: e.target.value.split(",").map((f: string) => f.trim()),
                                    }))
                                  }
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-active" className="text-right">
                                  Active
                                </Label>
                                <Switch
                                  id="edit-active"
                                  className="col-span-3"
                                  checked={!!editPlan?.active}
                                  onCheckedChange={checked =>
                                    setEditPlan((prev: any) => ({ ...prev, active: checked }))
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setEditDialogOpenId(null)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={() => handleEditPlan(plan.id)}>
                                Save Changes
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {/* Activate/Deactivate Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePlanActive(plan.id)}
                        >
                          {plan.active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Member Subscriptions</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search members..." className="pl-8" />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.name}</p>
                            <Badge variant={getStatusColor(member.status)}>{member.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Member since: {member.memberSince}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Member Details</DialogTitle>
                                <DialogDescription>Detailed information about {member.name}'s membership</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium">Personal Information</h4>
                                    <div className="mt-2 space-y-1">
                                      <p className="text-sm">Name: {member.name}</p>
                                      <p className="text-sm">Email: {member.email}</p>
                                      <p className="text-sm">Member since: {member.memberSince}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Usage Statistics</h4>
                                    <div className="mt-2 space-y-1">
                                      <p className="text-sm">Desk hours: {member.usageStats.deskHours}</p>
                                      <p className="text-sm">Meeting room hours: {member.usageStats.meetingRoomHours}</p>
                                      <p className="text-sm">Amenities used: {member.usageStats.amenitiesUsed.join(", ")}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-sm font-medium">Membership Information</h4>
                                  <p className="text-sm">Current plan: {member.plan}</p>
                                  <p className="text-sm">Status: {member.status}</p>
                                  <p className="text-sm">Start date: {member.startDate}</p>
                                  {member.nextBilling && <p className="text-sm">Next billing: {member.nextBilling}</p>}
                                  <p className="text-sm">Amount: ${member.amount}</p>
                                  <p className="text-sm">Auto-renew: {member.autoRenew ? "Yes" : "No"}</p>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Close</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Current Membership</h4>
                            <p className="text-sm text-muted-foreground">
                              Plan: {member.plan} • ${member.amount}
                              {member.nextBilling && ` • Next billing: ${member.nextBilling}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.status === "active" && (
                              <Switch id={`auto-renew-${member.id}`} checked={member.autoRenew} />
                            )}
                            <Label htmlFor={`auto-renew-${member.id}`} className="text-sm">
                              Auto-renew
                            </Label>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {member.status === "active" && (
                            <Button size="sm" variant="outline" className="flex items-center gap-1">
                              <RefreshCw className="h-3.5 w-3.5" />
                              Renew Membership
                            </Button>
                          )}
                          {member.status === "expired" && (
                            <Button size="sm" className="flex items-center gap-1">
                              <RefreshCw className="h-3.5 w-3.5" />
                              Reactivate Membership
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <ArrowRight className="h-3.5 w-3.5" />
                            Change Plan
                          </Button>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <History className="h-3.5 w-3.5" />
                            View History
                          </Button>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            Invoice
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Integration</CardTitle>
                <CardDescription>Configure payment processing for memberships</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Stripe</h4>
                          <p className="text-sm text-muted-foreground">Credit cards, ACH, international payments</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">PayPal</h4>
                          <p className="text-sm text-muted-foreground">PayPal payments and subscriptions</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-2">
                  <Label>Stripe Publishable Key</Label>
                  <Input placeholder="pk_test_..." />
                </div>
                <div className="space-y-2">
                  <Label>Stripe Secret Key</Label>
                  <Input type="password" placeholder="sk_test_..." />
                </div>
                <Button>Save Payment Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Membership History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Membership History</CardTitle>
                <CardDescription>View historical membership data and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">Membership Renewals</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">John Doe</p>
                          <p className="text-sm text-muted-foreground">Monthly Pro • $450</p>
                          <p className="text-xs text-muted-foreground">Renewed on Jan 15, 2024</p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Auto-renewed</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">Jane Smith</p>
                          <p className="text-sm text-muted-foreground">Weekly Flex • $150</p>
                          <p className="text-xs text-muted-foreground">Renewed on Jan 15, 2024</p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Auto-renewed</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">Mike Johnson</p>
                          <p className="text-sm text-muted-foreground">Day Pass • $25</p>
                          <p className="text-xs text-muted-foreground">Expired on Jan 10, 2024</p>
                        </div>
                        <Badge variant="destructive">Expired</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">Plan Changes</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">John Doe</p>
                          <p className="text-sm text-muted-foreground">Weekly Flex → Monthly Pro</p>
                          <p className="text-xs text-muted-foreground">Changed on Dec 15, 2023</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Upgraded</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">Membership Cancellations</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">Sarah Wilson</p>
                          <p className="text-sm text-muted-foreground">Monthly Pro • $450</p>
                          <p className="text-xs text-muted-foreground">Cancelled on Dec 5, 2023</p>
                        </div>
                        <Badge variant="outline">Cancelled</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DynamicDashboardLayout>
  )
}

// Main page component with client-side only rendering
export default function MembershipsPage() {
  return <MembershipsContent />
}
