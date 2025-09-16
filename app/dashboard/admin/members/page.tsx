"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { UserPlus, EllipsisVertical, Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MembershipStatus = 'active' | 'suspended' | 'cancelled';
type MembershipType = 'flex' | 'dedicated' | 'team' | 'enterprise';
type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'cancelled';

interface Member {
  id: string;
  name: string;
  email: string;
  membership: MembershipStatus;
  lastVisit: string;
  joinDate: string;
  plan: string;
  status: UserStatus;
  phone?: string;
  membershipType?: MembershipType;
  notes?: string;
  role?: string;
}

interface MemberFormData {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: MembershipType;
  status: UserStatus;
  joinDate: string;
  lastVisit: string;
  notes: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

function Badge({ variant, children }: { variant: 'default' | 'destructive' | 'outline', children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      variant === 'default' ? 'bg-blue-100 text-blue-800' :
      variant === 'destructive' ? 'bg-red-100 text-red-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {children}
    </span>
  );
}

function getStatusBadge(status: MembershipStatus) {
  switch (status) {
    case 'active':
      return <Badge variant="default">Active</Badge>;
    case 'suspended':
      return <Badge variant="destructive">Suspended</Badge>;
    case 'cancelled':
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

function getMemberActions(member: Member) {
  const actions = [];
  
  if (member.status === 'suspended') {
    actions.push({
      name: 'Activate',
      icon: <CheckCircle className="h-4 w-4" />,
      action: 'activate'
    });
  } else if (member.status === 'active') {
    actions.push({
      name: 'Suspend',
      icon: <XCircle className="h-4 w-4" />,
      action: 'suspend'
    });
  }
  
  if (member.status !== 'cancelled') {
    actions.push({
      name: 'Cancel Membership',
      icon: <XCircle className="h-4 w-4" />,
      action: 'cancel'
    });
  }
  
  return actions;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    membershipType: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [newMember, setNewMember] = useState<Partial<MemberFormData>>({
    name: '',
    email: '',
    phone: '',
    role: 'member',
    status: 'active',
    membershipType: 'flex',
    joinDate: new Date().toISOString(),
    lastVisit: new Date().toISOString(),
    notes: ''
  });

  const router = useRouter();

 
  useEffect(() => {
    if (editingMember) {
      setNewMember({
        id: editingMember.id,
        name: editingMember.name || '',
        email: editingMember.email || '',
        phone: editingMember.phone || '',
        membershipType: (editingMember.membershipType as MembershipType) || 'flex',
        status: (editingMember.status as UserStatus) || 'active',
        joinDate: editingMember.joinDate || new Date().toISOString(),
        lastVisit: editingMember.lastVisit || '',
        notes: editingMember.notes || '',
        role: editingMember.role || 'member',
        password: '',
        confirmPassword: ''
      });
    } else {
     
      setNewMember({
        id: '',
        name: '',
        email: '',
        phone: '',
        membershipType: 'flex',
        status: 'active',
        joinDate: new Date().toISOString(),
        lastVisit: '',
        notes: '',
        password: '',
        confirmPassword: '',
        role: 'member'
      });
    }
  }, [editingMember]);

 
  useEffect(() => {
    const filtered = members.filter(member => {
     
      const matchesSearch = searchTerm === '' || 
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
     
      const matchesStatus = !filters.status || member.status === filters.status;
      
     
      const matchesMembershipType = !filters.membershipType || 
        member.membershipType === filters.membershipType;
      
      return matchesSearch && matchesStatus && matchesMembershipType;
    });
    
    setFilteredMembers(filtered);
  }, [searchTerm, members, filters]);

 
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/admin/members');
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error('Failed to load members');
      }
    };

    fetchMembers();
  }, []);

  const handleStatusUpdate = async (memberId: string, status: MembershipStatus) => {
    try {
      setUpdatingMemberId(memberId);
      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update member status');
      }

      setMembers(prev =>
        prev.map(member =>
          member.id === memberId ? { ...member, status } : member
        )
      );
      toast.success(`Member ${status} successfully`);
    } catch (error) {
      console.error('Error updating member status:', error);
      toast.error('Failed to update member status');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/members/${memberToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      setMembers(prev => prev.filter(member => member.id !== memberToDelete.id));
      toast.success('Member deleted successfully');
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    } finally {
      setIsDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMember.name || !newMember.email || !newMember.role) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (newMember.password && newMember.password !== newMember.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

   
    const formEvent = new Event('submit') as unknown as React.FormEvent<HTMLFormElement>;
    handleSubmit(formEvent);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const url = editingMember 
        ? `/api/admin/members/${editingMember.id}`
        : '/api/admin/members';
      
      const method = editingMember ? 'PATCH' : 'POST';
      
     
      const requestData: any = {
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        status: newMember.status,
        phone: newMember.phone,
        notes: newMember.notes,
      };
      
     
      if (newMember.role === 'member') {
        requestData.membershipType = newMember.membershipType || 'flex';
      }
      
     
      if (!editingMember || newMember.password) {
        requestData.password = newMember.password;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save member');
      }

      const data = await response.json();
      
      if (editingMember) {
       
        setMembers(prev => prev.map(member => 
          member.id === editingMember.id 
            ? { 
                ...member, 
                ...data, 
                name: data.name || member.name, 
                email: data.email || member.email,
                membershipType: data.membershipType || member.membershipType || 'flex',
                plan: data.membershipType || member.plan || 'Flex'
              }
            : member
        ));
      } else {
       
        const newMemberData: Member = {
          id: data.id,
          name: data.name,
          email: data.email,
          membership: 'active',
          status: data.status || 'active',
          membershipType: data.membershipType || 'flex',
          joinDate: data.joinDate || new Date().toISOString(),
          lastVisit: data.lastVisit || new Date().toISOString(),
          plan: data.membershipType || 'Flex',
          phone: data.phone || '',
          role: data.role || 'member',
          notes: data.notes || ''
        };
        setMembers(prev => [newMemberData, ...prev]);
      }
      
     
      setNewMember({
        name: '',
        email: '',
        phone: '',
        membershipType: 'flex',
        status: 'active',
        joinDate: new Date().toISOString(),
        lastVisit: '',
        notes: '',
        password: '',
        confirmPassword: '',
        role: 'member',
        id: ''
      });
      
      setEditingMember(null);
      setIsAddMemberOpen(false);
      
      toast.success(`Member ${editingMember ? 'updated' : 'added'} successfully`);
    } catch (error) {
      console.error(`Error ${editingMember ? 'updating' : 'creating'} member:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${editingMember ? 'update' : 'add'} member`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    validateForm(e);
  };

  interface Plan {
    id: string;
    name: string;
    type: string;
    price: number;
    active?: boolean;
  }

  const plans: Plan[] = [
    { id: 'basic', name: 'Basic', type: 'hotdesk', price: 99, active: true },
    { id: 'premium', name: 'Premium', type: 'dedicated', price: 199, active: true },
    { id: 'enterprise', name: 'Enterprise', type: 'office', price: 499, active: false }
  ].filter((plan): plan is Plan & { active: true } => plan.active === true);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Membership', 'Status', 'Last Visit', 'Join Date', 'Phone'];
    
   
    const csvContent = [
      headers.join(','),
      ...filteredMembers.map(member => [
        `"${member.name}"`,
        `"${member.email}"`,
        `"${plans.find(p => p.type === member.membershipType)?.name || member.membershipType}"`,
        `"${member.status}"`,
        `"${member.lastVisit ? format(new Date(member.lastVisit), 'MMM d, yyyy') : 'Never'}"`,
        `"${format(new Date(member.joinDate), 'MMM d, yyyy')}"`,
        `"${member.phone || ''}"`
      ].join(','))
    ].join('\n');

   
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
   
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-muted-foreground">
            Manage your coworking space members and their memberships
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsAddMemberOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search members..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <select
                      id="status-filter"
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="membership-filter">Membership Type</Label>
                    <select
                      id="membership-filter"
                      value={filters.membershipType}
                      onChange={(e) => setFilters({...filters, membershipType: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">All Types</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.type}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFilters({ status: '', membershipType: '' })}
                    >
                      Reset
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToCSV}
              >
                Export
              </Button>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  {plans.find(p => p.type === member.membershipType)?.name || member.membershipType}
                </TableCell>
                <TableCell>
                  {getStatusBadge(member.membership)}
                </TableCell>
                <TableCell>
                  {member.lastVisit ? format(new Date(member.lastVisit), 'MMM d, yyyy') : 'Never'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {getMemberActions(member).map((action) => (
                        <DropdownMenuItem 
                          key={action.name}
                          onSelect={(e) => {
                            e.preventDefault();
                            if (action.action === 'activate') {
                              handleStatusUpdate(member.id, 'active');
                            } else if (action.action === 'suspend') {
                              handleStatusUpdate(member.id, 'suspended');
                            } else if (action.action === 'cancel') {
                              handleStatusUpdate(member.id, 'cancelled');
                            }
                          }}
                          disabled={updatingMemberId === member.id}
                          className="flex items-center gap-2"
                        >
                          {updatingMemberId === member.id && action.name.toLowerCase() === member.status ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            action.icon
                          )}
                          {action.name}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem 
                        onClick={() => {
                          setEditingMember(member);
                          setIsAddMemberOpen(true);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(member)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNewMemberSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newMember.name || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newMember.email || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              {!editingMember && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={newMember.password || ''}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required={!editingMember}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="confirmPassword" className="text-right">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={newMember.confirmPassword || ''}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required={!editingMember}
                    />
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role <span className="text-red-500">*</span>
                </Label>
                <select
                  id="role"
                  name="role"
                  value={newMember.role || 'member'}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value as any})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="member">Member</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {newMember.role === 'member' && (
                <div className="space-y-2">
                  <Label htmlFor="membershipType">Membership Plan</Label>
                  <select
                    id="membershipType"
                    name="membershipType"
                    value={newMember.membershipType}
                    onChange={(e) => setNewMember({...newMember, membershipType: e.target.value as MembershipType})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {plans.length > 0 ? (
                      plans.map((plan) => (
                        <option key={plan.id} value={plan.type}>
                          {plan.name} (${plan.price}/month)
                        </option>
                      ))
                    ) : (
                      <option value="flex">Flex Plan</option>
                    )}
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={newMember.phone || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right mt-2">
                  Notes
                </Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newMember.notes || ''}
                  onChange={(e) => setNewMember({...newMember, notes: e.target.value})}
                  className="col-span-3 flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddMemberOpen(false);
                  setEditingMember(null);
                  setNewMember({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'member',
                    phone: '',
                    status: 'active',
                    membershipType: 'flex',
                    joinDate: new Date().toISOString(),
                    lastVisit: new Date().toISOString(),
                    notes: ''
                  });
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingMember ? 'Updating...' : 'Creating...'}
                  </>
                ) : editingMember ? (
                  'Update Member'
                ) : (
                  'Add Member'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete {memberToDelete?.name}'s account and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
