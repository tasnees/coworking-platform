"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Search, 
  Download, 
  Plus, 
  Trash2, 
  Edit, 
  QrCode, 
  Clock, 
  User, 
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

// Types
type CheckInStatus = 'checked-in' | 'checked-out' | 'expired' | 'pending';
type UserType = 'member' | 'guest' | 'staff';
type QrStatus = 'active' | 'inactive' | 'expired';
// Removed duplicate BadgeVariant type - using the one from UI components

interface CheckInLog {
  id: string;
  name: string;
  member: string;
  time: string;
  location: string;
  status: CheckInStatus;
  type: UserType;
  checkInTime: string;
  checkOutTime: string;
  duration: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

interface QrLocation {
  id: number;
  name: string;
  status: QrStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}



type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'success';

interface TodayStats {
  totalCheckIns: number;
  activeMembers: number;
  peakTime: string;
  averageStay: string;
}

// Mock data
const mockCheckInLogs: CheckInLog[] = [
  {
    id: '1',
    name: 'John Doe',
    member: 'John Doe',
    time: '2023-10-01T09:30:00Z',
    location: 'Main Entrance',
    status: 'checked-in',
    type: 'member',
    checkInTime: '2023-10-01T09:30:00Z',
    checkOutTime: '2023-10-01T17:30:00Z',
    duration: '8h 0m',
    email: 'john@example.com',
    phone: '+1234567890',
    createdAt: '2023-10-01T09:30:00Z',
    updatedAt: '2023-10-01T09:30:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    member: 'Jane Smith',
    time: '2023-10-01T10:00:00Z',
    location: 'Back Entrance',
    status: 'checked-out',
    type: 'guest',
    checkInTime: '2023-10-01T10:00:00Z',
    checkOutTime: '2023-10-01T12:00:00Z',
    duration: '2h 0m',
    email: 'jane@example.com',
    phone: '+9876543210',
    createdAt: '2023-10-01T10:00:00Z',
    updatedAt: '2023-10-01T12:00:00Z',
  }
];

const mockQrLocations: QrLocation[] = [
  {
    id: 1,
    name: 'Main Entrance',
    status: 'active',
    description: 'Main entrance QR code',
    createdAt: '2023-10-01T09:00:00Z',
    updatedAt: '2023-10-01T09:00:00Z'
  },
  {
    id: 2,
    name: 'Back Entrance',
    status: 'inactive',
    description: 'Back entrance QR code',
    createdAt: '2023-10-01T09:00:00Z',
    updatedAt: '2023-10-01T09:00:00Z'
  }
];

const mockTodayStats: TodayStats = {
  totalCheckIns: 42,
  activeMembers: 18,
  peakTime: '2:00 PM',
  averageStay: '3h 24m'
};

// Dynamically import the dashboard layout with SSR disabled
const DynamicDashboardLayout = dynamic(
  () => import("@/components/dashboard-layout"),
  { ssr: false }
);

const AdminCheckInPage = () => {
  const router = useRouter();
  
  // State
  const [checkInLogs, setCheckInLogs] = useState<CheckInLog[]>([]);
  const [qrLocations, setQrLocations] = useState<QrLocation[]>([]);
  const [viewLog, setViewLog] = useState<CheckInLog | null>(null);
  const [editQrLocation, setEditQrLocation] = useState<QrLocation | null>(null);
  const [deleteQrLocation, setDeleteQrLocation] = useState<QrLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<number | null>(null);

  // Initialize component
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setCheckInLogs(mockCheckInLogs);
        setQrLocations(mockQrLocations);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter logs based on search term
  const filteredLogs = useCallback(() => {
    if (!searchTerm.trim()) return checkInLogs;
    const term = searchTerm.toLowerCase();
    return checkInLogs.filter(
      (log) =>
        (log.name?.toLowerCase() || '').includes(term) ||
        (log.location?.toLowerCase() || '').includes(term) ||
        (log.status?.toLowerCase() || '').includes(term) ||
        (log.type?.toLowerCase() || '').includes(term)
    );
  }, [checkInLogs, searchTerm]);
  
  // Handle view log details
  const handleViewLogDetails = useCallback((log: CheckInLog) => {
    setViewLog(log);
  }, []);

  // Handle download PDF
  const handleDownloadPdf = useCallback((log: CheckInLog) => {
    // In a real app, this would generate and download a PDF
    console.log('Downloading PDF for:', log);
    toast({
      title: 'PDF Download',
      description: 'PDF download functionality will be implemented here.'
    });
  }, [toast]);
  
  // Handle saving QR location (add or update)
  const handleSaveQrLocation = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQrLocation.name.trim()) return;

    try {
      setIsLoading(true);
      
      if (editQrLocation) {
        // Update existing location
        setQrLocations((prev) =>
          prev.map((loc) =>
            loc.id === editQrLocation.id
              ? { 
                  ...loc, 
                  ...newQrLocation, 
                  updatedAt: new Date().toISOString() 
                }
              : loc
          )
        );
        toast({
          title: 'Success',
          description: 'QR location updated successfully',
        });
      } else {
        // Add new location
        const newLocation: QrLocation = {
          ...newQrLocation,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setQrLocations((prev) => [...prev, newLocation]);
        toast({
          title: 'Success',
          description: 'QR location added successfully',
        });
      }

      setIsQrDialogOpen(false);
      setEditQrLocation(null);
      setNewQrLocation({
        name: '',
        description: '',
        status: 'active',
        id: 0,
        createdAt: '',
        updatedAt: ''
      });
    } catch (error) {
      console.error('Error saving QR location:', error);
      toast({
        title: 'Error',
        description: 'Failed to save QR location',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [newQrLocation, editQrLocation, toast]);
  
  // Handle deleting QR location
  const handleDeleteQrLocation = useCallback(async () => {
    if (!deleteQrLocation) return;
    
    try {
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setQrLocations(prev => prev.filter(loc => loc.id !== deleteQrLocation.id));
      setDeleteQrLocation(null);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'QR location deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting QR location:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to delete QR location. Please try again.',
        variant: 'destructive'
      });
    }
  }, [deleteQrLocation, toast]);
  
  // Handle toggling QR location status
  const handleToggleQrStatus = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setQrLocations((prev) =>
        prev.map((loc) =>
          loc.id === id
            ? { ...loc, status: loc.status === 'active' ? 'inactive' : 'active' }
            : loc
        )
      );
      toast({
        title: 'Success',
        description: 'QR location status updated successfully',
      });
    } catch (error) {
      console.error('Error toggling QR status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update QR location status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Handle editing QR location
  const handleEditQrLocation = useCallback((location: QrLocation) => {
    setEditQrLocation(location);
    setNewQrLocation({
      name: location.name,
      status: location.status,
      description: location.description
    });
    setIsQrDialogOpen(true);
  }, []);
  
  // Handle opening new QR location dialog
  const handleOpenNewQrDialog = useCallback(() => {
    setEditQrLocation(null);
    setNewQrLocation({ name: '', status: 'active', description: '' });
    setIsQrDialogOpen(true);
  }, []);
  
  // Get status badge variant
  const getStatusBadgeVariant = useCallback((status: CheckInStatus) => {
    switch (status) {
      case 'checked-in':
        return 'default' as const;
      case 'checked-out':
        return 'outline' as const;
      case 'expired':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  }, []);

  // Handle toast notifications
  const showToast = useCallback((title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    toast({
      title,
      description,
      variant,
    });
  }, []);
  
  // Get user type badge variant
  const getUserTypeBadgeVariant = useCallback((type: UserType) => {
    return type === 'member' ? 'default' as const : 'outline' as const;
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <DynamicDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </DynamicDashboardLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <DynamicDashboardLayout>
        <div className="p-4 text-destructive">
          <p>{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </DynamicDashboardLayout>
    );
  }

  return (
    <DynamicDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Check-in Management</h1>
            <p className="text-muted-foreground">
              Manage check-ins and QR code locations
            </p>
          </div>
          <Button onClick={handleOpenNewQrDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add QR Location
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="qr-codes">QR Codes</TabsTrigger>
            <TabsTrigger value="logs">Check-in Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Check-ins Today
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockTodayStats.totalCheckIns}</div>
                  <p className="text-xs text-muted-foreground">
                    +20% from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockTodayStats.activeMembers}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently in the space
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockTodayStats.peakTime}</div>
                  <p className="text-xs text-muted-foreground">
                    Busiest time today
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Stay
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockTodayStats.averageStay}</div>
                  <p className="text-xs text-muted-foreground">
                    Average duration
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {checkInLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{log.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{new Date(log.time).toLocaleTimeString()}</span>
                          <span>•</span>
                          <span>{log.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeVariant(log.status)}>
                          {log.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLogDetails(log)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QR Codes Tab */}
          <TabsContent value="qr-codes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>QR Code Locations</CardTitle>
                  <Button onClick={handleOpenNewQrDialog} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Location
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {qrLocations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <QrCode className="h-4 w-4" />
                          <p className="font-medium">{location.name}</p>
                          <Badge 
                            variant={location.status === 'active' ? 'default' : 'outline'}
                            className="ml-2"
                          >
                            {location.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {location.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {new Date(location.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleQrStatus(location.id)}
                        >
                          {location.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQrLocation(location)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setLocationToDelete(location.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Check-in Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Check-in Logs</CardTitle>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search logs..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLogs().length > 0 ? (
                    filteredLogs().map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{log.name}</p>
                            <Badge variant={getUserTypeBadgeVariant(log.type)}>
                              {log.type}
                            </Badge>
                            <Badge variant={getStatusBadgeVariant(log.status)}>
                              {log.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>Location: {log.location}</p>
                            <p>Check-in: {new Date(log.checkInTime).toLocaleString()}</p>
                            {log.checkOutTime && (
                              <p>Check-out: {new Date(log.checkOutTime).toLocaleString()}</p>
                            )}
                            <p>Duration: {log.duration || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPdf(log)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLogDetails(log)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No check-in logs found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Location Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editQrLocation ? 'Edit QR Location' : 'Add New QR Location'}
            </DialogTitle>
            <DialogDescription>
              {editQrLocation 
                ? 'Update the QR location details.' 
                : 'Add a new QR code location for check-ins.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                placeholder="e.g., Main Entrance"
                value={newQrLocation.name}
                onChange={(e) => 
                  setNewQrLocation({...newQrLocation, name: e.target.value})
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newQrLocation.status}
                onChange={(e) =>
                  setNewQrLocation({
                    ...newQrLocation,
                    status: e.target.value as QrStatus,
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Optional description or notes"
                value={newQrLocation.description}
                onChange={(e) =>
                  setNewQrLocation({
                    ...newQrLocation,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsQrDialogOpen(false);
                setEditQrLocation(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveQrLocation} disabled={!newQrLocation.name}>
              {isLoading ? 'Saving...' : 'Save Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the QR location and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setLocationToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (locationToDelete !== null) {
                  handleDeleteQrLocation(locationToDelete);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Log Details Dialog */}
      <Dialog open={!!viewLog} onOpenChange={(open) => !open && setViewLog(null)}>
        <DialogContent>
          {viewLog && (
            <>
              <DialogHeader>
                <DialogTitle>Check-in Details</DialogTitle>
                <DialogDescription>
                  Detailed information about this check-in
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">{viewLog.name}</h4>
                  <div className="flex items-center space-x-2 text-sm">
                    <Badge variant={getUserTypeBadgeVariant(viewLog.type)}>
                      {viewLog.type}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(viewLog.status)}>
                      {viewLog.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{viewLog.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in Time:</span>
                    <span>{new Date(viewLog.checkInTime).toLocaleString()}</span>
                  </div>
                  {viewLog.checkOutTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out Time:</span>
                      <span>{new Date(viewLog.checkOutTime).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{viewLog.duration || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPdf(viewLog)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button onClick={() => setViewLog(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DynamicDashboardLayout>
  );
};

// State for QR location management
const [newQrLocation, setNewQrLocation] = useState<Omit<QrLocation, 'id' | 'createdAt' | 'updatedAt'>>({ 
  name: '',
  status: 'active',
  description: ''
});

const [editQrDialogId, setEditQrDialogId] = useState<number | null>(null);
const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

const handleSaveQrLocation = useCallback(async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newQrLocation.name.trim()) return;

  try {
    setIsLoading(true);
    
    if (editQrDialogId !== null && editQrLocation) {
      // Update existing location
      setQrLocations((prev) =>
        prev.map((loc) =>
          loc.id === editQrDialogId
            ? { 
                ...loc, 
                ...newQrLocation, 
                updatedAt: new Date().toISOString() 
              }
            : loc
        )
      );
      toast({
        title: 'Success',
        description: 'QR location updated successfully',
      });
    } else {
      // Add new location
      const newLocation: QrLocation = {
        ...newQrLocation,
        id: Math.max(0, ...qrLocations.map(loc => loc.id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setQrLocations((prev) => [...prev, newLocation]);
      toast({
        title: 'Success',
        description: 'QR location added successfully',
      });
    }

    // Reset form and close dialog
    setEditQrDialogId(null);
    setEditQrLocation(null);
    setNewQrLocation({ name: '', description: '', status: 'active' });
    setIsQrDialogOpen(false);
  } catch (error) {
    console.error('Error saving QR location:', error);
    toast({
      title: 'Error',
      description: 'Failed to save QR location',
      variant: 'destructive',
    if (!searchTerm.trim()) return checkInLogs;
    
    const term = searchTerm.toLowerCase();
    return checkInLogs.filter(log => 
      (log.name?.toLowerCase().includes(term) || '') ||
      (log.member?.toLowerCase().includes(term) || '') ||
      (log.location?.toLowerCase().includes(term) || '') ||
      (log.status?.toLowerCase().includes(term) || '')
    );
  }, [checkInLogs, searchTerm]);

  // Get status color based on status
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active':
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'checked-out':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);
    if (!checkInLogs) return [];
    return checkInLogs.filter(log => 
      log.member?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [checkInLogs, searchTerm]);

  // Handle saving QR location
  const handleSaveQrLocation = useCallback(() => {
    if (!editQrLocation) return;
    setQrLocations(prev => 
      prev.map(loc => 
        loc.id === editQrLocation.id ? { ...editQrLocation } : loc
      )
    );
    setEditQrDialogId(null);
    setEditQrLocation(null);
    toast.success("QR location updated successfully");
  }, [editQrLocation]);

  // Handle adding new QR location
  const handleAddQrLocation = useCallback(() => {
    if (!newQrLocation.name.trim()) {
      toast.error("Please enter a name for the QR location");
      return;
    }
    
    const newId = Math.max(0, ...qrLocations.map(loc => loc.id)) + 1;
    const newLocation: QrLocation = {
      id: newId,
      ...newQrLocation,
      name: newQrLocation.name.trim(),
      description: newQrLocation.description.trim()
    };
    
    setQrLocations(prev => [...prev, newLocation]);
    setAddQrDialogOpen(false);
    setNewQrLocation({
      name: "",
      status: "active",
      description: "",
    });
    toast.success("QR location added successfully");
  }, [newQrLocation, qrLocations]);

  // Handle toggling QR location status
  const handleToggleQrLocation = useCallback((id: number) => {
    setQrLocations(prev => 
      prev.map(loc => 
        loc.id === id 
          ? { ...loc, status: loc.status === 'active' ? 'inactive' : 'active' } 
          : loc
      )
    );
  }, []);

  // Handle deleting QR location
  const handleDeleteQrLocation = useCallback((id: number) => {
    if (confirm("Are you sure you want to delete this QR location?")) {
      setQrLocations(prev => prev.filter(loc => loc.id !== id));
      toast.success("QR location deleted successfully");
    }
  }, []);

  // Handle generating new QR code
  const handleGenerateNewQr = useCallback((id: number) => {
    const location = qrLocations.find(loc => loc.id === id);
    if (location) {
      toast.success(`New QR code generated for ${location.name}`);
    }
  }, [qrLocations]);

  // Handle exporting logs
  const handleExportLogs = useCallback(() => {
    const csv = [
      ["Member", "Time", "Location", "Status", "Duration"],
      ...(checkInLogs || []).map(log => [
        log.member || '',
        log.time || '',
        log.location || '',
        log.status || '',
        log.duration || ''
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `checkin-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [checkInLogs]);

  return (
    <DynamicDashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check-In Management</h1>
          <p className="text-muted-foreground">Monitor member check-ins and manage access control</p>
        </div>
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
              <Scan className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.totalCheckIns}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Inside</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.currentlyInside}</div>
              <p className="text-xs text-muted-foreground">Real-time occupancy</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.peakTime}</div>
              <p className="text-xs text-muted-foreground">Busiest hour today</p>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="qr-codes">QR Codes</TabsTrigger>
            <TabsTrigger value="logs">Check-in Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Check-ins
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.totalCheckIns}</div>
                  <p className="text-xs text-muted-foreground">Today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Members
                  </CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.activeMembers}</div>
                  <p className="text-xs text-muted-foreground">Currently in space</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.peakTime}</div>
                  <p className="text-xs text-muted-foreground">Busiest hour today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Stay</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.averageStay}</div>
                  <p className="text-xs text-muted-foreground">Per member today</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DynamicDashboardLayout>
  );
};

// Main page component with client-side only rendering
export default function CheckInPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <AdminCheckInPage />
    </div>
  );
}
