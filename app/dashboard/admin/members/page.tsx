"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { UserPlus, Settings, EllipsisVertical, Search, CheckCircle, XCircle } from "lucide-react";

import { ReactNode, MouseEvent, ChangeEvent } from 'react';

// Define prop types for components
interface DashboardLayoutProps {
  children: ReactNode;
  userRole: string;
  onNavigate: (path: string) => void;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
}

interface InputProps {
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

interface DropdownMenuProps {
  children: ReactNode;
}

interface DropdownMenuTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

interface DropdownMenuLabelProps {
  children: ReactNode;
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface DialogHeaderProps {
  children: ReactNode;
}

interface DialogTitleProps {
  children: ReactNode;
}

interface DialogDescriptionProps {
  children: ReactNode;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

interface TableProps {
  children: ReactNode;
}

interface TableHeaderProps {
  children: ReactNode;
}

interface TableBodyProps {
  children: ReactNode;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}

// Mock components with proper TypeScript types
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  userRole, 
  onNavigate 
}) => (
  <div className="flex min-h-screen">
    {/* Sidebar */}
    <aside className="w-64 p-6 bg-white border-r">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
      <nav className="space-y-4">
        {/* Navigation buttons */}
        <Button onClick={() => onNavigate('members')} className="w-full justify-start" variant="ghost">Members</Button>
        <Button onClick={() => onNavigate('settings')} className="w-full justify-start" variant="ghost">Settings</Button>
      </nav>
    </aside>
    {/* Main Content */}
    <main className="flex-1 p-8 bg-gray-100">
      {children}
    </main>
  </div>
);

// Mock `shadcn/ui` components to make this code runnable
const Badge = ({ 
  variant = 'default', 
  children, 
  className = '' 
}: BadgeProps) => {
  const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-red-500 text-white hover:bg-red-600',
    outline: 'text-foreground'
  } as const;
  
  return (
    <span className={`${baseClasses} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = '' }: CardProps) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: CardHeaderProps) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: CardTitleProps) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }: CardDescriptionProps) => (
  <p className={`text-sm text-gray-500 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }: CardContentProps) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Table = ({ children }: TableProps) => (
  <div className="w-full overflow-auto">
    <table className="w-full caption-bottom text-sm">
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }: TableHeaderProps) => (
  <thead className="[&_tr]:border-b">
    {children}
  </thead>
);

const TableBody = ({ children }: TableBodyProps) => (
  <tbody className="[&_tr:last-child]:border-0">
    {children}
  </tbody>
);

const TableRow = ({ children, className = '' }: TableRowProps) => (
  <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>
    {children}
  </tr>
);

const TableHead = ({ children, className = '' }: TableHeadProps) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`}>
    {children}
  </th>
);

const TableCell = ({ children, className = '', colSpan }: TableCellProps) => (
  <td 
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    colSpan={colSpan}
  >
    {children}
  </td>
);

const Button = ({ 
  variant = 'default', 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button',
  ...props 
}: ButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";
  
  const variants = {
    default: "bg-indigo-600 text-white shadow hover:bg-indigo-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "bg-red-600 text-white shadow hover:bg-red-700",
    outline: "border border-input bg-white shadow-sm hover:bg-gray-50",
    ghost: "hover:bg-gray-100"
  } as const;
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant] || variants.default} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  placeholder = '', 
  value, 
  onChange, 
  className = '' 
}: InputProps) => (
  <input 
    type="text" 
    placeholder={placeholder} 
    value={value} 
    onChange={onChange} 
    className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`} 
  />
);

const DropdownMenu = ({ children }: DropdownMenuProps) => <div>{children}</div>;

const DropdownMenuTrigger = ({ children, asChild }: DropdownMenuTriggerProps) => (
  <div>{children}</div>
);

const DropdownMenuContent = ({ 
  children, 
  align = 'start' 
}: DropdownMenuContentProps) => (
  <div className="z-50 w-48 rounded-md border bg-white p-1 shadow-md">
    {children}
  </div>
);

const DropdownMenuItem = ({ 
  children, 
  onClick, 
  className = '' 
}: DropdownMenuItemProps) => (
  <div 
    onClick={onClick} 
    className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100 ${className}`}
  >
    {children}
  </div>
);

const DropdownMenuLabel = ({ children }: DropdownMenuLabelProps) => (
  <div className="px-2 py-1.5 text-sm font-semibold">
    {children}
  </div>
);

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className = '' }: DialogContentProps) => (
  <div className={className}>
    {children}
  </div>
);

const DialogHeader = ({ children }: DialogHeaderProps) => (
  <div className="flex flex-col space-y-1.5 text-center sm:text-left">
    {children}
  </div>
);

const DialogTitle = ({ children }: DialogTitleProps) => (
  <h2 className="text-lg font-semibold leading-none tracking-tight">
    {children}
  </h2>
);

const DialogDescription = ({ children }: DialogDescriptionProps) => (
  <p className="text-sm text-gray-500">
    {children}
  </p>
);

const DialogFooter = ({ children, className = '' }: DialogFooterProps) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>
    {children}
  </div>
);


// Data types
interface Member {
  id: string;
  name: string;
  email: string;
  membership: 'active' | 'suspended' | 'cancelled';
  lastVisit: string;
  joinDate: string;
  plan: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  phone?: string;
  membershipType?: 'flex' | 'dedicated' | 'team' | 'enterprise';
  notes?: string;
}

interface MemberFormData {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'flex' | 'dedicated' | 'team' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  joinDate: string;
  lastVisit: string;
  notes: string;
}

const mockMembers: Member[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', membership: 'active', joinDate: '2023-01-15', lastVisit: '', plan: '', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', membership: 'active', joinDate: '2023-02-20', lastVisit: '', plan: '', status: 'active' },
  { id: '3', name: 'Peter Jones', email: 'peter.jones@example.com', membership: 'suspended', joinDate: '2023-03-10', lastVisit: '', plan: '', status: 'suspended' },
  { id: '4', name: 'Sarah Lee', email: 'sarah.lee@example.com', membership: 'cancelled', joinDate: '2023-04-05', lastVisit: '', plan: '', status: 'inactive' },
  { id: '5', name: 'Michael Brown', email: 'michael.brown@example.com', membership: 'active', joinDate: '2023-05-12', lastVisit: '', plan: '', status: 'active' },
];

const getStatusBadge = (status: Member['membership']) => {
  switch (status) {
    case 'active':
      return <Badge variant="default">Active</Badge>;
    case 'suspended':
      return <Badge variant="destructive">Suspended</Badge>;
    case 'cancelled':
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return null;
  }
};

const getMemberActions = (member: Member) => {
  const actions = [];
  if (member.membership !== 'active') {
    actions.push({ name: 'Activate', icon: <CheckCircle className="h-4 w-4 mr-2" /> });
  }
  if (member.membership !== 'suspended') {
    actions.push({ name: 'Suspend', icon: <XCircle className="h-4 w-4 mr-2" /> });
  }
  if (member.membership !== 'cancelled') {
    actions.push({ name: 'Cancel', icon: <XCircle className="h-4 w-4 mr-2" /> });
  }
  return actions;
};

// Main component, combining the original `MembersPage` and `MembersContent`
export default function AdminMembersPage() {
  const [isClient, setIsClient] = useState(false);
  
  // State for members list
  const [members, setMembers] = useState<Member[] | null>(null);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [dialogAction, setDialogAction] = useState<'activate' | 'suspend' | 'cancel' | null>(null);
  
  // State for dialogs
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false);
  const [deleteMemberDialogOpen, setDeleteMemberDialogOpen] = useState(false);
  const [viewMemberDialogOpen, setViewMemberDialogOpen] = useState(false);
  
  // State for form data
  const [memberForm, setMemberForm] = useState<MemberFormData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    membershipType: 'flex',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
    lastVisit: '',
    notes: ''
  });
  
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  const handleAction = (member: Member, action: 'activate' | 'suspend' | 'cancel') => {
    setSelectedMember(member);
    setDialogAction(action);
    setShowDialog(true);
  };

  const confirmAction = () => {
    if (selectedMember && dialogAction && members) {
      const updatedMembers = members.map(member => {
        if (member.id === selectedMember.id) {
          let newStatus: Member['status'] = 'active';
          if (dialogAction === 'suspend') {
            newStatus = 'suspended';
          } else if (dialogAction === 'cancel') {
            newStatus = 'inactive';
          }
          return { ...member, status: newStatus };
        }
        return member;
      });
      setMembers(updatedMembers);
      setFilteredMembers(updatedMembers);
    }
    setShowDialog(false);
    setSelectedMember(null);
    setDialogAction(null);
  };

  // Load data on client side
  useEffect(() => {
    setIsClient(true);
    // Simulate API call
    const timer = setTimeout(() => {
      const membersData = [...mockMembers]; // Create a copy of mock data
      setMembers(membersData);
      setFilteredMembers(membersData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle search and filter
  useEffect(() => {
    if (!members || !Array.isArray(members)) return;
    
    let result = [...members];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(member => 
        member?.name?.toLowerCase().includes(term) || 
        member?.email?.toLowerCase().includes(term) ||
        (member?.phone && member.phone.includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(member => member?.status === statusFilter);
    }
    
    setFilteredMembers(result);
  }, [searchTerm, statusFilter, members]);

  // Show loading state if not mounted or still loading
  if (!isClient || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole="admin" onNavigate={() => {}}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Members</h1>
            <p className="text-muted-foreground">
              Manage your coworking space members
            </p>
          </div>
          <Button onClick={() => setAddMemberDialogOpen(true)}>
            Add Member
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
              <div className="flex-1">
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!members ? (
              <p className="text-center text-gray-500">Failed to load members</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Membership</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length > 0 ? (
                    (filteredMembers || []).map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{getStatusBadge(member.membership)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              {getMemberActions(member).map((action, index) => (
                                <DropdownMenuItem key={index} onClick={() => handleAction(member, action.name.toLowerCase() as any)}>
                                  {action.icon}
                                  {action.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No members found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {dialogAction} {selectedMember?.name}'s membership?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={dialogAction === 'cancel' ? 'destructive' : 'default'} 
              onClick={confirmAction}
            >
              {dialogAction === 'activate' ? 'Activate' : dialogAction === 'suspend' ? 'Suspend' : 'Cancel'} Membership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}