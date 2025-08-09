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

  const [members, setMembers] = useState(() => {
    // This will only run on the client side
    if (typeof window === 'undefined') return [];

    return [
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
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+1 (555) 987-6543",
        plan: "Annual Basic",
        status: "active",
        startDate: "2024-02-01",
        nextBilling: "2025-02-01",
        amount: 999,
        memberSince: "2024-01-10",
        autoRenew: true,
        usageStats: {
          deskHours: 85,
          meetingRoomHours: 12,
          amenitiesUsed: ["WiFi", "Printer"],
        },
      },
      {
        id: 3,
        name: "Alex Johnson",
        email: "alex@example.com",
        phone: "+1 (555) 456-7890",
        plan: "Monthly Basic",
        status: "inactive",
        startDate: "2023-11-15",
        nextBilling: "2024-01-15",
        amount: 199,
        memberSince: "2023-11-01",
        autoRenew: false,
        usageStats: {
          deskHours: 45,
          meetingRoomHours: 5,
          amenitiesUsed: ["WiFi"],
        },
      },
    ];
  });

  // Filter members based on active tab and search query
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredMembers = (members || []).filter(member => {
    if (!member) return false;
    const searchLower = searchQuery?.toLowerCase() || '';
    const matchesSearch = 
      (member.name?.toLowerCase() || '').includes(searchLower) ||
      (member.email?.toLowerCase() || '').includes(searchLower);
    const matchesStatus = activeTab === 'all' || member.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  // Calculate member statistics
  const totalMembers = (members || []).length;
  const activeMembers = (members || []).filter(m => m?.status === 'active').length;
  const pendingMembers = (members || []).filter(m => m?.status === 'pending').length;
  const inactiveMembers = (members || []).filter(m => m?.status === 'inactive').length;

  // Handle member actions with error handling
  const handleMemberAction = async (action: string, memberId: number) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update member status based on action
      setMembers(prevMembers => 
        (prevMembers || []).map(member => 
          member?.id === memberId 
            ? { ...member, status: action === 'activate' ? 'active' : 'inactive' }
            : member
        )
      );
    } catch (err) {
      console.error(`Error ${action} member:`, err);
      setError(`Failed to ${action} member. Please try again.`);
    }
  };

  // Component JSX - only renders on client side after auth check
  return (
    <DashboardLayout userRole="admin">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Members</h1>
            <p className="text-muted-foreground">
              Manage your coworking space members
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="search"
              placeholder="Search members..."
              className="w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!isClient}
            />
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </div>
        {/* Rest of your component */}
      </div>
    </DashboardLayout>
  );
}
