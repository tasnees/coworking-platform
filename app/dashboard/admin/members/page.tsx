"use client";
// Force dynamic rendering - this is the recommended way in Next.js 13+
export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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

// Types
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

export default function MembersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user.role !== 'admin') {
      router.push('/dashboard');
    } else if (status === 'authenticated') {
      // TODO: Replace with actual API call
      const fetchMembers = async () => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Mock data - replace with actual API call
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
            // Add more mock members as needed
          ];
          setMembers(mockMembers);
        } catch (error) {
          console.error('Error fetching members:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchMembers();
    }
  }, [status, session, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Redirecting, no need to show anything
  }

  if (session?.user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
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

        <Tabs defaultValue="active" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search members..."
                  className="pl-8 w-[200px] md:w-[300px]"
                />
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Members</CardTitle>
                    <CardDescription>
                      {members.length} {members.length === 1 ? 'member' : 'members'} found
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto mr-2">
                    <FileText className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">No members found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get started by adding a new member.
                    </p>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div key={member.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{member.name}</h3>
                              <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                                {member.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <p className="text-sm text-muted-foreground">{member.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{member.plan}</p>
                            <p className="text-sm text-muted-foreground">
                              Next billing: {new Date(member.nextBilling).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
