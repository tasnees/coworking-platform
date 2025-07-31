"use client"
import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Eye, Edit, Trash2, User, Mail, Phone, Calendar, MapPin, Building, Clock, CheckCircle, XCircle } from "lucide-react"
interface Member {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  membershipType: "basic" | "premium" | "enterprise"
  status: "active" | "inactive" | "suspended"
  company?: string
  address: string
  city: string
  country: string
  notes?: string
  lastVisit?: string
  totalVisits: number
}
const mockMembers: Member[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1-555-0123",
    joinDate: "2024-01-15",
    membershipType: "premium",
    status: "active",
    company: "Tech Solutions Inc",
    address: "123 Main St",
    city: "San Francisco",
    country: "USA",
    notes: "VIP member, prefers corner desk",
    lastVisit: "2024-07-27",
    totalVisits: 45
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "+1-555-0124",
    joinDate: "2023-06-01",
    membershipType: "basic",
    status: "inactive",
    address: "456 Oak Ave",
    city: "New York",
    country: "USA",
    notes: "On extended leave",
    lastVisit: "2024-05-15",
    totalVisits: 23
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@example.com",
    phone: "+1-555-0125",
    joinDate: "2024-03-01",
    membershipType: "enterprise",
    status: "active",
    company: "Global Corp",
    address: "789 Pine Rd",
    city: "Austin",
    country: "USA",
    notes: "Team lead, books meeting rooms frequently",
    lastVisit: "2024-07-28",
    totalVisits: 67
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david@example.com",
    phone: "+1-555-0126",
    joinDate: "2024-07-01",
    membershipType: "basic",
    status: "active",
    address: "321 Elm St",
    city: "Seattle",
    country: "USA",
    notes: "New member, still exploring",
    lastVisit: "2024-07-26",
    totalVisits: 8
  },
  {
    id: "5",
    name: "Emma Brown",
    email: "emma@example.com",
    phone: "+1-555-0127",
    joinDate: "2024-05-15",
    membershipType: "premium",
    status: "suspended",
    company: "Freelance Designer",
    address: "654 Maple Dr",
    city: "Portland",
    country: "USA",
    notes: "Payment issues, needs follow-up",
    lastVisit: "2024-07-20",
    totalVisits: 12
  }
]
export default function StaffMembersPage() {
  const [members, setMembers] = useState<Member[]>(mockMembers)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  // Form states for create/edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    membershipType: "basic" as Member["membershipType"],
    status: "active" as Member["status"],
    company: "",
    address: "",
    city: "",
    country: "",
    notes: ""
  })
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || member.status === statusFilter
    const matchesType = typeFilter === "all" || member.membershipType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })
  const totalMembers = members.length
  const activeMembers = members.filter(m => m.status === "active").length
  const inactiveMembers = members.filter(m => m.status === "inactive").length
  const suspendedMembers = members.filter(m => m.status === "suspended").length
  const newMembersThisMonth = members.filter(m => {
    const joinDate = new Date(m.joinDate)
    const now = new Date()
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
  }).length
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  const getStatusBadgeVariant = (status: Member["status"]) => {
    switch (status) {
      case "active": return "default"
      case "inactive": return "secondary"
      case "suspended": return "destructive"
      default: return "default"
    }
  }
  const getTypeBadgeVariant = (type: Member["membershipType"]) => {
    switch (type) {
      case "basic": return "outline"
      case "premium": return "default"
      case "enterprise": return "secondary"
      default: return "default"
    }
  }
  const handleCreateMember = () => {
    const newMember: Member = {
      id: Date.now().toString(),
      ...formData,
      joinDate: new Date().toISOString().split('T')[0],
      totalVisits: 0
    }
    setMembers([...members, newMember])
    setShowCreateDialog(false)
    setFormData({
      name: "",
      email: "",
      phone: "",
      membershipType: "basic",
      status: "active",
      company: "",
      address: "",
      city: "",
      country: "",
      notes: ""
    })
  }
  const handleEditMember = () => {
    if (editingMember) {
      setMembers(members.map(m => 
        m.id === editingMember.id ? { ...formData, id: editingMember.id, joinDate: editingMember.joinDate, totalVisits: editingMember.totalVisits } : m
      ))
      setShowEditDialog(false)
      setEditingMember(null)
    }
  }
  const handleDeleteMember = (id: string) => {
    if (confirm("Are you sure you want to delete this member? This will also remove their bookings and memberships.")) {
      setMembers(members.filter(m => m.id !== id))
    }
  }
  const openEditDialog = (member: Member) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      membershipType: member.membershipType,
      status: member.status,
      company: member.company || "",
      address: member.address,
      city: member.city,
      country: member.country,
      notes: member.notes || ""
    })
    setShowEditDialog(true)
  }
  const openViewDialog = (member: Member) => {
    setSelectedMember(member)
    setShowViewDialog(true)
  }
  return (
    <DashboardLayout userRole="staff">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Member Management</h1>
          <p className="text-muted-foreground">Manage all coworking space members and their information</p>
        </div>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newMembersThisMonth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suspendedMembers}</div>
            </CardContent>
          </Card>
        </div>
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name, email, company, or city..."
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
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
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
            Add Member
          </Button>
        </div>
        {/* Members List */}
        <div className="border rounded-lg">
          <div className="divide-y">
            {filteredMembers.map((member) => (
              <div key={member.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{member.name}</h3>
                      <Badge variant={getTypeBadgeVariant(member.membershipType)}>
                        {member.membershipType.charAt(0).toUpperCase() + member.membershipType.slice(1)}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(member.status)}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {member.phone}
                      </span>
                      {member.company && (
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {member.company}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {member.city}, {member.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {formatDate(member.joinDate)}
                      </span>
                      <span>Visits: {member.totalVisits}</span>
                      {member.lastVisit && (
                        <span>Last visit: {formatDate(member.lastVisit)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openViewDialog(member)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMember(member.id)}
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
              <DialogTitle>{showCreateDialog ? "Add New Member" : "Edit Member"}</DialogTitle>
              <DialogDescription>
                {showCreateDialog ? "Create a new member profile" : "Update member information"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone *</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Membership Type</Label>
                  <Select
                    value={formData.membershipType}
                    onValueChange={(value) => setFormData({ ...formData, membershipType: value as Member["membershipType"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Member["status"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Enter country"
                  />
                </div>
                <div></div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes, preferences, etc..."
                  rows={3}
                />
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
                onClick={showCreateDialog ? handleCreateMember : handleEditMember}
              >
                {showCreateDialog ? "Create Member" : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* View Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Member Details</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Personal Information</h3>
                  <p><strong>Name:</strong> {selectedMember.name}</p>
                  <p><strong>Email:</strong> {selectedMember.email}</p>
                  <p><strong>Phone:</strong> {selectedMember.phone}</p>
                </div>
                {selectedMember.company && (
                  <div>
                    <h3 className="font-semibold">Company</h3>
                    <p>{selectedMember.company}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">Address</h3>
                  <p>{selectedMember.address}</p>
                  <p>{selectedMember.city}, {selectedMember.country}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Membership Details</h3>
                  <p><strong>Type:</strong> {selectedMember.membershipType.charAt(0).toUpperCase() + selectedMember.membershipType.slice(1)}</p>
                  <p><strong>Status:</strong> {selectedMember.status.charAt(0).toUpperCase() + selectedMember.status.slice(1)}</p>
                  <p><strong>Joined:</strong> {formatDate(selectedMember.joinDate)}</p>
                  <p><strong>Total Visits:</strong> {selectedMember.totalVisits}</p>
                  {selectedMember.lastVisit && (
                    <p><strong>Last Visit:</strong> {formatDate(selectedMember.lastVisit)}</p>
                  )}
                </div>
                {selectedMember.notes && (
                  <div>
                    <h3 className="font-semibold">Notes</h3>
                    <p>{selectedMember.notes}</p>
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
