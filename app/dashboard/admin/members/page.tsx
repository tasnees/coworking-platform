"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/dashboard-layout";
import {
  CreditCard,
  Plus,
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  Check,
  RefreshCw,
  ArrowRight,
  History,
  FileText,
  UserPlus,
} from "lucide-react";
import { saveAs } from "file-saver";

export default function MembersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [members, setMembers] = useState([
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
        amenitiesUsed: ["WiFi", "Coffee"],
      },
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+1 (555) 456-7890",
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
        amenitiesUsed: ["WiFi"],
      },
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      phone: "+1 (555) 789-0123",
      plan: "Monthly Pro",
      status: "inactive",
      startDate: "2023-11-01",
      nextBilling: null,
      amount: 450,
      memberSince: "2023-06-15",
      autoRenew: false,
      usageStats: {
        deskHours: 85,
        meetingRoomHours: 6,
        amenitiesUsed: ["WiFi", "Coffee", "Printer", "Scanner"],
      },
    },
    {
      id: 5,
      name: "David Brown",
      email: "david@example.com",
      phone: "+1 (555) 234-5678",
      plan: "Enterprise",
      status: "active",
      startDate: "2023-12-01",
      nextBilling: "2024-01-01",
      amount: 1200,
      memberSince: "2023-03-10",
      autoRenew: true,
      usageStats: {
        deskHours: 160,
        meetingRoomHours: 15,
        amenitiesUsed: [
          "WiFi",
          "Coffee",
          "Printer",
          "Scanner",
          "Private Office",
        ],
      },
    },
  ]);

  // Add Member form state
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    plan: "",
    startDate: "",
    autoRenew: false,
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Edit Member state
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editDialogOpenId, setEditDialogOpenId] = useState<number | null>(null);

  // Dialog state for Change Plan, History, Invoice
  const [changePlanOpenId, setChangePlanOpenId] = useState<number | null>(null);
  const [historyOpenId, setHistoryOpenId] = useState<number | null>(null);
  const [invoiceOpenId, setInvoiceOpenId] = useState<number | null>(null);

  // Change Plan handler
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedEffective, setSelectedEffective] = useState("next-billing");
  const handleChangePlan = (id: number) => {
    setMembers(members =>
      members.map(m =>
        m.id === id
          ? {
              ...m,
              plan: selectedPlan || m.plan,
              amount:
                selectedPlan === "Day Pass"
                  ? 25
                  : selectedPlan === "Weekly Flex"
                  ? 150
                  : selectedPlan === "Monthly Pro"
                  ? 450
                  : selectedPlan === "Enterprise"
                  ? 1200
                  : m.amount,
            }
          : m
      )
    );
    setChangePlanOpenId(null);
    setSelectedPlan("");
    setSelectedEffective("next-billing");
    router.back();
  };

  // Add Member handler
  const handleAddMember = () => {
    setMembers([
      ...members,
      {
        id: members.length + 1,
        ...newMember,
        status: "active",
        nextBilling: null,
        amount: 0,
        memberSince: newMember.startDate,
        usageStats: { deskHours: 0, meetingRoomHours: 0, amenitiesUsed: [] },
      },
    ]);
    setNewMember({
      name: "",
      email: "",
      phone: "",
      plan: "",
      startDate: "",
      autoRenew: false,
    });
    setAddDialogOpen(false);
  };

  // Edit Member handler
  const handleEditMember = (id: number) => {
    setMembers(members.map(m => (m.id === id ? { ...m, ...editingMember } : m)));
    setEditingMember(null);
    setEditDialogOpenId(null);
    router.back();
  };

  // Reactivate Member handler
  const handleReactivateMember = (id: number) => {
    setMembers(members.map(m => m.id === id ? { ...m, status: "active" } : m));
  };

  // Export History handler (dummy CSV)
  const handleExportHistory = (member: any) => {
    const csv = `Type,Details,Date
Plan Change,${member.plan},${member.startDate}
Renewal,${member.plan},${member.nextBilling || ""}
Payment,${member.amount},${member.nextBilling || ""}
`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${member.name}-history.csv`);
  };

  // Invoice handlers (dummy)
  const handleViewInvoice = (invoiceId: string) => {
    // You can implement a modal or PDF viewer here
    alert(`Viewing invoice ${invoiceId}`);
  };
  const handleDownloadInvoice = (invoiceId: string) => {
    // Simulate download
    const blob = new Blob([`Invoice: ${invoiceId}`], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${invoiceId}.txt`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "expired":
        return "destructive";
      case "inactive":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const filteredMembers = (tab: string) => {
    if (tab === "all") return members;
    return members.filter((member) => member.status === tab);
  };

  // Renew Membership handler (updated: no alert, go back after renewal)
  const handleRenewMembership = (id: number) => {
    setMembers(members =>
      members.map(m =>
        m.id === id
          ? {
              ...m,
              nextBilling: "2024-03-15", // You can make this dynamic
            }
          : m
      )
    );
    router.back(); // Go back to the members page after renewal
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Member Management
            </h1>
            <p className="text-muted-foreground">
              Manage and view all coworking space members
            </p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setAddDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Add a new member to your coworking space.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="col-span-3"
                    value={newMember.name}
                    onChange={e =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="col-span-3"
                    value={newMember.email}
                    onChange={e =>
                      setNewMember({ ...newMember, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    className="col-span-3"
                    value={newMember.phone}
                    onChange={e =>
                      setNewMember({ ...newMember, phone: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="plan" className="text-right">
                    Membership Plan
                  </Label>
                  <Select
                    value={newMember.plan}
                    onValueChange={val =>
                      setNewMember({ ...newMember, plan: val })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Day Pass">Day Pass</SelectItem>
                      <SelectItem value="Weekly Flex">Weekly Flex</SelectItem>
                      <SelectItem value="Monthly Pro">Monthly Pro</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    className="col-span-3"
                    value={newMember.startDate}
                    onChange={e =>
                      setNewMember({ ...newMember, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="autoRenew" className="text-right">
                    Auto-Renew
                  </Label>
                  <Switch
                    id="autoRenew"
                    className="col-span-3"
                    checked={newMember.autoRenew}
                    onCheckedChange={checked =>
                      setNewMember({ ...newMember, autoRenew: checked })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddDialogOpen(false);
                    router.back();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember}>Add Member</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter((m) => m.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Renewal Rate
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Membership Length
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7.2 mo</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.5</span> from last quarter
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardContent>
                <div className="space-y-4">
                  {filteredMembers(activeTab).map((member) => (
                    <div
                      key={member.id}
                      className="space-y-4 p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.name}</p>
                            <Badge variant={getStatusColor(member.status)}>
                              {member.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{member.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{member.phone}</span>
                          </div>
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
                                <DialogDescription>
                                  Detailed information about {member.name}'s
                                  membership
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium">
                                      Personal Information
                                    </h4>
                                    <div className="mt-2 space-y-1">
                                      <p className="text-sm">
                                        Name: {member.name}
                                      </p>
                                      <p className="text-sm">
                                        Email: {member.email}
                                      </p>
                                      <p className="text-sm">
                                        Phone: {member.phone}
                                      </p>
                                      <p className="text-sm">
                                        Member since: {member.memberSince}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">
                                      Usage Statistics
                                    </h4>
                                    <div className="mt-2 space-y-1">
                                      <p className="text-sm">
                                        Desk hours:{" "}
                                        {member.usageStats.deskHours}
                                      </p>
                                      <p className="text-sm">
                                        Meeting room hours:{" "}
                                        {member.usageStats.meetingRoomHours}
                                      </p>
                                      <p className="text-sm">
                                        Amenities used:{" "}
                                        {member.usageStats.amenitiesUsed.join(
                                          ", "
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-sm font-medium">
                                    Membership Information
                                  </h4>
                                  <p className="text-sm">
                                    Current plan: {member.plan}
                                  </p>
                                  <p className="text-sm">
                                    Status: {member.status}
                                  </p>
                                  <p className="text-sm">
                                    Start date: {member.startDate}
                                  </p>
                                  {member.nextBilling && (
                                    <p className="text-sm">
                                      Next billing: {member.nextBilling}
                                    </p>
                                  )}
                                  <p className="text-sm">
                                    Amount: ${member.amount}
                                  </p>
                                  <p className="text-sm">
                                    Auto-renew:{" "}
                                    {member.autoRenew ? "Yes" : "No"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Close</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Dialog
                            open={editDialogOpenId === member.id}
                            onOpenChange={open => {
                              setEditDialogOpenId(open ? member.id : null);
                              setEditingMember(open ? { ...member } : null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditDialogOpenId(member.id);
                                  setEditingMember({ ...member });
                                }}
                              >
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Edit Member</DialogTitle>
                                <DialogDescription>
                                  Update {member.name}'s information
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor={`edit-name-${member.id}`}
                                    className="text-right"
                                  >
                                    Full Name
                                  </Label>
                                  <Input
                                    id={`edit-name-${member.id}`}
                                    value={editingMember?.name || ""}
                                    onChange={e =>
                                      setEditingMember((prev: any) => ({
                                        ...prev,
                                        name: e.target.value,
                                      }))
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor={`edit-email-${member.id}`}
                                    className="text-right"
                                  >
                                    Email
                                  </Label>
                                  <Input
                                    id={`edit-email-${member.id}`}
                                    type="email"
                                    value={editingMember?.email || ""}
                                    onChange={e =>
                                      setEditingMember((prev: any) => ({
                                        ...prev,
                                        email: e.target.value,
                                      }))
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor={`edit-phone-${member.id}`}
                                    className="text-right"
                                  >
                                    Phone
                                  </Label>
                                  <Input
                                    id={`edit-phone-${member.id}`}
                                    value={editingMember?.phone || ""}
                                    onChange={e =>
                                      setEditingMember((prev: any) => ({
                                        ...prev,
                                        phone: e.target.value,
                                      }))
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor={`edit-plan-${member.id}`}
                                    className="text-right"
                                  >
                                    Membership Plan
                                  </Label>
                                  <Select
                                    value={editingMember?.plan || ""}
                                    onValueChange={val =>
                                      setEditingMember((prev: any) => ({
                                        ...prev,
                                        plan: val,
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Select a plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Day Pass">
                                        Day Pass
                                      </SelectItem>
                                      <SelectItem value="Weekly Flex">
                                        Weekly Flex
                                      </SelectItem>
                                      <SelectItem value="Monthly Pro">
                                        Monthly Pro
                                      </SelectItem>
                                      <SelectItem value="Enterprise">
                                        Enterprise
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor={`edit-status-${member.id}`}
                                    className="text-right"
                                  >
                                    Status
                                  </Label>
                                  <Select
                                    value={editingMember?.status || ""}
                                    onValueChange={val =>
                                      setEditingMember((prev: any) => ({
                                        ...prev,
                                        status: val,
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">
                                        Active
                                      </SelectItem>
                                      <SelectItem value="expired">
                                        Expired
                                      </SelectItem>
                                      <SelectItem value="inactive">
                                        Inactive
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor={`edit-autoRenew-${member.id}`}
                                    className="text-right"
                                  >
                                    Auto-Renew
                                  </Label>
                                  <Switch
                                    id={`edit-autoRenew-${member.id}`}
                                    checked={editingMember?.autoRenew || false}
                                    onCheckedChange={checked =>
                                      setEditingMember((prev: any) => ({
                                        ...prev,
                                        autoRenew: checked,
                                      }))
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setEditDialogOpenId(null);
                                    router.back();
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleEditMember(member.id)}
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Current Membership</h4>
                            <p className="text-sm text-muted-foreground">
                              Plan: {member.plan} • ${member.amount}
                              {member.nextBilling &&
                                ` • Next billing: ${member.nextBilling}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.status === "active" && (
                              <Switch
                                id={`auto-renew-${member.id}`}
                                checked={member.autoRenew}
                              />
                            )}
                            <Label
                              htmlFor={`auto-renew-${member.id}`}
                              className="text-sm"
                            >
                              Auto-renew
                            </Label>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {/* Renew Membership */}
                          {member.status === "active" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  Renew Membership
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>Renew Membership</DialogTitle>
                                  <DialogDescription>
                                    Renew {member.name}'s membership
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <h3 className="font-medium">
                                      Current Plan: {member.plan}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      Current billing cycle ends on{" "}
                                      {member.nextBilling}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor={`renew-duration-${member.id}`}
                                      className="text-right"
                                    >
                                      Duration
                                    </Label>
                                    <Select defaultValue="1">
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select duration" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">
                                          1{" "}
                                          {member.plan.includes("Day")
                                            ? "day"
                                            : member.plan.includes("Week")
                                            ? "week"
                                            : "month"}
                                        </SelectItem>
                                        <SelectItem value="3">
                                          3{" "}
                                          {member.plan.includes("Day")
                                            ? "days"
                                            : member.plan.includes("Week")
                                            ? "weeks"
                                            : "months"}
                                        </SelectItem>
                                        <SelectItem value="6">
                                          6{" "}
                                          {member.plan.includes("Day")
                                            ? "days"
                                            : member.plan.includes("Week")
                                            ? "weeks"
                                            : "months"}
                                        </SelectItem>
                                        <SelectItem value="12">
                                          12{" "}
                                          {member.plan.includes("Day")
                                            ? "days"
                                            : member.plan.includes("Week")
                                            ? "weeks"
                                            : "months"}
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor={`renew-autoRenew-${member.id}`}
                                      className="text-right"
                                    >
                                      Auto-Renew
                                    </Label>
                                    <Switch
                                      id={`renew-autoRenew-${member.id}`}
                                      defaultChecked={member.autoRenew}
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="rounded-lg bg-muted p-3">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">
                                        Total Amount:
                                      </span>
                                      <span className="font-bold">
                                        ${member.amount}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => router.back()}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleRenewMembership(member.id)}
                                  >
                                    Confirm Renewal
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          {/* Reactivate Membership */}
                          {(member.status === "expired" ||
                            member.status === "inactive") && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="flex items-center gap-1"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  Reactivate Membership
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>
                                    Reactivate Membership
                                  </DialogTitle>
                                  <DialogDescription>
                                    Reactivate {member.name}'s membership
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <h3 className="font-medium">
                                      Previous Plan: {member.plan}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      Membership {member.status} on{" "}
                                      {member.startDate}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor={`reactivate-plan-${member.id}`}
                                      className="text-right"
                                    >
                                      Plan
                                    </Label>
                                    <Select
                                      defaultValue={member.plan
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")}
                                    >
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a plan" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="day-pass">
                                          Day Pass
                                        </SelectItem>
                                        <SelectItem value="weekly-flex">
                                          Weekly Flex
                                        </SelectItem>
                                        <SelectItem value="monthly-pro">
                                          Monthly Pro
                                        </SelectItem>
                                        <SelectItem value="enterprise">
                                          Enterprise
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor={`reactivate-duration-${member.id}`}
                                      className="text-right"
                                    >
                                      Duration
                                    </Label>
                                    <Select defaultValue="1">
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select duration" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">
                                          1{" "}
                                          {member.plan.includes("Day")
                                            ? "day"
                                            : member.plan.includes("Week")
                                            ? "week"
                                            : "month"}
                                        </SelectItem>
                                        <SelectItem value="3">
                                          3{" "}
                                          {member.plan.includes("Day")
                                            ? "days"
                                            : member.plan.includes("Week")
                                            ? "weeks"
                                            : "months"}
                                        </SelectItem>
                                        <SelectItem value="6">
                                          6{" "}
                                          {member.plan.includes("Day")
                                            ? "days"
                                            : member.plan.includes("Week")
                                            ? "weeks"
                                            : "months"}
                                        </SelectItem>
                                        <SelectItem value="12">
                                          12{" "}
                                          {member.plan.includes("Day")
                                            ? "days"
                                            : member.plan.includes("Week")
                                            ? "weeks"
                                            : "months"}
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor={`reactivate-autoRenew-${member.id}`}
                                      className="text-right"
                                    >
                                      Auto-Renew
                                    </Label>
                                    <Switch
                                      id={`reactivate-autoRenew-${member.id}`}
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="rounded-lg bg-muted p-3">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">
                                        Total Amount:
                                      </span>
                                      <span className="font-bold">
                                        ${member.amount}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => router.back()}>
                                    Cancel
                                  </Button>
                                  <Button onClick={() => handleReactivateMember(member.id)}>
                                    Reactivate
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          {/* Change Plan */}
                          <Dialog
                            open={changePlanOpenId === member.id}
                            onOpenChange={open => setChangePlanOpenId(open ? member.id : null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1"
                                onClick={() => setChangePlanOpenId(member.id)}
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                                Change Plan
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>
                                  Change Membership Plan
                                </DialogTitle>
                                <DialogDescription>
                                  Update {member.name}'s membership plan
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor={`change-plan-${member.id}`}
                                    className="text-right"
                                  >
                                    New Plan
                                  </Label>
                                  <Select
                                    value={selectedPlan}
                                    onValueChange={setSelectedPlan}
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Select a plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Day Pass">
                                        Day Pass ($25/day)
                                      </SelectItem>
                                      <SelectItem value="Weekly Flex">
                                        Weekly Flex ($150/week)
                                      </SelectItem>
                                      <SelectItem value="Monthly Pro">
                                        Monthly Pro ($450/month)
                                      </SelectItem>
                                      <SelectItem value="Enterprise">
                                        Enterprise ($1200/month)
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor={`change-effective-${member.id}`}
                                    className="text-right"
                                  >
                                    Effective Date
                                  </Label>
                                  <Select
                                    value={selectedEffective}
                                    onValueChange={setSelectedEffective}
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Select when to apply" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="immediately">
                                        Immediately
                                      </SelectItem>
                                      <SelectItem value="next-billing">
                                        Next Billing Cycle
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="rounded-lg bg-muted p-3">
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Changing plans may result in prorated
                                    charges or credits.
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setChangePlanOpenId(null);
                                    router.back();
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleChangePlan(member.id)}
                                  disabled={!selectedPlan}
                                >
                                  Change Plan
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {/* View History */}
                          <Dialog
                            open={historyOpenId === member.id}
                            onOpenChange={open => setHistoryOpenId(open ? member.id : null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1"
                                onClick={() => setHistoryOpenId(member.id)}
                              >
                                <History className="h-3.5 w-3.5" />
                                View History
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Membership History</DialogTitle>
                                <DialogDescription>
                                  {member.name}'s membership history
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
                                <div className="space-y-2">
                                  <h3 className="font-medium">Plan Changes</h3>
                                  <div className="space-y-2">
                                    {member.id === 1 ? (
                                      <div className="rounded-lg border p-3">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-sm font-medium">
                                              Weekly Flex → Monthly Pro
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              Changed on Dec 15, 2023
                                            </p>
                                          </div>
                                          <Badge
                                            variant="outline"
                                            className="bg-blue-100 text-blue-800"
                                          >
                                            Upgraded
                                          </Badge>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">
                                        No plan changes found.
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h3 className="font-medium">Renewals</h3>
                                  <div className="space-y-2">
                                    <div className="rounded-lg border p-3">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-medium">
                                            {member.plan} • ${member.amount}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Renewed on Jan 15, 2024
                                          </p>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="bg-green-100 text-green-800"
                                        >
                                          Auto-renewed
                                        </Badge>
                                      </div>
                                    </div>
                                    {member.id === 1 && (
                                      <div className="rounded-lg border p-3">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-sm font-medium">
                                              {member.plan} • ${member.amount}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              Renewed on Dec 15, 2023
                                            </p>
                                          </div>
                                          <Badge
                                            variant="outline"
                                            className="bg-green-100 text-green-800"
                                          >
                                            Manual
                                          </Badge>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h3 className="font-medium">Payments</h3>
                                  <div className="space-y-2">
                                    <div className="rounded-lg border p-3">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-medium">
                                            {member.plan} • ${member.amount}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Paid on Jan 15, 2024
                                          </p>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="bg-green-100 text-green-800"
                                        >
                                          Paid
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setHistoryOpenId(null)}
                                >
                                  Close
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleExportHistory(member)}
                                >
                                  Export History
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {/* Invoice */}
                          <Dialog
                            open={invoiceOpenId === member.id}
                            onOpenChange={open => setInvoiceOpenId(open ? member.id : null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1"
                                onClick={() => setInvoiceOpenId(member.id)}
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Invoice
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Invoices</DialogTitle>
                                <DialogDescription>
                                  {member.name}'s invoices
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium">
                                    Recent Invoices
                                  </h3>
                                  <Button variant="outline" size="sm">
                                    Generate New Invoice
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <div className="rounded-lg border p-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium">
                                          Invoice #INV-2024-001
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {member.plan} • ${member.amount} • Jan 15, 2024
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="bg-green-100 text-green-800"
                                        >
                                          Paid
                                        </Badge>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleViewInvoice("INV-2024-001")}
                                        >
                                          View
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDownloadInvoice("INV-2024-001")}
                                        >
                                          Download
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  {member.id === 1 && (
                                    <div className="rounded-lg border p-3">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-medium">
                                            Invoice #INV-2023-042
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {member.plan} • ${member.amount} • Dec 15, 2023
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant="outline"
                                            className="bg-green-100 text-green-800"
                                          >
                                            Paid
                                          </Badge>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewInvoice("INV-2023-042")}
                                          >
                                            View
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownloadInvoice("INV-2023-042")}
                                          >
                                            Download
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setInvoiceOpenId(null)}
                                >
                                  Close
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
