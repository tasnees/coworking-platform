"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  CreditCard,
  Users,
  Star,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package,
  Zap,
  Shield,
  Download,
  ArrowUpRight,
  ChevronRight,
  Loader2
} from "lucide-react";

// Type definitions
type PlanType = "basic" | "standard" | "premium" | "enterprise";
type BillingCycle = "monthly" | "quarterly" | "annually";
type MembershipStatus = "active" | "inactive" | "pending";
type BillingStatus = "paid" | "pending" | "failed";

interface MembershipPlan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  credits: number;
  maxUsers: number;
  currentUsers: number;
  status: MembershipStatus;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
}

interface UsageStats {
  monthly: {
    creditsUsed: number;
    totalCredits: number;
    creditsRemaining: number;
    bookings: number;
    hoursUsed: number;
  };
  daily: {
    checkIns: number;
    hoursToday: number;
  };
}

interface BillingHistory {
  id: string;
  description: string;
  date: string;
  amount: number;
  status: BillingStatus;
}

export default function MembershipsPage() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showAutoRenewDialog, setShowAutoRenewDialog] = useState(false);
  const [currentMembership, setCurrentMembership] = useState<MembershipPlan | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<MembershipPlan | null>(null);

  // Sample data
  const availablePlans: MembershipPlan[] = [
    {
      id: "1",
      name: "Basic Plan",
      type: "basic",
      price: 29,
      billingCycle: "monthly",
      features: [
        "5 hours per day",
        "Basic amenities",
        "Community access",
        "Wi-Fi access"
      ],
      credits: 150,
      maxUsers: 1,
      currentUsers: 1,
      status: "active",
      startDate: new Date().toISOString(),
      autoRenew: true
    },
    {
      id: "2",
      name: "Standard Plan",
      type: "standard",
      price: 59,
      billingCycle: "monthly",
      features: [
        "8 hours per day",
        "All amenities",
        "Priority booking",
        "Meeting room access",
        "Mail handling"
      ],
      credits: 300,
      maxUsers: 1,
      currentUsers: 1,
      status: "active",
      startDate: new Date().toISOString(),
      autoRenew: true
    },
    {
      id: "3",
      name: "Premium Plan",
      type: "premium",
      price: 99,
      billingCycle: "monthly",
      features: [
        "12 hours per day",
        "All amenities",
        "Priority support",
        "Private office",
        "Unlimited meeting rooms",
        "Mail handling",
        "Phone booth access"
      ],
      credits: 500,
      maxUsers: 2,
      currentUsers: 1,
      status: "active",
      startDate: new Date().toISOString(),
      autoRenew: true
    }
  ];

  useEffect(() => {
    setIsClient(true);
    // Simulate loading
    setTimeout(() => {
      setCurrentMembership(availablePlans[0]);
      setUsageStats({
        monthly: {
          creditsUsed: 45,
          totalCredits: 150,
          creditsRemaining: 105,
          bookings: 12,
          hoursUsed: 78
        },
        daily: {
          checkIns: 1,
          hoursToday: 6
        }
      });
      setBillingHistory([
        {
          id: "1",
          description: "Monthly Membership Fee",
          date: new Date().toISOString(),
          amount: 29,
          status: "paid"
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getPlanIcon = (type: PlanType) => {
    switch (type) {
      case "basic": return <Star className="h-4 w-4" />;
      case "standard": return <Zap className="h-4 w-4" />;
      case "premium": return <Shield className="h-4 w-4" />;
      case "enterprise": return <Package className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getPlanColor = (type: PlanType) => {
    switch (type) {
      case "basic": return "text-green-600";
      case "standard": return "text-blue-600";
      case "premium": return "text-purple-600";
      case "enterprise": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateProgress = (used: number, total: number) => {
    return Math.min((used / total) * 100, 100);
  };

  const handleUpgradeToPlan = async (plan: MembershipPlan) => {
    if (!plan) return;

    try {
      setCurrentMembership({
        ...plan,
        status: 'active',
        startDate: new Date().toISOString(),
        autoRenew: true
      });

      alert(`Successfully upgraded to ${plan.name}!`);
      setShowUpgradeDialog(false);
      setSelectedPlanForUpgrade(null);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Failed to upgrade plan. Please try again.');
    }
  };

  const handleDownloadInvoice = (invoiceId: string, description: string) => {
    if (!currentMembership) return;

    try {
      const invoiceData = {
        id: invoiceId,
        description: description,
        date: new Date().toISOString(),
        amount: currentMembership.price,
        member: "Current User",
        plan: currentMembership.name
      };

      const invoiceText = `
INVOICE
=======
Invoice ID: ${invoiceData.id}
Description: ${invoiceData.description}
Date: ${new Date(invoiceData.date).toLocaleDateString()}
Amount: ${formatCurrency(invoiceData.amount)}
Plan: ${invoiceData.plan}
Member: ${invoiceData.member}
Thank you for your business!
`.trim();

      const blob = new Blob([invoiceText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };

  const handleToggleAutoRenew = () => {
    if (currentMembership) {
      const newAutoRenewStatus = !currentMembership.autoRenew;
      setCurrentMembership(prev => {
        if (!prev) return null;
        return {
          ...prev,
          autoRenew: newAutoRenewStatus
        };
      });
    }
    setShowAutoRenewDialog(false);
  };

  const handleUpgradePlan = () => {
    setShowUpgradeDialog(true);
  };

  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentMembership || !usageStats || !billingHistory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Error loading membership data. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Membership</h1>
        <p className="text-muted-foreground">Manage your membership plan and billing information.</p>
      </div>

      {/* Current Membership Card */}
      <Card className="border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getPlanIcon(currentMembership.type)}
              <span>{currentMembership.name}</span>
            </div>
            <Badge variant="default" className="bg-purple-500">
              Active
            </Badge>
          </CardTitle>
          <CardDescription>
            {formatCurrency(currentMembership.price)} per {currentMembership.billingCycle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Credits Used This Month</span>
                <span>{usageStats.monthly.creditsUsed} / {usageStats.monthly.totalCredits}</span>
              </div>
              <Progress
                value={calculateProgress(usageStats.monthly.creditsUsed, usageStats.monthly.totalCredits)}
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Bookings</div>
                <div className="text-2xl font-bold">{usageStats.monthly.bookings}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Hours Used</div>
                <div className="text-2xl font-bold">{usageStats.monthly.hoursUsed}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Usage Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{usageStats.monthly.creditsRemaining}</div>
                  <div className="text-sm text-muted-foreground">Credits Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{usageStats.daily.checkIns}</div>
                  <div className="text-sm text-muted-foreground">Check-ins Today</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{usageStats.daily.hoursToday}</div>
                  <div className="text-sm text-muted-foreground">Hours Today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={handleUpgradePlan}
              >
                Upgrade Plan
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAutoRenewDialog(true)}
              >
                Manage Auto-Renewal
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleDownloadInvoice('latest', 'Latest Invoice')}
              >
                Download Invoice
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan Features</CardTitle>
              <CardDescription>
                All features included in your {currentMembership.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {currentMembership.features.map((feature, index) => (
                  <li key={`feature-${index}-${feature.substring(0, 10)}`} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>
                Compare and upgrade your membership
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availablePlans.map((plan) => (
                  <Card key={plan.id} className="relative">
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${getPlanColor(plan.type)}`}>
                        {getPlanIcon(plan.type)}
                        {plan.name}
                      </CardTitle>
                      <CardDescription>
                        {formatCurrency(plan.price)} / {plan.billingCycle}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          {plan.credits} credits / month
                        </div>
                        <ul className="space-y-1 text-sm">
                          {plan.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-xs text-muted-foreground">
                              +{plan.features.length - 3} more features
                            </li>
                          )}
                        </ul>
                        <Button
                          className="w-full"
                          variant={currentMembership && plan.type === currentMembership.type ? "outline" : "default"}
                          disabled={currentMembership && plan.type === currentMembership.type}
                          onClick={() => {
                            setSelectedPlanForUpgrade(plan);
                            setShowUpgradeDialog(true);
                          }}
                        >
                          {currentMembership && plan.type === currentMembership.type ? "Current Plan" : "Upgrade"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Next Billing Date</span>
                  <span className="font-semibold">February 15, 2024</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Amount Due</span>
                  <span className="font-semibold">{formatCurrency(currentMembership.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Auto-Renewal</span>
                  <Badge variant={currentMembership.autoRenew ? "default" : "secondary"}>
                    {currentMembership.autoRenew ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAutoRenewDialog(true)}
                    className="w-full"
                  >
                    {currentMembership.autoRenew ? "Disable Auto-Renewal" : "Enable Auto-Renewal"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                Recent invoices and payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {billingHistory.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{bill.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(bill.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatCurrency(bill.amount)}</span>
                      <Badge
                        variant={
                          bill.status === "paid" ? "default" :
                          bill.status === "pending" ? "secondary" : "destructive"
                        }
                      >
                        {bill.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(bill.id, bill.description)}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Membership</DialogTitle>
            <DialogDescription>
              Choose a new plan to upgrade your membership
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {availablePlans.map((plan) => (
              <Card
                key={plan.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedPlanForUpgrade?.id === plan.id ? 'border-2 border-primary' : ''
                }`}
                onClick={() => setSelectedPlanForUpgrade(plan)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(plan.price)} / {plan.billingCycle}
                    </div>
                    <ul className="mt-2 text-sm space-y-1 text-muted-foreground">
                      {plan.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    size="sm"
                    disabled={currentMembership && plan.type === currentMembership.type}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleUpgradeToPlan(plan);
                    }}
                  >
                    {currentMembership && plan.type === currentMembership.type
                      ? "Current"
                      : selectedPlanForUpgrade?.id === plan.id
                        ? "Confirm Upgrade"
                        : "Select"
                    }
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto-Renewal Confirmation Dialog */}
      <Dialog open={showAutoRenewDialog} onOpenChange={setShowAutoRenewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Auto-Renewal Change</DialogTitle>
            <DialogDescription>
              {currentMembership?.autoRenew
                ? "Are you sure you want to disable auto-renewal? Your membership will expire at the end of the current billing cycle."
                : "Are you sure you want to enable auto-renewal? Your membership will automatically renew at the end of each billing cycle."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowAutoRenewDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggleAutoRenew}
              variant={currentMembership?.autoRenew ? "destructive" : "default"}
            >
              {currentMembership?.autoRenew ? "Disable" : "Enable"} Auto-Renewal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
