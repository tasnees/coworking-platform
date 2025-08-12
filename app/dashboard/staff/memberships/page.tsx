"use client";

import { useState, useEffect } from "react";
import { Home, Settings, Users, Sun, Moon, Calendar, Clock, CreditCard, Star, CheckCircle, TrendingUp, Package, Zap, Shield } from "lucide-react";

// The `lucide-react` library is used here, and it is assumed to be available.
// If you are using a different icon library, you may need to adjust the imports.

// A reusable button component with Tailwind CSS styling.
const NavButton = ({ text, onClick, icon: Icon, isActive = false }: { text: string; onClick: () => void; icon?: React.ElementType; isActive?: boolean }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg group focus:outline-none focus:ring-2 focus:ring-indigo-500
      ${isActive ? 'bg-indigo-500 text-white' : 'text-gray-700 hover:bg-indigo-500 hover:text-white'}`}
  >
    {Icon && <Icon className={`w-5 h-5 mr-3 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />}
    {text}
  </button>
);

// A simple Dialog component to replace shadcn/ui Dialog
const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md mx-4">
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          &times;
        </button>
      </div>
    </div>
  );
};
const DialogContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>;
const DialogHeader = ({ children }: { children: React.ReactNode }) => <div className="space-y-1 mb-4">{children}</div>;
const DialogTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-bold">{children}</h3>;
const DialogDescription = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-gray-500">{children}</p>;

// A simple Card component to replace shadcn/ui Card
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col space-y-1.5 p-6">{children}</div>;
const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardDescription = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>;
const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

// A simple Badge component to replace shadcn/ui Badge
const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "secondary" | "destructive" }) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants = {
    default: "border-transparent bg-indigo-500 text-white hover:bg-indigo-600",
    secondary: "border-transparent bg-gray-200 text-gray-800 hover:bg-gray-300",
    destructive: "border-transparent bg-red-500 text-white hover:bg-red-600"
  };
  return <span className={`${baseClasses} ${variants[variant]}`}>{children}</span>;
};

// A simple Button component to replace shadcn/ui Button
const Button = ({ 
  children, 
  onClick, 
  className = "", 
  variant = "default", 
  disabled = false,
  size = "default"
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string; 
  variant?: "default" | "outline" | "ghost" | "destructive"; 
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-indigo-500 text-white shadow hover:bg-indigo-600",
    outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600",
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// A simple Progress component to replace shadcn/ui Progress
const Progress = ({ value, className = "" }: { value: number; className?: string }) => (
  <div className={`relative w-full h-2 overflow-hidden rounded-full bg-secondary ${className}`}>
    <div
      className="h-full w-full flex-1 bg-indigo-500 transition-all"
      style={{ transform: `translateX(-${100 - value}%)` }}
    />
  </div>
);

// A simple Tabs component to replace shadcn/ui Tabs
const Tabs = ({ children, value, onValueChange, className = "" }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void; className?: string }) => (
  <div className={className}>
    {children}
  </div>
);
const TabsList = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <div className={`inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground ${className}`}>{children}</div>;
const TabsTrigger = ({ children, value, className = "" }: { children: React.ReactNode; value: string; className?: string }) => <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow ${className}`}>{children}</button>;
const TabsContent = ({ children, value, className = "" }: { children: React.ReactNode; value: string; className?: string }) => <div className={className}>{children}</div>;

/**
 * The main layout for the dashboard, including a sidebar and main content area.
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - The content to be rendered in the main area.
 */
const DashboardLayout = ({ children, onNavigate }: { children: React.ReactNode; onNavigate: (page: string) => void }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [activePage, setActivePage] = useState('memberships');

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div className={`flex min-h-screen ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar */}
      <aside className={`w-64 p-6 transition-all duration-300 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} rounded-r-2xl shadow-lg`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-indigo-500">My Dashboard</h1>
          <button onClick={toggleTheme} className="p-2 transition-transform duration-300 transform rounded-full hover:scale-110">
            {isDarkTheme ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-600" />}
          </button>
        </div>
        <nav className="space-y-4">
          <NavButton text="Home" onClick={() => onNavigate('home')} icon={Home} isActive={activePage === 'home'} />
          <NavButton text="Users" onClick={() => onNavigate('users')} icon={Users} isActive={activePage === 'users'} />
          <NavButton text="Memberships" onClick={() => setActivePage('memberships')} icon={Star} isActive={activePage === 'memberships'} />
          <NavButton text="Settings" onClick={() => onNavigate('settings')} icon={Settings} isActive={activePage === 'settings'} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className={`p-8 transition-colors duration-300 rounded-2xl shadow-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

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
    creditsRemaining: number;
    totalCredits: number;
    bookings: number;
    hoursUsed: number;
  };
  daily: {
    checkIns: number;
    hoursToday: number;
    amenitiesUsed: string[];
  };
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: BillingStatus;
  description: string;
  invoiceUrl?: string;
}

// Mock data generation functions
const generateMockMembership = (): MembershipPlan => ({
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
});

const generateMockUsageStats = (): UsageStats => ({
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
});

const generateMockBillingHistory = (): BillingHistory[] => [
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
];

// Corrected available plans mock data with unique IDs
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
];

const MembershipsPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showAutoRenewDialog, setShowAutoRenewDialog] = useState(false);
  const [currentMembership, setCurrentMembership] = useState<MembershipPlan | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<MembershipPlan | null>(null);

  // Initialize data on client-side only
  useEffect(() => {
    setIsClient(true);

    const loadData = async () => {
      try {
        setCurrentMembership(generateMockMembership());
        setUsageStats(generateMockUsageStats());
        setBillingHistory(generateMockBillingHistory());
      } catch (error) {
        console.error("Error loading membership data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper functions
  const getPlanIcon = (type: string) => {
    switch (type) {
      case "basic": return <Package className="h-5 w-5" />;
      case "standard": return <Zap className="h-5 w-5" />;
      case "premium": return <Star className="h-5 w-5" />;
      case "enterprise": return <Shield className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case "basic": return "text-gray-600";
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
    if (total === 0) return 0;
    return Math.min((used / total) * 100, 100);
  };

  // Event handlers
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!currentMembership || !usageStats || !billingHistory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-muted-foreground">Error: Data not loaded.</div>
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
            <Badge variant="default">
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
                    onClick={() => setShowAutoRenewDialog(true)}
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
                        className="h-8"
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
                    disabled={currentMembership && plan.type === currentMembership.type}
                    className="h-8"
                  >
                    {currentMembership && plan.type === currentMembership.type ? "Current" : "Select"}
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
  )
};

const App = () => {
  return (
    <DashboardLayout onNavigate={() => {}}>
      <MembershipsPage />
    </DashboardLayout>
  );
};

export default App;
