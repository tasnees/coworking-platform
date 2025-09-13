"use client"
import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'

// Dynamically import the dashboard layout with SSR disabled
const DynamicDashboardLayout = dynamic(
  () => import('@/components/dashboard-layout'),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    ) 
  }
)

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  CreditCard, 
  Plus, 
  Search, 
  Users, 
  DollarSign, 
  Calendar, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  History, 
  FileText 
} from "lucide-react"

interface MembershipPlan {
  id: string;
  name: string;
  type: string;
  price: number;
  features: string[];
  active: boolean;
  members: number;
  createdAt: string;
  updatedAt: string;
}

function MembershipsContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("plans");
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    fetchMembershipPlans();
  }, []);

  const fetchMembershipPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/memberships', {
        method: 'GET',
        credentials: 'include', // This is required for cookies to be sent with the request
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = '/auth/login';
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch membership plans');
      }
      
      const data = await response.json();
      setMembershipPlans(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching membership plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to load membership plans. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md w-full max-w-2xl">
          <p className="font-medium">Error loading memberships</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchMembershipPlans}
            className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If no membership plans found, show empty state
  if (membershipPlans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md w-full max-w-2xl text-center">
          <p className="font-medium">No membership plans found</p>
          <p className="text-sm mt-1">Create your first membership plan to get started.</p>
          <button
            className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => {/* Add create membership plan handler */}}
          >
            Create Membership Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Membership Plans</h1>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center"
          onClick={() => {/* Add create membership plan handler */}}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </button>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {membershipPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription className="capitalize">{plan.type} plan</CardDescription>
                    </div>
                    <Badge variant={plan.active ? "default" : "secondary"}>
                      {plan.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${plan.price}<span className="text-sm font-normal text-gray-500">/month</span></div>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Features:</h4>
                    <ul className="space-y-1 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Members</span>
                      <span className="font-medium">{plan.members}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      {plan.active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Members by Plan</CardTitle>
              <CardDescription>View and manage members for each plan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Member management coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Membership Reports</CardTitle>
              <CardDescription>View reports and analytics for memberships</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Reports coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Main page component with client-side only rendering
export default function MembershipsPage() {
  return <MembershipsContent />;
}
