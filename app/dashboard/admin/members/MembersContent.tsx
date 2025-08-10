"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// Simple error boundary component since we can't import from @/components
class ErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
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
// Define types for better type safety
type Member = {
  id: number;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: 'active' | 'inactive' | 'pending';
  startDate: string;
  nextBilling: string;
  amount: number;
  memberSince: string;
  autoRenew: boolean;
  usageStats: {
    deskHours: number;
    meetingRoomHours: number;
    amenitiesUsed: string[];
  };
};

// Define default member object for initialization
const DEFAULT_MEMBER: Member = {
  id: 0,
  name: '',
  email: '',
  phone: '',
  plan: '',
  status: 'pending',
  startDate: '',
  nextBilling: '',
  amount: 0,
  memberSince: '',
  autoRenew: false,
  usageStats: {
    deskHours: 0,
    meetingRoomHours: 0,
    amenitiesUsed: [],
  },
};

export default function MembersContent() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "inactive" | "pending" | "all">("active");
  const [searchQuery, setSearchQuery] = useState("");
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

  const [members, setMembers] = useState<Member[]>(() => {
    // Return empty array during SSR
    if (typeof window === 'undefined') return [];
    
    // Mock data - in a real app, this would come from an API
    const mockMembers: Member[] = [
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
      // ... other mock members
    ];
    
    return mockMembers;
  });

  // Memoize filtered members with proper null checks
  const filteredMembers = useCallback(() => {
    try {
      if (!Array.isArray(members)) return [];
      
      return members.filter(member => {
        if (!member) return false;
        
        const searchLower = searchQuery?.toLowerCase?.() || '';
        const memberName = member?.name?.toLowerCase?.() || '';
        const memberEmail = member?.email?.toLowerCase?.() || '';
        
        const matchesSearch = 
          memberName.includes(searchLower) ||
          memberEmail.includes(searchLower);
          
        const matchesStatus = 
          activeTab === 'all' || 
          member?.status === activeTab;
          
        return matchesSearch && matchesStatus;
      });
    } catch (err) {
      console.error('Error filtering members:', err);
      return [];
    }
  }, [members, searchQuery, activeTab]);

  // Calculate member statistics with proper null checks
  const stats = useCallback(() => {
    if (!Array.isArray(members)) {
      return {
        total: 0,
        active: 0,
        pending: 0,
        inactive: 0
      };
    }
    
    return {
      total: members.length,
      active: members.filter(m => m?.status === 'active').length,
      pending: members.filter(m => m?.status === 'pending').length,
      inactive: members.filter(m => m?.status === 'inactive').length
    };
  }, [members]);
  
  const { total: totalMembers, active: activeMembers, pending: pendingMembers, inactive: inactiveMembers } = stats();

  // Handle member actions with error handling and type safety
  const handleMemberAction = useCallback(async (action: 'activate' | 'deactivate', memberId: number) => {
    if (!memberId) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update member status based on action with type safety
      setMembers(prevMembers => {
        if (!Array.isArray(prevMembers)) return [];
        
        return prevMembers.map(member => {
          if (!member || member.id !== memberId) return member;
          
          return {
            ...member,
            status: action === 'activate' ? 'active' : 'inactive'
          };
        });
      });
    } catch (err) {
      console.error(`Error ${action} member:`, err);
      setError(`Failed to ${action} member. Please try again.`);
    }
  }, []);

  // Show loading state during SSR/hydration
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state if data loading failed
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

  return (
    <div>
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
    </div>
  );
}
