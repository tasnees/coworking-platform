"use client"
import { useState, useEffect, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, User, Clock, CheckCircle, LogOut, LogIn, AlertCircle, Calendar, Users, TrendingUp, Clock3 } from 'lucide-react'

// Dynamically import the DashboardLayout to ensure it's only rendered on the client.
const DashboardLayout = dynamic(() => import('@/components/dashboard-layout'), { ssr: false });

// Types
interface CheckInRecord {
  id: string
  memberId: string
  memberName: string
  memberEmail: string
  membershipType: 'basic' | 'premium' | 'enterprise'
  checkInTime: Date
  checkOutTime?: Date
  duration?: string
  status: 'checked-in' | 'checked-out'
  location: string
  notes?: string
}

interface Member {
  id: string
  name: string
  email: string
  membershipType: 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'inactive' | 'suspended'
  lastVisit?: Date
  totalVisits: number
}

// Mock data
const mockMembers: Member[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@company.com', membershipType: 'premium', status: 'active', totalVisits: 45, lastVisit: new Date('2024-07-27') },
  { id: '2', name: 'Bob Smith', email: 'bob@startup.io', membershipType: 'basic', status: 'active', totalVisits: 12, lastVisit: new Date('2024-07-25') },
  { id: '3', name: 'Carol Williams', email: 'carol@tech.co', membershipType: 'enterprise', status: 'active', totalVisits: 89, lastVisit: new Date('2024-07-28') },
  { id: '4', name: 'David Brown', email: 'david@design.com', membershipType: 'premium', status: 'active', totalVisits: 34, lastVisit: new Date('2024-07-26') },
  { id: '5', name: 'Emma Davis', email: 'emma@freelance.net', membershipType: 'basic', status: 'active', totalVisits: 8, lastVisit: new Date('2024-07-28') },
];

const mockCheckIns: CheckInRecord[] = [
  { id: 'ci1', memberId: '1', memberName: 'Alice Johnson', memberEmail: 'alice@company.com', membershipType: 'premium', checkInTime: new Date('2024-07-28T08:30:00'), status: 'checked-in', location: 'Main Space' },
  { id: 'ci2', memberId: '3', memberName: 'Carol Williams', memberEmail: 'carol@tech.co', membershipType: 'enterprise', checkInTime: new Date('2024-07-28T09:15:00'), checkOutTime: new Date('2024-07-28T12:30:00'), duration: '3h 15m', status: 'checked-out', location: 'Meeting Room A' },
  { id: 'ci3', memberId: '5', memberName: 'Emma Davis', memberEmail: 'emma@freelance.net', membershipType: 'basic', checkInTime: new Date('2024-07-28T10:00:00'), status: 'checked-in', location: 'Quiet Zone' },
];

export default function StaffCheckInPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked-in' | 'checked-out'>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null); // Start with null to handle SSR
  const [location, setLocation] = useState('Main Space');

  // Load data and set up timer on the client side only
  useEffect(() => {
    // We can assume we are on the client since this hook only runs there.
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        setMembers(mockMembers);
        setCheckIns(mockCheckIns);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    // Set up timer for current time
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = useCallback((member: Member, location: string) => {
    const newCheckIn: CheckInRecord = {
      id: `ci${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      memberEmail: member.email,
      membershipType: member.membershipType,
      checkInTime: new Date(),
      status: 'checked-in',
      location,
    };
    setCheckIns(prev => [newCheckIn, ...prev]);
    setShowCheckInDialog(false);
  }, []);

  const handleCheckOut = useCallback((checkIn: CheckInRecord) => {
    const checkOutTime = new Date();
    const duration = calculateDuration(checkIn.checkInTime, checkOutTime);
    setCheckIns(prev =>
      prev.map(ci =>
        ci.id === checkIn.id
          ? { ...ci, checkOutTime, duration, status: 'checked-out' }
          : ci
      )
    );
  }, []);

  const calculateDuration = (start: Date, end: Date): string => {
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Add null checks to the useMemo hooks to prevent the TypeError during SSR
  const filteredMembers = useMemo(() => {
    // Return empty array on server to prevent errors
    if (!members || !Array.isArray(members)) return [];

    const searchLower = searchTerm?.toLowerCase?.() || '';

    return members.filter(member => {
      if (!member) return false;
      if (!searchLower) return true;

      return member.status === 'active' &&
        ((member.name?.toLowerCase?.() || '').includes(searchLower) ||
         (member.email?.toLowerCase?.() || '').includes(searchLower));
    });
  }, [members, searchTerm]);

  const filteredCheckIns = useMemo(() => {
    if (!checkIns || !Array.isArray(checkIns)) return [];

    return checkIns.filter(checkIn => {
      if (!checkIn) return false;
      if (filterStatus === 'all') return true;
      return checkIn.status === filterStatus;
    });
  }, [checkIns, filterStatus]);

  const currentCheckIns = useMemo(() => {
    if (!checkIns || !Array.isArray(checkIns)) return [];
    return checkIns.filter(ci => ci && ci.status === 'checked-in');
  }, [checkIns]);

  const todayCheckIns = useMemo(() => {
    if (!checkIns || !Array.isArray(checkIns)) return [];
    const today = new Date().toDateString();
    return checkIns.filter(ci => {
      if (!ci?.checkInTime) return false;
      return new Date(ci.checkInTime).toDateString() === today;
    });
  }, [checkIns]);

  const totalDurationToday = useMemo(() => {
    if (!todayCheckIns || !Array.isArray(todayCheckIns)) return 0;

    return todayCheckIns.reduce((total, ci) => {
      if (!ci || !ci.checkInTime) return total;

      const startTime = new Date(ci.checkInTime);
      const endTime = ci.checkOutTime ? new Date(ci.checkOutTime) : new Date();

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.error('Invalid date encountered in check-in record:', ci);
        return total;
      }
      return total + (endTime.getTime() - startTime.getTime());
    }, 0);
  }, [todayCheckIns]);

  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getMembershipBadgeColor = (type: string) => {
    switch (type) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'checked-out': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
        <p className="text-muted-foreground mb-4 text-center">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  return (
    <DashboardLayout userRole="staff">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Member Check-in Management</h1>
            <p className="text-muted-foreground">Manage member check-ins and track workspace usage</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <Clock3 className="inline h-4 w-4 mr-1" />
            {currentTime?.toLocaleTimeString() || '--:--:--'}
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Checked In</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentCheckIns.length}</div>
              <p className="text-xs text-muted-foreground">Active members in space</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayCheckIns.length}</div>
              <p className="text-xs text-muted-foreground">Total visits today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(totalDurationToday)}</div>
              <p className="text-xs text-muted-foreground">Combined member hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">Total active members</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Check-in */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Check-in</CardTitle>
              <CardDescription>Search and check-in members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search member by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredMembers.map((member: Member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <Badge className={`text-xs ${getMembershipBadgeColor(member.membershipType)}`}>
                        {member.membershipType}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedMember(member);
                        setShowCheckInDialog(true);
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-1" />
                      Check In
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Current Check-ins */}
          <Card>
            <CardHeader>
              <CardTitle>Current Check-ins</CardTitle>
              <CardDescription>Members currently in the space</CardDescription>
            </CardHeader>
            <CardContent>
              {currentCheckIns.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No members currently checked in</p>
              ) : (
                <div className="space-y-2">
                  {currentCheckIns.map(checkIn => (
                    <div key={checkIn.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{checkIn.memberName}</p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          Checked in {checkIn.checkInTime?.toLocaleTimeString() || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <User className="inline h-3 w-3 mr-1" />
                          {checkIn.location}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCheckOut(checkIn)}
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Check Out
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Check-in History */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in History</CardTitle>
            <CardDescription>Today's check-in and check-out records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="checked-in">Checked In</SelectItem>
                  <SelectItem value="checked-out">Checked Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Check-in Time</TableHead>
                  <TableHead>Check-out Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCheckIns.map((checkIn: CheckInRecord) => (
                  <TableRow key={checkIn.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{checkIn.memberName}</p>
                        <p className="text-sm text-muted-foreground">{checkIn.memberEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getMembershipBadgeColor(checkIn.membershipType)}`}>
                        {checkIn.membershipType}
                      </Badge>
                    </TableCell>
                    <TableCell>{checkIn.checkInTime?.toLocaleTimeString() || '--:--:--'}</TableCell>
                    <TableCell>
                      {checkIn.checkOutTime ? checkIn.checkOutTime.toLocaleTimeString() : '-'}
                    </TableCell>
                    <TableCell>{checkIn.duration || '-'}</TableCell>
                    <TableCell>{checkIn.location}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusBadgeColor(checkIn.status)}`}>
                        {checkIn.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Check-in Dialog */}
        <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Check In Member</DialogTitle>
              <DialogDescription>
                Select location for {selectedMember?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Button
                className="w-full justify-start"
                onClick={() => selectedMember && handleCheckIn(selectedMember, 'Main Space')}
              >
                <User className="h-4 w-4 mr-2" />
                Main Space
              </Button>
              <Button
                className="w-full justify-start"
                onClick={() => selectedMember && handleCheckIn(selectedMember, 'Quiet Zone')}
              >
                <User className="h-4 w-4 mr-2" />
                Quiet Zone
              </Button>
              <Button
                className="w-full justify-start"
                onClick={() => selectedMember && handleCheckIn(selectedMember, 'Meeting Room A')}
              >
                <User className="h-4 w-4 mr-2" />
                Meeting Room A
              </Button>
              <Button
                className="w-full justify-start"
                onClick={() => selectedMember && handleCheckIn(selectedMember, 'Phone Booth')}
              >
                <User className="h-4 w-4 mr-2" />
                Phone Booth
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCheckInDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}