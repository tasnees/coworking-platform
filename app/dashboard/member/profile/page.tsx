'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { UserRole } from '@/lib/auth-types';
import { UserBookings } from '@/components/user-bookings';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  [key: string]: unknown; // Allow additional properties
}

export default function ProfilePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/login?callbackUrl=/dashboard/member/profile');
    },
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will be redirected by onUnauthenticated
  }

  const user = session.user as SessionUser;

  type Notifications = {
    email: boolean;
    sms: boolean;
    bookingReminders: boolean;
    promotions: boolean;
  };

  type Preferences = {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };

  type System = {
    twoFactorAuth: boolean;
    autoSave: boolean;
    syncData: boolean;
  };

  const [notifications, setNotifications] = useState<Notifications>({
    email: true,
    sms: false,
    bookingReminders: true,
    promotions: false,
  });

  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'system',
    language: 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [system, setSystem] = useState<System>({
    twoFactorAuth: false,
    autoSave: true,
    syncData: true,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev: typeof notifications) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: string) => {
    setPreferences((prev: typeof preferences) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSystemChange = (key: keyof typeof system) => {
    setSystem((prev: typeof system) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your profile and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 pt-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative h-24 w-24 rounded-full overflow-hidden">
                  <img
                    src={(session.user as any)?.image || '/default-avatar.png'}
                    alt={(session.user as any)?.name || 'User'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <h3 className="font-semibold">Account Type</h3>
                  <p className="capitalize">{user.role || 'member'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Account Status</h3>
                  <p className="text-green-600">Active</p>
                </div>
                <div>
                  <h3 className="font-semibold">Member Since</h3>
                  <p className="text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Last Login</h3>
                  <p className="text-muted-foreground">
                    {new Date().toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <Button 
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign Out
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor={key} className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {key === 'email' && 'Receive notifications via email'}
                          {key === 'sms' && 'Receive SMS notifications'}
                          {key === 'bookingReminders' && 'Get reminders for upcoming bookings'}
                          {key === 'promotions' && 'Receive promotional offers'}
                        </p>
                      </div>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={() => handleNotificationChange(key as keyof typeof notifications)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <select
                      id="theme"
                      value={preferences.theme}
                      onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      value={preferences.timezone}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Manage your account security and data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      id="twoFactorAuth"
                      checked={system.twoFactorAuth}
                      onCheckedChange={() => handleSystemChange('twoFactorAuth')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoSave">Auto-save Changes</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save changes to your profile
                      </p>
                    </div>
                    <Switch
                      id="autoSave"
                      checked={system.autoSave}
                      onCheckedChange={() => handleSystemChange('autoSave')}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline" className="mr-2">
                      Export Data
                    </Button>
                    <Button variant="destructive" onClick={() => {}}>
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* User's Bookings */}
      <div className="max-w-4xl mx-auto">
        <UserBookings />
      </div>
    </div>
  );
}
