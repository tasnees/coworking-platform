"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import DashboardLayout from "@/components/dashboard-layout"
import { Calendar, Clock, CreditCard, Users, Star, CheckCircle, AlertCircle, TrendingUp, Package, Zap, Shield } from "lucide-react"
interface MembershipPlan {
  id: string
  name: string
  type: "basic" | "standard" | "premium" | "enterprise"
  price: number
  billingCycle: "monthly" | "quarterly" | "annually"
  features: string[]
  credits: number
  maxUsers: number
  currentUsers: number
  status: "active" | "inactive" | "pending"
  startDate: string
  endDate?: string
  autoRenew: boolean
}
interface UsageStats {
  monthly: {
    creditsUsed: number
    creditsRemaining: number
    totalCredits: number
    bookings: number
    hoursUsed: number
  }
  daily: {
    checkIns: number
    hoursToday: number
    amenitiesUsed: string[]
  }
}
interface BillingHistory {
  id: string
  date: string
  amount: number
  status: "paid" | "pending" | "failed"
  description: string
  invoiceUrl?: string
}
export default function MembershipsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showAutoRenewDialog, setShowAutoRenewDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)
  const [currentMembership, setCurrentMembership] = useState<MembershipPlan>({
    id: "premium-001",
    name: "Premium Plan",
    type: "premium",
    price: 299,
    billingCycle: "monthly",
    features: [
      "Unlimited desk bookings",
      "10 meeting room hours/month",
      "Premium WiFi",
      "Coffee & snacks",
      "Printing (100 pages/month)",
      "Phone booth access",
      "Event space discount",
      "Priority support"
    ],
    credits: 50,
    maxUsers: 1,
    currentUsers: 1,
    status: "active",
    startDate: "2024-01-01",
    autoRenew: true
  })
  // Mock usage statistics
  const usageStats: UsageStats = {
    monthly: {
      creditsUsed: 32,
      creditsRemaining: 18,
      totalCredits: 50,
      bookings: 12,
      hoursUsed: 45.5
    },
    daily: {
      checkIns: 8,
      hoursToday: 6.5,
      amenitiesUsed: ["WiFi", "Coffee", "Meeting Room A", "Printer"]
    }
  }
  // Mock billing history
  const billingHistory: BillingHistory[] = [
    {
      id: "bill-001",
      date: "2024-01-15",
      amount: 299,
      status: "paid",
      description: "Premium Plan - January 2024",
      invoiceUrl: "/invoices/inv-001.pdf"
    },
    {
      id: "bill-002",
      date: "2023-12-15",
      amount: 299,
      status: "paid",
      description: "Premium Plan - December 2023",
      invoiceUrl: "/invoices/inv-002.pdf"
    },
    {
      id: "bill-003",
      date: "2023-11-15",
      amount: 299,
      status: "paid",
      description: "Premium Plan - November 2023",
      invoiceUrl: "/invoices/inv-003.pdf"
    }
  ]
  // Available plans for upgrade
  const availablePlans: MembershipPlan[] = [
    {
      id: "basic-001",
      name: "Basic Plan",
      type: "basic",
      price: 99,
      billingCycle: "monthly",
      features: [
        "5 desk bookings/month",
        "Basic WiFi",
        "Coffee access"
      ],
      credits: 10,
      maxUsers: 1,
      currentUsers: 0,
      status: "inactive",
      startDate: "",
      autoRenew: true
    },
    {
      id: "standard-001",
      name: "Standard Plan",
      type: "standard",
      price: 199,
      billingCycle: "monthly",
      features: [
        "25 desk bookings/month",
        "5 meeting room hours/month",
        "Premium WiFi",
        "Coffee & snacks",
        "Printing (50 pages/month)"
      ],
      credits: 25,
      maxUsers: 1,
      currentUsers: 0,
      status: "inactive",
      startDate: "",
      autoRenew: true
    },
    {
      id: "enterprise-001",
      name: "Enterprise Plan",
      type: "enterprise",
      price: 599,
      billingCycle: "monthly",
      features: [
        "Unlimited everything",
        "50 meeting room hours/month",
        "Premium WiFi",
        "Coffee & snacks",
        "Unlimited printing",
        "Dedicated desk option",
        "24/7 access",
        "Event space access",
        "Priority booking",
        "Team management"
      ],
      credits: 100,
      maxUsers: 5,
      currentUsers: 0,
      status: "inactive",
      startDate: "",
      autoRenew: true
    }
  ]
  const getPlanIcon = (type: string) => {
    switch (type) {
      case "basic":
        return <Package className="h-5 w-5" />
      case "standard":
        return <Zap className="h-5 w-5" />
      case "premium":
        return <Star className="h-5 w-5" />
      case "enterprise":
        return <Shield className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }
  const getPlanColor = (type: string) => {
    switch (type) {
      case "basic":
        return "text-gray-600"
      case "standard":
        return "text-blue-600"
      case "premium":
        return "text-purple-600"
      case "enterprise":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  const calculateProgress = (used: number, total: number) => {
    return Math.min((used / total) * 100, 100)
  }
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  const handleDownloadInvoice = (invoiceId: string, description: string) => {
    if (!isClient) return // Don't run on server
    try {
      // In a real app, this would generate/download a PDF invoice
      // For now, we'll create a mock invoice and trigger download
      const invoiceData = {
        id: invoiceId,
        description: description,
        date: new Date().toISOString(),
        amount: currentMembership.price,
        member: "Current User",
        plan: currentMembership.name
      }
      // Create a simple text file for demo purposes
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
      `.trim()
      const blob = new Blob([invoiceText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceId}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating invoice:', error)
    }
  }
  const handleToggleAutoRenew = () => {
    setShowAutoRenewDialog(true)
  }
  const confirmToggleAutoRenew = () => {
    // In a real app, this would make an API call to update auto-renewal
    setCurrentMembership((prev: MembershipPlan) => ({
      ...prev,
      autoRenew: !prev.autoRenew
    }))
    setShowAutoRenewDialog(false)
  }
  // Show loading state until client-side rendering is ready
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }
  return (
    <DashboardLayout userRole="member">
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
                  onClick={() => setShowUpgradeDialog(true)}
                >
                  Upgrade Plan
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleToggleAutoRenew}
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
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {/* Available Plans */}
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
                            variant={plan.type === currentMembership.type ? "outline" : "default"}
                            disabled={plan.type === currentMembership.type}
                            onClick={() => setSelectedPlan(plan)}
                          >
                            {plan.type === currentMembership.type ? "Current Plan" : "Upgrade"}
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
            {/* Billing Summary */}
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
                      onClick={handleToggleAutoRenew}
                      className="w-full"
                    >
                      {currentMembership.autoRenew ? "Disable Auto-Renewal" : "Enable Auto-Renewal"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Billing History */}
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
                <Card key={plan.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(plan.price)} / {plan.billingCycle}
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      disabled={plan.type === currentMembership.type}
                    >
                      {plan.type === currentMembership.type ? "Current" : "Select"}
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
                {currentMembership.autoRenew 
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
                onClick={confirmToggleAutoRenew}
                variant={currentMembership.autoRenew ? "destructive" : "default"}
              >
                {currentMembership.autoRenew ? "Disable" : "Enable"} Auto-Renewal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
