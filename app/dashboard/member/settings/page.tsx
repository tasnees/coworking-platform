"use client";
import { useRef, useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { LogOut, Trash, Camera } from "lucide-react";

export default function SettingsPage() {
  const [isClient, setIsClient] = useState(false);
  // Profile photo state
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Delete account dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // Devices state (mock)
  const [devices, setDevices] = useState([
    { id: 1, name: "Chrome on Windows", lastActive: "Just now", current: true },
    { id: 2, name: "Safari on iPhone", lastActive: "2 days ago", current: false },
    { id: 3, name: "Edge on Mac", lastActive: "1 week ago", current: false },
  ]);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Upload photo handler
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isClient) return;

    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setPhoto(ev.target.result as string);
          }
        };
        reader.onerror = () => {
          console.error('Error reading file');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error handling file upload:', error);
      }
    }
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Sign out device handler
  const handleSignOutDevice = (id: number) => {
    setDevices(devices.filter((d) => d.id !== id));
  };
  return (
    <DashboardLayout userRole="member">
      <div className="max-w-3xl mx-auto space-y-10 pb-10">
        <div className="mb-2">
          <h1 className="text-4xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your profile and devices</p>
        </div>
        {/* Profile Section */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 to-muted flex items-center justify-center overflow-hidden border-2 border-primary shadow">
                  {photo ? (
                    <img src={photo} alt="Profile" className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-5xl text-muted-foreground">👤</span>
                  )}
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 bg-white/80 rounded-full p-1 shadow group-hover:scale-110 transition"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change photo"
                  >
                    <Camera className="h-5 w-5 text-primary" />
                  </button>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
                {photo && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 w-full"
                    onClick={handleRemovePhoto}
                  >
                    Remove Photo
                  </Button>
                )}
              </div>
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input defaultValue="Member User" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input defaultValue="member@omnispace.app" type="email" />
                </div>
                <div className="flex justify-end">
                  <Button className="mt-2" variant="default">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Devices Section */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Devices</CardTitle>
            <CardDescription>Manage your signed-in devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <h3 className="font-semibold mb-3 text-lg">Signed-in Devices</h3>
              <div className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3 shadow-sm"
                  >
                    <div>
                      <span className="font-medium">{device.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {device.current ? "(This device)" : `Last active: ${device.lastActive}`}
                      </span>
                    </div>
                    {!device.current ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSignOutDevice(device.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Sign Out
                      </Button>
                    ) : (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Active
                      </Badge>
                    )}
                  </div>
                ))}
                {devices.length === 1 && (
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    Only your current device is signed in.
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="h-4 w-4 mr-1" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete your account? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteDialogOpen(false)}>
                      Confirm Delete
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
