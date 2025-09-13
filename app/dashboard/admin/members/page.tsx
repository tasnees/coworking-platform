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
type MemberStatus = 'active' | 'suspended' | 'cancelled';

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
}

// Badge component for member status
const Badge = ({ variant, children }: { variant: 'default' | 'destructive' | 'outline', children: React.ReactNode }) => {
  const variantClasses = {
    default: 'bg-green-100 text-green-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'bg-gray-100 text-gray-800 border border-gray-300'
  };

  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </div>
  );
};

const getStatusBadge = (status: MembershipStatus) => {
  switch (status) {
    case 'active':
      return <Badge variant="default">Active</Badge>;
    case 'suspended':
      return <Badge variant="destructive">Suspended</Badge>;
    case 'cancelled':
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getMemberActions = (member: Member) => {
  const actions = [];
  
  if (member.status !== 'active') {
    actions.push({ 
      name: 'Activate', 
      icon: <CheckCircle className="h-4 w-4 mr-2" />, 
      action: 'activate',
      variant: 'default'
    });
  }
  if (member.status !== 'suspended') {
    actions.push({ 
      name: 'Suspend', 
      icon: <XCircle className="h-4 w-4 mr-2" />, 
      action: 'suspend',
      variant: 'warning'
    });
  }
  if (member.status !== 'cancelled' && member.status !== 'inactive') {
    actions.push({ 
      name: 'Cancel', 
      icon: <XCircle className="h-4 w-4 mr-2" />, 
      action: 'cancel',
      variant: 'destructive'
    });
  }
  return actions;
};

// Main component, combining the original `MembersPage` and `MembersContent`
export default function AdminMembersPage() {
  const router = useRouter();
  
  // State for members and filtering
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for loading and updating
  const [isLoading, setIsLoading] = useState(true);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  
  // State for dialogs and member operations
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'activate' | 'suspend' | 'cancel' | null>(null);
  
  // State for member data
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Fetch members from the API
  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/members');
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
      setFilteredMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handle member status update
  const handleStatusUpdate = async (memberId: string, newStatus: MemberStatus) => {
    try {
      setUpdatingMemberId(memberId);
      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update member status');
      
      // Update the local state
      setMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === memberId 
            ? { ...member, status: newStatus, membership: newStatus } 
            : member
        )
      );
      
      toast.success(`Member status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating member status:', error);
      toast.error('Failed to update member status');
    } finally {
      setUpdatingMemberId(null);
    }
  };
  
  // State for form data
  // State for new member form
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // State for member form data
  const [memberForm, setMemberForm] = useState<MemberFormData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    membershipType: 'flex',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
    lastVisit: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleAction = (member: Member, action: 'activate' | 'suspend' | 'cancel') => {
    setSelectedMemberId(member.id);
    setDialogAction(action);
    setShowDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedMemberId || !dialogAction) return;
    
    try {
      setUpdatingMemberId(selectedMemberId);
      
      // Map dialog action to status
      const statusMap = {
        activate: 'active',
        suspend: 'suspended',
        cancel: 'cancelled'
      } as const;
      
      const newStatus = statusMap[dialogAction];
      
      // Update member status via API
      await handleStatusUpdate(selectedMemberId, newStatus);
      
      setFilteredMembers(prev => 
        prev.map(member => 
          member.id === selectedMemberId 
            ? { ...member, status: newStatus, membership: newStatus } 
            : member
        )
      );
      
    } catch (error) {
      console.error('Error updating member status:', error);
    } finally {
      setSelectedMemberId(null);
      setDialogAction(null);
      setShowDialog(false);
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
      
      if (!response.ok) throw new Error('Failed to delete member');
      
      // Update local state
      setMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      setFilteredMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      
      toast.success('Member deleted successfully');
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    } finally {
      setIsDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };


  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!newMember.name.trim()) errors.name = 'Name is required';
    if (!newMember.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newMember.email)) {
      errors.email = 'Email is invalid';
    }
    if (!newMember.password) {
      errors.password = 'Password is required';
    } else if (newMember.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (newMember.password !== newMember.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleNewMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormErrors({});
      
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newMember.name,
          email: newMember.email,
          password: newMember.password,
          role: 'member',
          status: 'active'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create member');
      }
      
      // Reset form
      setNewMember({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // Close the dialog
      setIsAddMemberOpen(false);
      
      // Refresh the members list
      await fetchMembers();
      
      toast.success('Member created successfully');
    } catch (error) {
      console.error('Error creating member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberSubmit = async (data: MemberFormData) => {
    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create member');
      
      // Refresh the members list to get the complete member data from the server
      const newMember = await response.json();
      setMembers(prev => [...prev, newMember]);
      setFilteredMembers(prev => [...prev, newMember]);
      toast.success('Member created successfully');
    } catch (error) {
      console.error('Error creating member:', error);
      toast.error('Failed to create member');
    } finally {
      setIsAddMemberOpen(false);
      setEditingMember(null);
    }
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
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <Button onClick={() => setIsAddMemberOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Add Member
          </Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new member account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleNewMemberSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  placeholder="John Doe"
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  placeholder="john@example.com"
                  className={formErrors.email ? 'border-red-500' : ''}
                />
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newMember.password}
                  onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                  placeholder="••••••••"
                  className={formErrors.password ? 'border-red-500' : ''}
                />
                {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={newMember.confirmPassword}
                  onChange={(e) => setNewMember({...newMember, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                  className={formErrors.confirmPassword ? 'border-red-500' : ''}
                />
                {formErrors.confirmPassword && <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>}
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddMemberOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : 'Create Member'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
              <Button variant="outline" size="sm">
                Filter
              </Button>
              <Button variant="outline" size="sm">
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
                <TableCell>{member.plan}</TableCell>
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

      {isAddMemberOpen && (
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Add your form fields here */}
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right">Name</label>
                  <Input
                    id="name"
                    defaultValue={editingMember?.name || ''}
                    className="col-span-3"
                  />
                </div>
                {/* Add more form fields as needed */}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete {memberToDelete?.name}'s account and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}