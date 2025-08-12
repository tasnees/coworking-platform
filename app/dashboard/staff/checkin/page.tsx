'use client';

import { useState, useEffect } from "react";
import { format, isToday } from "date-fns";
import { Check, User, Clock, QrCode } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

export default function StaffCheckinPage() {
  const [checkedInToday, setCheckedInToday] = useState<CheckInHistory[]>([]);
  const [totalCheckins, setTotalCheckins] = useState(0);
  const [loading, setLoading] = useState(true);

  // Use an empty array as the initial state to prevent the TypeError
  const [members, setMembers] = useState<Member[]>([]);
  const [history, setHistory] = useState<CheckInHistory[]>([]);

  useEffect(() => {
    // This effect runs on the client after the component mounts
    setLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      setMembers(mockMembers);
      setHistory(mockCheckInHistory);
      const todayCheckins = mockCheckInHistory.filter(item => isToday(new Date(item.timestamp)));
      setCheckedInToday(todayCheckins);
      setTotalCheckins(todayCheckins.length);
      setLoading(false);
    }, 1000);
  }, []);

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
                  {/* FIX: The `key` prop is now correctly added to the TableRow element */}
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
                  {/* FIX: The `key` prop is now correctly added to the TableRow element */}
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