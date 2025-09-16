"use client";

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Bell, 
  Moon, 
  Key, 
  Save, 
  X, 
  Edit3, 
  Sun 
} from "lucide-react"
interface StaffProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  department: string
  role: string
  employeeId: string
  joinDate: string
  avatar: string
  bio: string
}

interface StaffPreferences {
  emailNotifications: boolean
  bookingReminders: boolean
  securityAlerts: boolean
  twoFactorEnabled: boolean
  language: string
}

export default function StaffSettingsContent() {
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

 
  const [profile, setProfile] = useState<StaffProfile>({
    id: "staff-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@coworkspace.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, State 12345",
    department: "Operations",
    role: "Senior Staff Member",
    employeeId: "STF-2024-001",
    joinDate: "2024-01-15",
    avatar: "",
    bio: "Dedicated staff member focused on providing excellent member support and maintaining smooth daily operations."
  })

  const [preferences, setPreferences] = useState<StaffPreferences>({
    emailNotifications: true,
    bookingReminders: true,
    securityAlerts: true,
    twoFactorEnabled: true,
    language: "English"
  })

  const [editedProfile, setEditedProfile] = useState(profile)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSaveProfile = () => {
    setProfile(editedProfile)
    setIsEditing(false)
   
  }

  const handleCancelEdit = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handlePasswordChange = () => {
    if (newPassword === confirmPassword && newPassword.length >= 8) {
     
      setShowPasswordDialog(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
  }

  const handlePreferenceChange = (key: keyof StaffPreferences, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
   
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

 
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </div>

      {}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.role}</p>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{profile.department}</Badge>
                <Badge variant="outline">{profile.employeeId}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
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
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
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
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
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
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className={isEditing ? "" : "bg-muted"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={isEditing ? editedProfile.department : profile.department}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, department: e.target.value }))}
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
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, address: e.target.value }))}
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
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isEditing ? "" : "bg-muted"}`}
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
                <CardTitle>Employment Details</CardTitle>
                <CardDescription>Your employment information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Employee ID</Label>
                      <div className="p-2 bg-muted rounded-md text-sm">{profile.employeeId}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Join Date</Label>
                      <div className="p-2 bg-muted rounded-md text-sm">{new Date(profile.joinDate).toLocaleDateString()}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <div className="p-2 bg-muted rounded-md text-sm">{profile.role}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email updates about important events</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get notified about upcoming bookings</p>
                  </div>
                  <Switch
                    checked={preferences.bookingReminders}
                    onCheckedChange={(checked) => handlePreferenceChange('bookingReminders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive security-related notifications</p>
                  </div>
                  <Switch
                    checked={preferences.securityAlerts}
                    onCheckedChange={(checked) => handlePreferenceChange('securityAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={preferences.twoFactorEnabled}
                    onCheckedChange={(checked) => handlePreferenceChange('twoFactorEnabled', checked)}
                  />
                </div>
                <div className="border-t pt-4">
                  <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and new password to update your account security.
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
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Account details and management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {new Date(profile.joinDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete your account? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
                          Delete Account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}
