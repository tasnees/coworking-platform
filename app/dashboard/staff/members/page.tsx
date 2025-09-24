"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogFooter, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Eye, Edit, Trash2, Mail, Phone, Calendar, MapPin, Building, Clock, CheckCircle, XCircle } from "lucide-react"
import { User } from "lucide-react"
// Loading component for the page
const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
  </div>
);
interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  membershipType: "basic" | "premium" | "enterprise";
  status: "active" | "inactive" | "suspended";
  company: string;
  address: string;
  city: string;
  country: string;
  notes: string;
  lastVisit?: string;
  totalVisits: number;
  profileImage?: string;
}
const mockMembers: Member[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1-555-1234",
    joinDate: "2024-01-15",
    membershipType: "premium",
    status: "active",
    company: "Tech Solutions Inc",
    address: "123 Main St",
    city: "San Francisco",
    country: "USA",
    notes: "VIP client, prefers corner desk",
    lastVisit: "2024-03-10T14:30:00Z",
    totalVisits: 24
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "+1-555-5678",
    joinDate: "2024-02-01",
    membershipType: "basic",
    status: "inactive",
    company: "Freelance",
    address: "456 Oak Ave",
    city: "New York",
    country: "USA",
    notes: "Occasional visitor, usually comes on weekends",
    lastVisit: "2024-02-28T11:15:00Z",
    totalVisits: 8
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    phone: "+1-555-9012",
    joinDate: "2024-03-05",
    membershipType: "enterprise",
    status: "suspended",
    company: "Big Corp",
    address: "789 Pine St",
    city: "Chicago",
    country: "USA",
    notes: "Team of 5, needs conference room access",
    lastVisit: "2024-03-08T16:45:00Z",
    totalVisits: 3
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana@example.com",
    phone: "+1-555-3456",
    joinDate: "2024-01-20",
    membershipType: "basic",
    status: "active",
    company: "Freelance",
    address: "1010 Park Ave",
    city: "Boston",
    country: "USA",
    notes: "Remote worker, comes in 3x a week",
    lastVisit: "2024-03-12T09:30:00Z",
    totalVisits: 32
  },
  {
    id: "5",
    name: "Evan Davis",
    email: "evan@example.com",
    phone: "+1-555-7890",
    joinDate: "2024-03-01",
    membershipType: "premium",
    status: "active",
    company: "Startup XYZ",
    address: "2020 Tech Blvd",
    city: "Austin",
    country: "USA",
    notes: "New member, orientation completed",
    lastVisit: "2024-03-14T13:00:00Z",
    totalVisits: 5
  },
  {
    id: "6",
    name: "Fiona Green",
    email: "fiona@example.com",
    phone: "+1-555-2345",
    joinDate: "2024-02-15",
    membershipType: "basic",
    status: "active",
    company: "Digital Nomad",
    address: "3030 Remote Rd",
    city: "Denver",
    country: "USA",
    notes: "Travels frequently, books hot desks",
    lastVisit: "2024-03-13T10:15:00Z",
    totalVisits: 12
  },
  {
    id: "7",
    name: "George Wilson",
    email: "george@example.com",
    phone: "+1-555-6789",
    joinDate: "2024-01-10",
    membershipType: "enterprise",
    status: "inactive",
    company: "Enterprise Solutions",
    address: "4040 Corporate Dr",
    city: "Seattle",
    country: "USA",
    notes: "Team of 10, on hold until Q2",
    lastVisit: "2024-02-20T15:45:00Z",
    totalVisits: 18
  },
  {
    id: "8",
    name: "Hannah Kim",
    email: "hannah@example.com",
    phone: "+1-555-0123",
    joinDate: "2024-03-10",
    membershipType: "premium",
    status: "active",
    company: "Creative Agency",
    address: "5050 Design St",
    city: "Portland",
    country: "USA",
    notes: "Needs meeting room access twice a week",
    lastVisit: "2024-03-14T16:30:00Z",
    totalVisits: 2
  },
  {
    id: "9",
    name: "Ian Taylor",
    email: "ian@example.com",
    phone: "+1-555-4567",
    joinDate: "2024-02-05",
    membershipType: "basic",
    status: "suspended",
    company: "Freelance Developer",
    address: "6060 Code Ave",
    city: "Miami",
    country: "USA",
    notes: "Account on hold - payment issue",
    lastVisit: "2024-02-25T14:20:00Z",
    totalVisits: 7
  },
  {
    id: "10",
    name: "Julia Martinez",
    email: "julia@example.com",
    phone: "+1-555-8901",
    joinDate: "2024-01-25",
    membershipType: "enterprise",
    status: "active",
    company: "Global Tech",
    address: "7070 Innovation Way",
    city: "Atlanta",
    country: "USA",
    notes: "Team of 8, requires dedicated desks",
    lastVisit: "2024-03-14T11:45:00Z",
    totalVisits: 29
  }
]
// Helper function to safely get array length
const getSafeLength = (arr: any[] | undefined): number => {
  return Array.isArray(arr) ? arr.length : 0;
}

export default function StaffMembersPage() {
  // State for client-side rendering
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data state
  const [members, setMembers] = useState<Member[] | null>(null);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  // Dialog visibility state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  
  // Selected data state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  // Form state with required fields
  const [formData, setFormData] = useState<Omit<Member, 'id' | 'joinDate' | 'totalVisits' | 'lastVisit'>>({
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
  });

  // Fetch members from the API
  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/staff/members');
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      // Fallback to empty array if API fails
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);
  // Only process members on client side
  const filteredMembers = useMemo(() => {
    if (!isClient || !Array.isArray(members)) return [];
    return members.filter(member => {
      if (!member) return false;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (member.name?.toLowerCase() || '').includes(searchLower) ||
        (member.email?.toLowerCase() || '').includes(searchLower) ||
        (member.company?.toLowerCase() || '').includes(searchLower) ||
        (member.city?.toLowerCase() || '').includes(searchLower);
      const matchesStatus = statusFilter === "all" || member.status === statusFilter;
      const matchesType = typeFilter === "all" || member.membershipType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [members, searchQuery, statusFilter, typeFilter, isClient]);
  // Memoize statistics to prevent unnecessary recalculations
  const { totalMembers, activeMembers, inactiveMembers, suspendedMembers, newMembersThisMonth } = useMemo(() => {
    if (!isClient || !Array.isArray(members)) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        inactiveMembers: 0,
        suspendedMembers: 0,
        newMembersThisMonth: 0
      };
    }

    const now = new Date();
    return {
      totalMembers: members.length,
      activeMembers: members.filter((m: Member) => m?.status === "active").length,
      inactiveMembers: members.filter((m: Member) => m?.status === "inactive").length,
      suspendedMembers: members.filter((m: Member) => m?.status === "suspended").length,
      newMembersThisMonth: members.filter((m: Member) => {
        try {
          if (!m?.joinDate) return false;
          const joinDate = new Date(m.joinDate);
          return joinDate.getMonth() === now.getMonth() &&
                 joinDate.getFullYear() === now.getFullYear();
        } catch (e) {
          console.error('Error processing join date:', e);
          return false;
        }
      }).length
    };
  }, [members, isClient]);
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
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
  const handleCreateMember = async () => {
    if (!formData.name || !formData.email) {
      alert('Name and email are required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/staff/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          membershipType: formData.membershipType,
          notes: formData.notes || ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create member');
      }

      const result = await response.json();
      alert(result.message);

      // Refresh the members list
      await fetchMembers();

      // Reset form
      setShowCreateDialog(false);
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
      });
    } catch (error) {
      console.error('Error creating member:', error);
      alert(error instanceof Error ? error.message : 'An error occurred while creating the member');
    } finally {
      setIsLoading(false);
    }
  };
  const handleEditMember = () => {
    if (editingMember && members) {
      setMembers(members.map(m =>
        m.id === editingMember.id ? { ...formData, id: editingMember.id, joinDate: editingMember.joinDate, totalVisits: editingMember.totalVisits } : m
      ))
      setShowEditDialog(false)
      setEditingMember(null)
    }
  }
  const handleDeleteMember = (id: string) => {
    if (confirm("Are you sure you want to delete this member? This will also remove their bookings and memberships.") && members) {
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
  if (isLoading || !isClient || members === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
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
            {filteredMembers.map((member: Member) => (
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={showCreateDialog ? handleCreateMember : handleEditMember}>
                {showCreateDialog ? 'Create Member' : 'Save Changes'}
              </Button>
            </DialogFooter>
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
  );
}