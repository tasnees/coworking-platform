'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Lock, 
  Bell, 
  Shield as ShieldIcon, 
  Database, 
  Users, 
  Mail, 
  Calendar, 
  Clock, 
  FileText, 
  LogOut, 
  Save, 
  X as XIcon, 
  Phone, 
  MapPin, 
  Key, 
  Edit3, 
  ShieldCheck 
} from 'lucide-react';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  role: string;
  employeeId: string;
  joinDate: string;
  avatar: string;
  bio: string;
  permissions: string[];
  lastLogin: string;
}

interface AdminPreferences {
  emailNotifications: boolean;
  securityAlerts: boolean;
  systemAlerts: boolean;
  twoFactorEnabled: boolean;
  adminDashboardTips: boolean;
}

interface AdminSettingsState {
  isSaving: boolean;
  isEditing: boolean;
  showPasswordDialog: boolean;
  showDeleteDialog: boolean;
  profile: AdminProfile;
  editedProfile: Partial<AdminProfile>;
  backupSettings: {
    backupFrequency: string;
    backupRetention: number;
    backupLocation: string;
    lastBackup: string | null;
  };
  securityPolicies: {
    passwordMinLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
    requireUppercase: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  registrationSettings: {
    registrationOpen: boolean;
    requireApproval: boolean;
    defaultRole: string;
    emailVerification: boolean;
  };
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<AdminSettingsState>({
    isSaving: false,
    isEditing: false,
    showPasswordDialog: false,
    showDeleteDialog: false,
    profile: {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Admin St, Tech City',
      department: 'IT',
      role: 'Administrator',
      employeeId: 'EMP-001',
      joinDate: '2022-01-01',
      avatar: '/placeholder-user.jpg',
      bio: 'System administrator with full access to all settings and configurations.',
      permissions: ['admin:all'],
      lastLogin: new Date().toISOString(),
    },
    editedProfile: {},
    backupSettings: {
      backupFrequency: 'daily',
      backupRetention: 30,
      backupLocation: '/backups',
      lastBackup: new Date().toISOString(),
    },
    securityPolicies: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
    },
    registrationSettings: {
      registrationOpen: true,
      requireApproval: true,
      defaultRole: 'member',
      emailVerification: true,
    },
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const {
    isSaving,
    isEditing,
    showPasswordDialog,
    showDeleteDialog,
    profile,
    editedProfile,
    backupSettings,
    securityPolicies,
    registrationSettings,
    currentPassword,
    newPassword,
    confirmPassword
  } = state;

  useEffect(() => {
    setIsClient(true);
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      editedProfile: {
        ...prev.editedProfile,
        [name]: value
      }
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setState(prev => ({ ...prev, isSaving: true }));
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        isEditing: false,
        profile: {
          ...prev.profile,
          ...prev.editedProfile
        },
        editedProfile: {}
      }));

      toast({
        title: 'Success',
        description: 'Your changes have been saved.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save changes. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setState(prev => ({ ...prev, isSaving: true }));
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sign out and redirect after deletion
      await signOut({ redirect: false });
      router.push('/');
      
      toast({
        title: 'Account Deleted',
        description: 'Your account has been successfully deleted.',
      });
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setState(prev => ({ ...prev, isSaving: false, showDeleteDialog: false }));
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword === confirmPassword && newPassword.length >= 8) {
      try {
        setState(prev => ({ ...prev, isSaving: true }));
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setState(prev => ({
          ...prev,
          isSaving: false,
          showPasswordDialog: false,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));

        toast({
          title: 'Success',
          description: 'Your password has been updated successfully.',
        });
      } catch (error) {
        console.error('Error updating password:', error);
        toast({
          title: 'Error',
          description: 'Failed to update password. Please try again.',
          variant: 'destructive'
        });
      }
    } else {
      toast({
        title: 'Error',
        description: 'Please make sure your passwords match and are at least 8 characters long.',
        variant: 'destructive'
      });
    }
  };

  // Handle loading state
  if (isLoading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and system preferences
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account's profile information and email address.
                  </CardDescription>
                </div>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setState(prev => ({ ...prev, isEditing: false, editedProfile: {} }))}
                    >
                      <XIcon className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setState(prev => ({ ...prev, isEditing: true }))}
                  >
                    <Edit3 className="h-4 w-4 mr-1" /> Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="text-white">
                          <Edit3 className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{profile.name}</h3>
                    <p className="text-muted-foreground">{profile.role}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Member since {new Date(profile.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        name="name"
                        value={editedProfile.name ?? profile.name}
                        onChange={handleInputChange}
                        disabled={isSaving}
                      />
                    ) : (
                      <p className="text-sm">{profile.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={editedProfile.email ?? profile.email}
                        onChange={handleInputChange}
                        disabled={isSaving}
                      />
                    ) : (
                      <p className="text-sm">{profile.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        name="phone"
                        value={editedProfile.phone ?? profile.phone}
                        onChange={handleInputChange}
                        disabled={isSaving}
                      />
                    ) : (
                      <p className="text-sm">{profile.phone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        name="address"
                        value={editedProfile.address ?? profile.address}
                        onChange={handleInputChange}
                        disabled={isSaving}
                      />
                    ) : (
                      <p className="text-sm">{profile.address}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    {isEditing ? (
                      <Input
                        id="department"
                        name="department"
                        value={editedProfile.department ?? profile.department}
                        onChange={handleInputChange}
                        disabled={isSaving}
                      />
                    ) : (
                      <p className="text-sm">{profile.department}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={editedProfile.bio ?? profile.bio}
                        onChange={handleInputChange}
                        disabled={isSaving}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {profile.bio || 'No bio provided.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Ensure your account is using a long, random password to stay secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Last Password Change</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setState(prev => ({ ...prev, showPasswordDialog: true }))}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account and all of its contents from our servers.
                This action is not reversible, so please continue with caution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true }))}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showPasswordDialog: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and your new password below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setState(prev => ({ ...prev, currentPassword: e.target.value }))}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setState(prev => ({ ...prev, newPassword: e.target.value }))}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setState(prev => ({ ...prev, confirmPassword: e.target.value }))}
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, showPasswordDialog: false }))}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
            >
              {isSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-destructive/10 p-4 rounded-md">
              <h4 className="font-medium text-destructive">Warning</h4>
              <p className="text-sm text-muted-foreground">
                Deleting your account will remove all of your data, including your profile information, preferences, and any content you've created.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Type <span className="font-mono">delete my account</span> to confirm
              </Label>
              <Input
                id="delete-confirm"
                placeholder="delete my account"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isSaving}
            >
              {isSaving ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
