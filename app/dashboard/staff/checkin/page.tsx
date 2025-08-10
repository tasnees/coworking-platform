"use client"
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, User, Clock, CheckCircle, LogOut, LogIn, AlertCircle, Calendar, Users, TrendingUp, Clock3 } from 'lucide-react'
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
export default function StaffCheckInPage() {
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>(() => [])
  const [members, setMembers] = useState<Member[]>(() => [])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked-in' | 'checked-out'>('all')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showCheckInDialog, setShowCheckInDialog] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [location, setLocation] = useState('Main Space')
  // Initialize client-side data and timer
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return
    
    setIsClient(true)
    
    // Simulate API call
    const loadData = () => {
      try {
        const mockMembers: Member[] = [
          { id: '1', name: 'Alice Johnson', email: 'alice@company.com', membershipType: 'premium', status: 'active', totalVisits: 45, lastVisit: new Date('2024-07-27') },
          { id: '2', name: 'Bob Smith', email: 'bob@startup.io', membershipType: 'basic', status: 'active', totalVisits: 12, lastVisit: new Date('2024-07-25') },
          { id: '3', name: 'Carol Williams', email: 'carol@tech.co', membershipType: 'enterprise', status: 'active', totalVisits: 89, lastVisit: new Date('2024-07-28') },
          { id: '4', name: 'David Brown', email: 'david@design.com', membershipType: 'premium', status: 'active', totalVisits: 34, lastVisit: new Date('2024-07-26') },
          { id: '5', name: 'Emma Davis', email: 'emma@freelance.net', membershipType: 'basic', status: 'active', totalVisits: 8, lastVisit: new Date('2024-07-28') },
        ]
        const mockCheckIns: CheckInRecord[] = [
          { id: 'ci1', memberId: '1', memberName: 'Alice Johnson', memberEmail: 'alice@company.com', membershipType: 'premium', checkInTime: new Date('2024-07-28T08:30:00'), status: 'checked-in', location: 'Main Space' },
          { id: 'ci2', memberId: '3', memberName: 'Carol Williams', memberEmail: 'carol@tech.co', membershipType: 'enterprise', checkInTime: new Date('2024-07-28T09:15:00'), checkOutTime: new Date('2024-07-28T12:30:00'), duration: '3h 15m', status: 'checked-out', location: 'Meeting Room A' },
          { id: 'ci3', memberId: '5', memberName: 'Emma Davis', memberEmail: 'emma@freelance.net', membershipType: 'basic', checkInTime: new Date('2024-07-28T10:00:00'), status: 'checked-in', location: 'Quiet Zone' },
        ]
        setMembers(mockMembers)
        setCheckIns(mockCheckIns)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setIsLoading(false)
      }
    }

    loadData()
    
    // Set up timer only on client
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  // Moved timer to the initialization effect
  const handleCheckIn = (member: Member, location: string) => {
    const newCheckIn: CheckInRecord = {
      id: `ci${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      memberEmail: member.email,
      membershipType: member.membershipType,
      checkInTime: new Date(),
      status: 'checked-in',
      location,
    }
    setCheckIns(prev => [newCheckIn, ...prev])
    setShowCheckInDialog(false)
  }
  const handleCheckOut = (checkIn: CheckInRecord) => {
    const checkOutTime = new Date()
    const duration = calculateDuration(checkIn.checkInTime, checkOutTime)
    setCheckIns(prev => prev.map(ci => 
      ci.id === checkIn.id 
        ? { ...ci, checkOutTime, duration, status: 'checked-out' }
        : ci
    ))
  }
  const calculateDuration = (start: Date, end: Date): string => {
    const diff = end.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }
  // Add null checks and defensive programming
  const filteredMembers = (members || []).filter(member => {
    if (!member) return false;
    return member.status === 'active' &&
      (member.name?.toLowerCase().includes(searchTerm?.toLowerCase() || '') ||
       member.email?.toLowerCase().includes(searchTerm?.toLowerCase() || ''))
  })

  const filteredCheckIns = (checkIns || []).filter(checkIn => {
    if (!checkIn) return false;
    if (filterStatus === 'all') return true;
    return checkIn.status === filterStatus;
  })

  const currentCheckIns = (checkIns || []).filter(ci => ci?.status === 'checked-in')
  
  const todayCheckIns = (checkIns || []).filter(ci => {
    if (!isClient || !ci?.checkInTime) return false;
    try {
      return ci.checkInTime.toDateString() === new Date().toDateString()
    } catch (e) {
      console.error('Error filtering today\'s check-ins:', e)
      return false
    }
  })

  const totalDurationToday = (todayCheckIns || []).reduce((total, ci) => {
    try {
      if (!ci) return total;
      if (ci.checkOutTime) {
        return total + (new Date(ci.checkOutTime).getTime() - new Date(ci.checkInTime).getTime())
      }
      return total + (new Date().getTime() - new Date(ci.checkInTime).getTime())
    } catch (e) {
      console.error('Error calculating duration:', e)
      return total;
    }
  }, 0)
  const formatDuration = (ms: number): string => {
    if (!isClient) return '0h 0m';
    try {
      const hours = Math.floor(ms / (1000 * 60 * 60))
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours}h ${minutes}m`
    } catch (e) {
      console.error('Error formatting duration:', e)
      return '0h 0m'
    }
  }
  const getMembershipBadgeColor = (type: string) => {
    switch (type) {
      case 'basic': return 'bg-blue-100 text-blue-800'
      case 'premium': return 'bg-purple-100 text-purple-800'
      case 'enterprise': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'checked-in': return 'bg-green-100 text-green-800'
      case 'checked-out': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  // Show loading state during SSR/hydration
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    )
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
            {currentTime.toLocaleTimeString()}
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
                {filteredMembers.map(member => (
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
                        setSelectedMember(member)
                        setShowCheckInDialog(true)
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
                          Checked in {checkIn.checkInTime.toLocaleTimeString()}
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
                {filteredCheckIns.map(checkIn => (
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
                    <TableCell>{isClient ? checkIn.checkInTime.toLocaleTimeString() : '--:--:--'}</TableCell>
                    <TableCell>
                      {checkIn.checkOutTime ? (isClient ? checkIn.checkOutTime.toLocaleTimeString() : '--:--:--') : '-'}
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
  )
}
