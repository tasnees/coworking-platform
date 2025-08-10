"use client";
"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
// Dynamically import the dashboard layout with SSR disabled
const DashboardLayout = dynamic(
  () => import('@/components/dashboard-layout'),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    ) 
  }
);
// Import UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Mail, Phone, MapPin, Shield, Bell, Key, Save, X, Edit3, Settings, Users, Database, ShieldCheck } from "lucide-react";
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
export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Set client-side flag and handle auth redirect
  useEffect(() => {
    setIsClient(true);
    setIsLoading(false);
  }, []);

  // Show loading state during SSR/hydration
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state if needed
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="h-12 w-12 text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4 text-center">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState<AdminProfile>(() => ({
    id: "admin-001",
    name: "Alexandra Thompson",
    email: "alexandra.thompson@coworkspace.com",
    phone: "+1 (555) 987-6543",
    address: "456 Executive Ave, City, State 12345",
    department: "Management",
    role: "System Administrator",
    employeeId: "ADM-2024-001",
    joinDate: "2024-01-01",
    avatar: "",
    bio: "System administrator overseeing all aspects of the coworking platform.",
    permissions: ["Full System Access", "User Management", "Analytics", "Billing"],
    lastLogin: new Date().toISOString(),
  }));

  const [preferences, setPreferences] = useState<AdminPreferences>(() => ({
    emailNotifications: true,
    securityAlerts: true,
    systemAlerts: true,
    twoFactorEnabled: true,
    adminDashboardTips: true,
  }));

  const [systemConfig, setSystemConfig] = useState(() => ({
    siteName: 'CoworkSpace Platform',
    maintenanceMode: false,
    maxUsers: 1000,
    sessionTimeout: 30,
    defaultLanguage: 'en'
  }));

  const [databaseSettings, setDatabaseSettings] = useState(() => ({
    backupFrequency: 'daily',
    retentionDays: 30,
    compressionEnabled: true,
    encryptionEnabled: true
  }));

  const [securityPolicies, setSecurityPolicies] = useState(() => ({
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    maxLoginAttempts: 5,
    lockoutDuration: 30
  }));

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSystemConfigDialog, setShowSystemConfigDialog] = useState(false);
  const [showDatabaseSettingsDialog, setShowDatabaseSettingsDialog] = useState(false);
  const [showSecurityPoliciesDialog, setShowSecurityPoliciesDialog] = useState(false);
  const [showUserManagementDialog, setShowUserManagementDialog] = useState(false);
  
  const [userManagement, setUserManagement] = useState({
    registrationOpen: true,
    requireApproval: false,
    defaultRole: 'member',
    emailVerification: true
  });

  const [editedProfile, setEditedProfile] = useState<AdminProfile>(profile);

  const handleSaveChanges = useCallback(() => {
    setIsSaving(true);
    try {
      setProfile(editedProfile);
      setIsEditing(false);
      // Add API call here to save changes
    } catch (error) {
      setError('Failed to save changes. Please try again.');
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editedProfile]);

  const handleCancelEdit = useCallback(() => {
    setEditedProfile(profile);
    setIsEditing(false);
  }, [profile]);

  const handleSaveProfile = useCallback(async () => {
    try {
      setIsSaving(true);
      // In a real app, you would make an API call here to save the profile
      // await api.updateProfile(editedProfile);
      
      // Update the profile state with the edited values
      setProfile(editedProfile);
      setIsEditing(false);
      
      // Show success message
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [editedProfile, toast]);

  const handleChangePassword = useCallback(() => {
    setShowPasswordDialog(true);
  }, []);

  const handlePasswordChange = useCallback(() => {
    if (newPassword === confirmPassword && newPassword.length >= 8) {
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [newPassword, confirmPassword]);

  const handlePreferenceChange = (key: keyof AdminPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };
  // Ensure all lists have unique keys
  const renderPermissions = useCallback((permissions: string[] = []) => {
    if (!permissions.length) return null;
    
    return (
      <div className="space-y-2">
        {permissions.map((permission, index) => (
          <Badge key={`permission-${index}`} variant="outline" className="mr-2">
            {permission}
          </Badge>
        ))}
      </div>
    );
  }, []);

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
          <p className="text-muted-foreground">Manage your administrator account and system preferences</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {profile.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-muted-foreground">{profile.role}</p>
                <div className="flex items-center space-x-2 flex-wrap">
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {profile.department}
                  </Badge>
                  <Badge variant="outline" className="border-red-300 text-red-700">
                    {profile.employeeId}
                  </Badge>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Last login: {new Date(profile.lastLogin).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Administrator Information</CardTitle>
                    <CardDescription>Update your admin profile and contact information</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={isEditing ? editedProfile.name : profile.name}
                        onChange={(e) => setEditedProfile((prev) => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className={isEditing ? "" : "bg-muted"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={isEditing ? editedProfile.email : profile.email}
                        onChange={(e) => setEditedProfile((prev) => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className={isEditing ? "" : "bg-muted"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={isEditing ? editedProfile.phone : profile.phone}
                        onChange={(e) => setEditedProfile((prev) => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className={isEditing ? "" : "bg-muted"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={isEditing ? editedProfile.department : profile.department}
                        onChange={(e) => setEditedProfile((prev) => ({ ...prev, department: e.target.value }))}
                        disabled={!isEditing}
                        className={isEditing ? "" : "bg-muted"}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={isEditing ? editedProfile.address : profile.address}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, address: e.target.value }))}
                      disabled={!isEditing}
                      className={isEditing ? "" : "bg-muted"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      rows={4}
                      value={isEditing ? editedProfile.bio : profile.bio}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isEditing ? "" : "bg-muted"
                        }`}
                    />
                  </div>
                  {isEditing && (
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Administrator Details</CardTitle>
                <CardDescription>Your administrative account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Administrator ID</Label>
                      <div className="p-2 bg-muted rounded-md text-sm">{profile.employeeId}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Account Created</Label>
                      <div className="p-2 bg-muted rounded-md text-sm">{new Date(profile.joinDate).toLocaleDateString()}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <div className="p-2 bg-muted rounded-md text-sm">{profile.role}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>System Permissions</Label>
                      <div className="flex flex-wrap gap-1">
                        {profile.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified as an administrator</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email updates about important events</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about system issues and updates</p>
                  </div>
                  <Switch
                    checked={preferences.systemAlerts}
                    onCheckedChange={(checked) => handlePreferenceChange("systemAlerts", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive security-related notifications</p>
                  </div>
                  <Switch
                    checked={preferences.securityAlerts}
                    onCheckedChange={(checked) => handlePreferenceChange("securityAlerts", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Admin Dashboard Tips</Label>
                    <p className="text-sm text-muted-foreground">Show helpful tips and guidance for administrators</p>
                  </div>
                  <Switch
                    checked={preferences.adminDashboardTips}
                    onCheckedChange={(checked) => handlePreferenceChange("adminDashboardTips", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your administrator account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your admin account</p>
                  </div>
                  <Switch
                    checked={preferences.twoFactorEnabled}
                    onCheckedChange={(checked) => handlePreferenceChange("twoFactorEnabled", checked)}
                  />
                </div>
                <div className="border-t pt-4">
                  <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogHeader>
                      <DialogTitle>Change Admin Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and new password to update your administrator account security.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handlePasswordChange}>
                        Update Password
                      </Button>
                    </DialogFooter>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Management</CardTitle>
                <CardDescription>Access system-wide settings and configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start" onClick={() => setShowSystemConfigDialog(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    System Configuration
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => setShowUserManagementDialog(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    User Management
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => setShowDatabaseSettingsDialog(true)}>
                    <Database className="h-4 w-4 mr-2" />
                    Database Settings
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => setShowSecurityPoliciesDialog(true)}>
                    <Shield className="h-4 w-4 mr-2" />
                    Security Policies
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">Online</div>
                    <div className="text-sm text-muted-foreground">System Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">247</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* System Configuration Dialog */}
        <Dialog open={showSystemConfigDialog} onOpenChange={setShowSystemConfigDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>System Configuration</DialogTitle>
              <DialogDescription>
                Configure global system settings and platform parameters.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  value={systemConfig.siteName}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable to restrict access during maintenance</p>
                </div>
                <Switch
                  checked={systemConfig.maintenanceMode}
                  onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-users">Maximum Users</Label>
                <Input
                  id="max-users"
                  type="number"
                  value={systemConfig.maxUsers}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={systemConfig.sessionTimeout}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSystemConfigDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowSystemConfigDialog(false)}>
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Database Settings Dialog */}
        <Dialog open={showDatabaseSettingsDialog} onOpenChange={setShowDatabaseSettingsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Database Settings</DialogTitle>
              <DialogDescription>
                Configure database backup and maintenance settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <select
                  id="backup-frequency"
                  value={databaseSettings.backupFrequency}
                  onChange={(e) => setDatabaseSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retention-days">Retention Days</Label>
                <Input
                  id="retention-days"
                  type="number"
                  value={databaseSettings.retentionDays}
                  onChange={(e) => setDatabaseSettings(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Compression</Label>
                  <p className="text-sm text-muted-foreground">Compress backup files to save space</p>
                </div>
                <Switch
                  checked={databaseSettings.compressionEnabled}
                  onCheckedChange={(checked) => setDatabaseSettings(prev => ({ ...prev, compressionEnabled: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Encryption</Label>
                  <p className="text-sm text-muted-foreground">Encrypt backup files for security</p>
                </div>
                <Switch
                  checked={databaseSettings.encryptionEnabled}
                  onCheckedChange={(checked) => setDatabaseSettings(prev => ({ ...prev, encryptionEnabled: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDatabaseSettingsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowDatabaseSettingsDialog(false)}>
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Security Policies Dialog */}
        <Dialog open={showSecurityPoliciesDialog} onOpenChange={setShowSecurityPoliciesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Security Policies</DialogTitle>
              <DialogDescription>
                Configure security policies and access controls for the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password-min-length">Minimum Password Length</Label>
                <Input
                  id="password-min-length"
                  type="number"
                  value={securityPolicies.passwordMinLength}
                  onChange={(e) => setSecurityPolicies(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Special Characters</Label>
                  <p className="text-sm text-muted-foreground">Passwords must contain special characters</p>
                </div>
                <Switch
                  checked={securityPolicies.requireSpecialChars}
                  onCheckedChange={(checked) => setSecurityPolicies(prev => ({ ...prev, requireSpecialChars: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Numbers</Label>
                  <p className="text-sm text-muted-foreground">Passwords must contain numbers</p>
                </div>
                <Switch
                  checked={securityPolicies.requireNumbers}
                  onCheckedChange={(checked) => setSecurityPolicies(prev => ({ ...prev, requireNumbers: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Uppercase Letters</Label>
                  <p className="text-sm text-muted-foreground">Passwords must contain uppercase letters</p>
                </div>
                <Switch
                  checked={securityPolicies.requireUppercase}
                  onCheckedChange={(checked) => setSecurityPolicies(prev => ({ ...prev, requireUppercase: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts">Maximum Login Attempts</Label>
                <Input
                  id="max-login-attempts"
                  type="number"
                  value={securityPolicies.maxLoginAttempts}
                  onChange={(e) => setSecurityPolicies(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
                <Input
                  id="lockout-duration"
                  type="number"
                  value={securityPolicies.lockoutDuration}
                  onChange={(e) => setSecurityPolicies(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSecurityPoliciesDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowSecurityPoliciesDialog(false)}>
                Save Policies
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* User Management Dialog */}
        <Dialog open={showUserManagementDialog} onOpenChange={setShowUserManagementDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Management Settings</DialogTitle>
              <DialogDescription>
                Configure user registration and management policies.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Registration Open</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to register</p>
                </div>
                <Switch
                  checked={userManagement.registrationOpen}
                  onCheckedChange={(checked) => setUserManagement(prev => ({ ...prev, registrationOpen: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Admin Approval</Label>
                  <p className="text-sm text-muted-foreground">New registrations require admin approval</p>
                </div>
                <Switch
                  checked={userManagement.requireApproval}
                  onCheckedChange={(checked) => setUserManagement(prev => ({ ...prev, requireApproval: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-role">Default User Role</Label>
                <select
                  id="default-role"
                  value={userManagement.defaultRole}
                  onChange={(e) => setUserManagement(prev => ({ ...prev, defaultRole: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="member">Member</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                </div>
                <Switch
                  checked={userManagement.emailVerification}
                  onCheckedChange={(checked) => setUserManagement(prev => ({ ...prev, emailVerification: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserManagementDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowUserManagementDialog(false)}>
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
