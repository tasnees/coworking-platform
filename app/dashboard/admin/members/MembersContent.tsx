"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/dashboard-layout";
import {
  CreditCard,
  Plus,
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  Check,
  RefreshCw,
  ArrowRight,
  History,
  FileText,
  UserPlus,
} from "lucide-react";
import { saveAs } from "file-saver";
import { useAuth } from "@/contexts/AuthContext";
export default function MembersContent() {
  const [isClient, setIsClient] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  // Set client-side flag and handle auth redirect
  useEffect(() => {
    setIsClient(true);
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);
  // Show loading state on server or during auth check
  if (!isClient || isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      plan: "Monthly Pro",
      status: "active",
      startDate: "2024-01-15",
      nextBilling: "2024-02-15",
      amount: 450,
      memberSince: "2023-05-10",
      autoRenew: true,
      usageStats: {
        deskHours: 120,
        meetingRoomHours: 8,
        amenitiesUsed: ["WiFi", "Coffee", "Printer"],
      },
    },
    // ... rest of your members data
  ]);
  // Component JSX - only renders on client side after auth check
  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Members</h1>
            <p className="text-muted-foreground">
              Manage your coworking space members
            </p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
        {/* Rest of your component */}
      </div>
    </DashboardLayout>
  );
}
