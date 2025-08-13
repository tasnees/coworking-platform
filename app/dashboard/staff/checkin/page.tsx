'use client';

import { useState, useEffect } from "react";
import { format, isToday } from "date-fns";
import { Check, User, Clock, QrCode } from "lucide-react";
// Assuming DashboardLayout, Card, Table, and Button components are available
// from a UI library like shadcn/ui.
// For this self-contained example, we will create mock components.
// In a real Next.js app, you would import them from your component library.

// Define prop types for components
interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: string;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm';
}

interface TableProps {
  children: React.ReactNode;
}

interface TableHeaderProps {
  children: React.ReactNode;
}

interface TableBodyProps {
  children: React.ReactNode;
}

interface TableRowProps {
  children: React.ReactNode;
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
}

// Mock components to make this code runnable
const DashboardLayout = ({ children, userRole }: DashboardLayoutProps) => (
  <div className="p-6 bg-slate-50 min-h-screen">
    <div className="max-w-7xl mx-auto">{children}</div>
  </div>
);

const Card = ({ children, className = "" }: CardProps) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: CardHeaderProps) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: CardTitleProps) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = "" }: CardDescriptionProps) => (
  <p className={`text-sm text-muted-foreground ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = "" }: CardContentProps) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  className = "", 
  variant = 'default', 
  size = 'default',
  ...props 
}: ButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  } as const;
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
  } as const;
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

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

const TableRow = ({ children }: TableRowProps) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    {children}
  </tr>
);

const TableHead = ({ children, className = "" }: TableHeadProps) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>
    {children}
  </th>
);

const TableCell = ({ children, className = "", colSpan }: TableCellProps) => (
  <td 
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    colSpan={colSpan}
  >
    {children}
  </td>
);

const Badge = ({ children, variant = 'default' }: BadgeProps) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "text-foreground",
  } as const;
  
  return (
    <span className={`${baseClasses} ${variants[variant]}`}>
      {children}
    </span>
  );
};


// Data types
interface CheckInHistory {
  id: string;
  memberId: string;
  memberName: string;
  timestamp: string;
  location: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  status: 'checkedIn' | 'checkedOut' | 'absent';
}

const mockCheckInHistory: CheckInHistory[] = [
  { id: '1', memberId: 'm1', memberName: 'John Doe', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), location: 'Main Desk' },
  { id: '2', memberId: 'm2', memberName: 'Jane Smith', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), location: 'Lobby Kiosk' },
  { id: '3', memberId: 'm3', memberName: 'Peter Jones', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), location: 'Main Desk' },
  { id: '4', memberId: 'm1', memberName: 'John Doe', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), location: 'Lobby Kiosk' },
];

const mockMembers: Member[] = [
  { id: 'm1', name: 'John Doe', email: 'john.doe@example.com', status: 'checkedIn' },
  { id: 'm2', name: 'Jane Smith', email: 'jane.smith@example.com', status: 'checkedIn' },
  { id: 'm3', name: 'Peter Jones', email: 'peter.jones@example.com', status: 'checkedIn' },
  { id: 'm4', name: 'Sarah Lee', email: 'sarah.lee@example.com', status: 'checkedOut' },
  { id: 'm5', name: 'Michael Brown', email: 'michael.brown@example.com', status: 'checkedOut' },
];

// Helper function to safely get array length
const getSafeLength = (arr: any[] | undefined): number => {
  return Array.isArray(arr) ? arr.length : 0;
}

export default function StaffCheckinPage() {
  const [checkedInToday, setCheckedInToday] = useState<CheckInHistory[]>([]);
  const [totalCheckins, setTotalCheckins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only run on client side
    setIsClient(true);
    
    // This effect runs on the client after the component mounts
    setLoading(true);
    
    // Simulate fetching data
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        setMembers(mockMembers);
        const todayCheckins = mockCheckInHistory.filter(item => isToday(new Date(item.timestamp)));
        setCheckedInToday(todayCheckins);
        setTotalCheckins(getSafeLength(todayCheckins));
        setLoading(false);
      }
    }, 1000);
  }, []);
  
  // Show loading state until component is mounted on client
  if (typeof window === 'undefined' || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusBadge = (status: Member['status']) => {
    switch (status) {
      case 'checkedIn':
        return <Badge variant="default">Checked In</Badge>;
      case 'checkedOut':
        return <Badge variant="secondary">Checked Out</Badge>;
      default:
        return <Badge variant="outline">Absent</Badge>;
    }
  };

  const getFormattedTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  return (
    <DashboardLayout userRole="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Member Check-in</h1>
            <p className="text-muted-foreground">Manage member check-ins and view activity</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checked-in Today</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCheckins}</div>
              <p className="text-xs text-muted-foreground">
                {members.filter(m => m.status === 'checkedIn').length} members currently checked-in
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">
                Total registered members
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manual Check-in</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Manual Check-in
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Code Check-in</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Open QR Scanner
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Check-ins Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
            <CardDescription>
              A list of members who have checked in today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkedInToday.length > 0 ? (
                    checkedInToday.map((checkin) => (
                      <TableRow key={checkin.id}>
                        <TableCell>
                          <div className="font-medium">{checkin.memberName}</div>
                          <div className="text-sm text-muted-foreground">{members.find(m => m.id === checkin.memberId)?.email}</div>
                        </TableCell>
                        <TableCell>{getFormattedTime(checkin.timestamp)}</TableCell>
                        <TableCell>{checkin.location}</TableCell>
                        <TableCell>{getStatusBadge('checkedIn')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No members have checked in today.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Member Status Table */}
        <Card>
          <CardHeader>
            <CardTitle>Member Status</CardTitle>
            <CardDescription>
              Current check-in status for all registered members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}