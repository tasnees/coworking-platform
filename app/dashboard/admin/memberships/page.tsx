"use client";

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'

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
import { toast } from 'sonner'

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
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<MembershipPlan>>({
    name: '',
    type: 'flex',
    price: 0,
    features: [],
    active: true
  });

  useEffect(() => {
    setIsMounted(true);
    fetchMembershipPlans();
  }, []);

  const fetchMembershipPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/memberships', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
       
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

 
  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

 
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

  const handleEditPlan = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      type: plan.type,
      price: plan.price,
      features: [...plan.features],
      active: plan.active
    });
    setIsEditDialogOpen(true);
  };

  const handleToggleStatus = async (planId: string, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/memberships/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ active: !currentStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update plan status');
      }

     
      setMembershipPlans(prevPlans =>
        prevPlans.map(plan =>
          plan.id === planId ? { ...plan, active: !currentStatus } : plan
        )
      );
      
      toast.success(`Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating plan status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update plan status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      type: 'flex',
      price: 0,
      features: [],
      active: true
    });
    setIsEditDialogOpen(true);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/memberships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          members: 0,
          features: formData.features || [],
        }),
      });

      if (!response.ok) throw new Error('Failed to create plan');
      
     
      await fetchMembershipPlans();
      setIsEditDialogOpen(false);
      setFormData({
        name: '',
        type: 'flex',
        price: 0,
        features: [],
        active: true
      });
      
      toast.success('Membership plan created successfully');
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create plan');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return handleCreatePlan(e);

    try {
      const response = await fetch(`/api/memberships/${editingPlan.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update plan');
      
     
      await fetchMembershipPlans();
      setIsEditDialogOpen(false);
      setEditingPlan(null);
      
      toast.success('Plan updated successfully');
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    }
  };

 
  if (membershipPlans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md w-full max-w-2xl text-center">
          <p className="font-medium">No membership plans found</p>
          <p className="text-sm mt-1">Create your first membership plan to get started.</p>
          <button
            className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => {
              setEditingPlan(null);
              setFormData({
                name: '',
                type: 'flex',
                price: 0,
                features: [],
                active: true
              });
              setIsEditDialogOpen(true);
            }}
          >
            Create Membership Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Membership Plans</h1>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center"
          onClick={handleAddPlan}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditPlan(plan)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant={plan.active ? "outline" : "default"} 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleToggleStatus(plan.id, plan.active)}
                    >
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
      
      {}
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}</DialogTitle>
          <DialogDescription>
            {editingPlan ? 'Update the details of this membership plan.' : 'Fill in the details for the new membership plan.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter plan name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Plan Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({...formData, type: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select plan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flex">Flex</SelectItem>
                <SelectItem value="dedicated">Dedicated</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Monthly Price ($)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Features (one per line)</Label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.features?.join('\n') || ''}
              onChange={(e) => 
                setFormData({
                  ...formData, 
                  features: e.target.value.split('\n').filter(f => f.trim() !== '')
                })
              }
              placeholder="Feature 1\nFeature 2\n..."
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({...formData, active: checked})}
            />
            <Label htmlFor="active">Active Plan</Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

export default function MembershipsPage() {
  return <MembershipsContent />;
}
