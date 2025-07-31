"use client"
import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Eye, Edit, Trash2, User, Calendar, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react"
interface Membership {
  id: string
  memberName: string
  memberEmail: string
  type: "basic" | "premium" | "enterprise"
  status: "active" | "expired" | "pending" | "cancelled"
  startDate: string
  endDate: string
  price: number
  autoRenew: boolean
  paymentMethod: string
  notes?: string
}
const mockMemberships: Membership[] = [
  {
    id: "1",
    memberName: "Alice Johnson",
    memberEmail: "alice@example.com",
    type: "premium",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    price: 299,
    autoRenew: true,
    paymentMethod: "Credit Card",
    notes: "Corporate discount applied"
  },
  {
    id: "2",
    memberName: "Bob Smith",
    memberEmail: "bob@example.com",
    type: "basic",
    status: "expired",
    startDate: "2023-06-01",
    endDate: "2024-06-01",
    price: 99,
    autoRenew: false,
    paymentMethod: "PayPal",
    notes: "Did not renew due to relocation"
  },
  {
    id: "3",
    memberName: "Carol Davis",
    memberEmail: "carol@example.com",
    type: "enterprise",
    status: "active",
    startDate: "2024-03-01",
    endDate: "2025-03-01",
    price: 599,
    autoRenew: true,
    paymentMethod: "Bank Transfer",
    notes: "Team of 5 members"
  },
  {
    id: "4",
    memberName: "David Wilson",
    memberEmail: "david@example.com",
    type: "premium",
    status: "pending",
    startDate: "2024-07-01",
    endDate: "2025-07-01",
    price: 299,
    autoRenew: true,
    paymentMethod: "Credit Card",
    notes: "Waiting for payment confirmation"
  },
  {
    id: "5",
    memberName: "Emma Brown",
    memberEmail: "emma@example.com",
    type: "basic",
    status: "active",
    startDate: "2024-05-15",
    endDate: "2025-05-15",
    price: 99,
    autoRenew: true,
    paymentMethod: "Debit Card"
  }
]
export default function StaffMembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>(mockMemberships)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null)
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null)
  // Form states for create/edit
  const [formData, setFormData] = useState({
    memberName: "",
    memberEmail: "",
    type: "basic" as Membership["type"],
    status: "pending" as Membership["status"],
    startDate: "",
    endDate: "",
    price: 99,
    autoRenew: false,
    paymentMethod: "Credit Card",
    notes: ""
  })
  const filteredMemberships = memberships.filter(membership => {
    const matchesSearch = membership.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         membership.memberEmail.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || membership.status === statusFilter
    const matchesType = typeFilter === "all" || membership.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })
  const totalMemberships = memberships.length
  const activeMemberships = memberships.filter(m => m.status === "active").length
  const expiredMemberships = memberships.filter(m => m.status === "expired").length
  const pendingMemberships = memberships.filter(m => m.status === "pending").length
  const totalRevenue = memberships.filter(m => m.status === "active").reduce((sum, m) => sum + m.price, 0)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  const getStatusBadgeVariant = (status: Membership["status"]) => {
    switch (status) {
      case "active": return "default"
      case "expired": return "destructive"
      case "pending": return "secondary"
      case "cancelled": return "outline"
      default: return "default"
    }
  }
  const getTypeBadgeVariant = (type: Membership["type"]) => {
    switch (type) {
      case "basic": return "outline"
      case "premium": return "default"
      case "enterprise": return "secondary"
      default: return "default"
    }
  }
  const handleCreateMembership = () => {
    const newMembership: Membership = {
      id: Date.now().toString(),
      ...formData
    }
    setMemberships([...memberships, newMembership])
    setShowCreateDialog(false)
    setFormData({
      memberName: "",
      memberEmail: "",
      type: "basic",
      status: "pending",
      startDate: "",
      endDate: "",
      price: 99,
      autoRenew: false,
      paymentMethod: "Credit Card",
      notes: ""
    })
  }
  const handleEditMembership = () => {
    if (editingMembership) {
      setMemberships(memberships.map(m => 
        m.id === editingMembership.id ? { ...formData, id: editingMembership.id } : m
      ))
      setShowEditDialog(false)
      setEditingMembership(null)
    }
  }
  const handleDeleteMembership = (id: string) => {
    if (confirm("Are you sure you want to delete this membership?")) {
      setMemberships(memberships.filter(m => m.id !== id))
    }
  }
  const openEditDialog = (membership: Membership) => {
    setEditingMembership(membership)
    setFormData({
      memberName: membership.memberName,
      memberEmail: membership.memberEmail,
      type: membership.type,
      status: membership.status,
      startDate: membership.startDate,
      endDate: membership.endDate,
      price: membership.price,
      autoRenew: membership.autoRenew,
      paymentMethod: membership.paymentMethod,
      notes: membership.notes || ""
    })
    setShowEditDialog(true)
  }
  const openViewDialog = (membership: Membership) => {
    setSelectedMembership(membership)
    setShowViewDialog(true)
  }
  return (
    <DashboardLayout userRole="staff">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Membership Management</h1>
          <p className="text-muted-foreground">Manage member subscriptions and memberships</p>
        </div>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Memberships</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMemberships}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMemberships}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingMemberships}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Membership
          </Button>
        </div>
        {/* Memberships List */}
        <div className="border rounded-lg">
          <div className="divide-y">
            {filteredMemberships.map((membership) => (
              <div key={membership.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{membership.memberName}</h3>
                      <Badge variant={getTypeBadgeVariant(membership.type)}>
                        {membership.type.charAt(0).toUpperCase() + membership.type.slice(1)}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(membership.status)}>
                        {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{membership.memberEmail}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(membership.startDate)} - {formatDate(membership.endDate)}
                      </span>
                      <span>{formatCurrency(membership.price)}</span>
                      {membership.autoRenew && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Auto-renew
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openViewDialog(membership)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(membership)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMembership(membership.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Create/Edit Dialog */}
        <Dialog open={showCreateDialog || showEditDialog} onOpenChange={showCreateDialog ? setShowCreateDialog : setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{showCreateDialog ? "Create New Membership" : "Edit Membership"}</DialogTitle>
              <DialogDescription>
                {showCreateDialog ? "Add a new membership for a member" : "Update membership details"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Member Name</Label>
                  <Input
                    value={formData.memberName}
                    onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                    placeholder="Enter member name"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.memberEmail}
                    onChange={(e) => setFormData({ ...formData, memberEmail: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Membership Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as Membership["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic ($99/year)</SelectItem>
                      <SelectItem value="premium">Premium ($299/year)</SelectItem>
                      <SelectItem value="enterprise">Enterprise ($599/year)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Membership["status"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={formData.autoRenew}
                  onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                />
                <Label htmlFor="autoRenew">Enable auto-renew</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false)
                  setShowEditDialog(false)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={showCreateDialog ? handleCreateMembership : handleEditMembership}
              >
                {showCreateDialog ? "Create Membership" : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* View Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Membership Details</DialogTitle>
            </DialogHeader>
            {selectedMembership && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Member Information</h3>
                  <p><strong>Name:</strong> {selectedMembership.memberName}</p>
                  <p><strong>Email:</strong> {selectedMembership.memberEmail}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Membership Details</h3>
                  <p><strong>Type:</strong> {selectedMembership.type.charAt(0).toUpperCase() + selectedMembership.type.slice(1)}</p>
                  <p><strong>Status:</strong> {selectedMembership.status.charAt(0).toUpperCase() + selectedMembership.status.slice(1)}</p>
                  <p><strong>Duration:</strong> {formatDate(selectedMembership.startDate)} - {formatDate(selectedMembership.endDate)}</p>
                  <p><strong>Price:</strong> {formatCurrency(selectedMembership.price)}</p>
                  <p><strong>Payment Method:</strong> {selectedMembership.paymentMethod}</p>
                  <p><strong>Auto-renew:</strong> {selectedMembership.autoRenew ? "Enabled" : "Disabled"}</p>
                </div>
                {selectedMembership.notes && (
                  <div>
                    <h3 className="font-semibold">Notes</h3>
                    <p>{selectedMembership.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
