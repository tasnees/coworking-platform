"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// All imports for UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard-layout";
import {
  UserPlus,
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Check,
  RefreshCw,
  ArrowRight,
  History,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Define types for better type safety
type Member = {
  id: number;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: 'active' | 'inactive' | 'pending';
  startDate: string;
  nextBilling: string;
  amount: number;
  memberSince: string;
  autoRenew: boolean;
  usageStats: {
    deskHours: number;
    meetingRoomHours: number;
    amenitiesUsed: string[];
  };
};

// Mock data (moved outside the component to avoid re-creation on every render)
const MOCK_MEMBERS: Member[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
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
      amenitiesUsed: ["WiFi", "Coffee", "Printer"],
    },
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 (555) 987-6543",
    plan: "Annual Basic",
    status: "pending",
    startDate: "2024-06-20",
    nextBilling: "2025-06-20",
    amount: 2500,
    memberSince: "2024-06-20",
    autoRenew: false,
    usageStats: {
      deskHours: 50,
      meetingRoomHours: 0,
      amenitiesUsed: ["WiFi"],
    },
  },
  {
    id: 3,
    name: "Michael Jones",
    email: "michael@example.com",
    phone: "+1 (555) 111-2222",
    plan: "Monthly Pro",
    status: "inactive",
    startDate: "2023-08-01",
    nextBilling: "2024-08-01",
    amount: 450,
    memberSince: "2023-08-01",
    autoRenew: true,
    usageStats: {
      deskHours: 80,
      meetingRoomHours: 2,
      amenitiesUsed: ["WiFi", "Coffee"],
    },
  },
  {
    id: 4,
    name: "Emily White",
    email: "emily@example.com",
    phone: "+1 (555) 333-4444",
    plan: "Flex Pass",
    status: "active",
    startDate: "2024-03-05",
    nextBilling: "2024-04-05",
    amount: 150,
    memberSince: "2024-03-05",
    autoRenew: false,
    usageStats: {
      deskHours: 35,
      meetingRoomHours: 0,
      amenitiesUsed: ["WiFi", "Coffee"],
    },
  },
];

const DEFAULT_MEMBER: Member = {
  id: 0,
  name: '',
  email: '',
  phone: '',
  plan: '',
  status: 'pending',
  startDate: '',
  nextBilling: '',
  amount: 0,
  memberSince: '',
  autoRenew: false,
  usageStats: {
    deskHours: 0,
    meetingRoomHours: 0,
    amenitiesUsed: [],
  },
};

export default function MembersContent() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"active" | "inactive" | "pending" | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // This useEffect will run only on the client side
  useEffect(() => {
    // Redirect unauthenticated users
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Simulate API call to fetch members
    const fetchMembers = () => {
      setError(null);
      setTimeout(() => {
        try {
          // Set the mock data
          setMembers(MOCK_MEMBERS);
          setIsLoading(false);
        } catch (err) {
          console.error("Failed to fetch members:", err);
          setError("Failed to load members. Please try again.");
          setIsLoading(false);
        }
      }, 500);
    };

    fetchMembers();
  }, [isAuthenticated, router]);

  // Use a single, clear loading state check for rendering
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <p className="text-xl font-bold text-red-600 mb-4">Error</p>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Reload Page
        </Button>
      </div>
    );
  }

  // Memoized filter function to prevent re-calculations
  const filteredMembers = useCallback(() => {
    return members.filter(member => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = member.name.toLowerCase().includes(searchLower) || member.email.toLowerCase().includes(searchLower);
      const matchesStatus = activeTab === 'all' || member.status === activeTab;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, activeTab]);

  // Memoized stats calculation for performance
  const stats = useCallback(() => {
    return {
      total: members.length,
      active: members.filter(m => m.status === 'active').length,
      pending: members.filter(m => m.status === 'pending').length,
      inactive: members.filter(m => m.status === 'inactive').length,
    };
  }, [members]);

  const { total: totalMembers, active: activeMembers, pending: pendingMembers, inactive: inactiveMembers } = stats();

  const handleCreateMember = (newMember: Omit<Member, 'id'>) => {
    // In a real app, this would be an API call
    const createdMember: Member = {
      ...newMember,
      id: members.length + 1, // Simple ID generation
      memberSince: new Date().toISOString().split('T')[0]
    };
    setMembers(prev => [...prev, createdMember]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateMember = (updatedMember: Member) => {
    // In a real app, this would be an API call
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    setEditingMember(null);
  };

  const handleDeleteMember = (memberId: number) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      // In a real app, this would be an API call
      setMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };

  // Helper for status badge color
  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Members</h1>
            <p className="text-muted-foreground">
              Manage your coworking space members
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="search"
              placeholder="Search members..."
              className="w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Member Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <History className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <FileText className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveMembers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Members Table */}
        <Card>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all")}>
            <div className="flex flex-wrap items-center justify-between p-4 border-b">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </div>
            <CardContent>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers().length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No members found for this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers().map(member => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.plan}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(member.status)}>{member.status}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.memberSince}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm" onClick={() => setEditingMember(member)}>
                              <Edit className="h-4 w-4 text-gray-500 hover:text-gray-900" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteMember(member.id)}>
                              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Tabs>
        </Card>

        {/* Create Member Dialog */}
        <CreateMemberDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} onCreate={handleCreateMember} />

        {/* Edit Member Dialog */}
        <EditMemberDialog member={editingMember} onUpdate={handleUpdateMember} onClose={() => setEditingMember(null)} />
      </div>
    </DashboardLayout>
  );
}

// A separate component for the Create Member Dialog
const CreateMemberDialog = ({ isOpen, onClose, onCreate }: { isOpen: boolean; onClose: () => void; onCreate: (data: Omit<Member, 'id'>) => void; }) => {
  const [formData, setFormData] = useState<Omit<Member, 'id'>>({ ...DEFAULT_MEMBER, memberSince: new Date().toISOString().split('T')[0] });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleSelectChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: value });
  };
  const handleSubmit = () => {
    onCreate(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>Fill out the details to create a new user account.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan" className="text-right">Plan</Label>
            <Input id="plan" value={formData.plan} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select onValueChange={(val) => handleSelectChange('status', val)} value={formData.status}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Create Member</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// A separate component for the Edit Member Dialog
const EditMemberDialog = ({ member, onUpdate, onClose }: { member: Member | null; onUpdate: (data: Member) => void; onClose: () => void; }) => {
  const [formData, setFormData] = useState<Member | null>(null);

  useEffect(() => {
    if (member) {
      setFormData(member);
    }
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };
  const handleSelectChange = (id: string, value: string) => {
    if (formData) {
      setFormData({ ...formData, [id]: value as any });
    }
  };
  const handleSubmit = () => {
    if (formData) {
      onUpdate(formData);
    }
    onClose();
  };

  if (!member) {
    return null;
  }

  return (
    <Dialog open={!!member} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>Update the details for {member.name}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={formData?.name || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" value={formData?.email || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan" className="text-right">Plan</Label>
            <Input id="plan" value={formData?.plan || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select onValueChange={(val) => handleSelectChange('status', val)} value={formData?.status}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
