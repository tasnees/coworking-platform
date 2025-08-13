"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, QrCode, BarChart3, Smartphone, Zap, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { useSession } from "next-auth/react"
export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter();
  const [lastLogin, setLastLogin] = useState<string | null>(null)
  const [lastLoginTime, setLastLoginTime] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Only run on client side
    const handleClientLoad = () => {
      setIsClient(true)
      if (status === 'authenticated' && !isRedirecting) {
        try {
          const lastLoginValue = localStorage.getItem("lastLogin") || session?.user?.email || ""
          const lastLoginTimeValue = localStorage.getItem("lastLoginTime") || new Date().toLocaleString()
          setLastLogin(lastLoginValue)
          setLastLoginTime(lastLoginTimeValue)
          
          // Set a flag to prevent multiple redirects
          setIsRedirecting(true)
          router.push('/dashboard')
        } catch (error) {
          console.error('Error accessing localStorage:', error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    if (typeof window !== 'undefined') {
      handleClientLoad()
    } else {
      setIsLoading(false)
    }
  }, [status, session, isRedirecting, router])

  // Show loading state during SSR or initial client load
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem("lastLogin");
        localStorage.removeItem("lastLoginTime");
      } catch (error) {
        console.error('Error clearing localStorage:', error)
      }
    }
    router.push("/auth/login");
  };
  const features = [
    {
      icon: Users,
      title: "Member Management",
      description: "Comprehensive member profiles, role-based access, and subscription management",
    },
    {
      icon: Calendar,
      title: "Smart Booking System",
      description: "Real-time availability, calendar integration, and automated scheduling",
    },
    {
      icon: QrCode,
      title: "QR Check-in",
      description: "Contactless entry system with attendance tracking and analytics",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Occupancy insights, revenue tracking, and performance metrics",
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Responsive design optimized for all devices and screen sizes",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Live booking status, instant notifications, and dynamic pricing",
    },
  ]
  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "Perfect for small coworking spaces",
      features: ["Up to 50 members", "Basic booking system", "QR check-in", "Email support", "Mobile app access"],
      popular: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "Ideal for growing coworking businesses",
      features: [
        "Up to 200 members",
        "Advanced analytics",
        "Payment integration",
        "Priority support",
        "Custom branding",
        "API access",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large coworking networks",
      features: [
        "Unlimited members",
        "Multi-location support",
        "Advanced integrations",
        "Dedicated support",
        "Custom features",
        "SLA guarantee",
      ],
      popular: false,
    },
  ]
  // Show loading state while session is being checked or during SSR
  if (status === 'loading' || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  // Show loading state while redirecting
  if (status === 'authenticated' && isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }
  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">OmniSpace</h1>
              <Badge variant="secondary" className="ml-2">
                Beta
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Last Login</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Last Login Information</DialogTitle>
                    <DialogDescription>
                      {lastLogin && lastLoginTime ? (
                        <>
                          <span className="block mb-2">
                            <span className="font-semibold">User:</span> {lastLogin}
                          </span>
                          <span className="block">
                            <span className="font-semibold">Time:</span> {lastLoginTime}
                          </span>
                        </>
                      ) : (
                        <span>No login information found.</span>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            The Future of
            <span className="text-primary block">Coworking Management</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Streamline your coworking space with our comprehensive platform. From smart bookings to AI-powered insights,
            manage everything in one place while delivering an exceptional member experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Manage Your Space</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines essential coworking management tools with cutting-edge technology to help you
              operate more efficiently.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your coworking space. All plans include our core features with no hidden fees.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? "border-primary shadow-xl scale-105" : "border-0 shadow-lg"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Shield className="h-4 w-4 text-green-600 mr-3" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.name === "Enterprise" ? (
                    <a href="mailto:omnispace@contactsales@gmail.com" className="w-full">
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                        Contact Sales
                      </Button>
                    </a>
                  ) : (
                    <Link href="/auth/login" className="w-full">
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                        Start Free Trial
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Coworking Space?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of coworking spaces already using OmniSpace to streamline their operations and delight their
            members.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-xl font-bold mb-4">OmniSpace</h3>
              <p className="text-gray-400">The complete coworking management platform for the modern workspace.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 OmniSpace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
