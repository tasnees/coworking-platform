"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Calendar,
  Users,
  CreditCard,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Bell,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: "admin" | "staff" | "member"
}

export default function DashboardLayout({ children, userRole = "member" }: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const userData = typeof window !== 'undefined' ? localStorage.getItem("user") : null
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        console.error("Failed to parse user data:", e)
      }
    }
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user")
    }
    router.push("/auth/login")
  }

  const navigation = [
    { name: "Dashboard", href: `/dashboard/${userRole}`, icon: LayoutDashboard, roles: ["admin", "staff", "member"] },
    { name: "Bookings", href: `/dashboard/${userRole}/bookings`, icon: Calendar, roles: ["admin", "staff", "member"] },
    { name: "Members", href: `/dashboard/${userRole}/members`, icon: Users, roles: ["admin", "staff"] },
    {
      name: "Memberships",
      href: `/dashboard/${userRole}/memberships`,
      icon: CreditCard,
      roles: ["admin", "staff", "member"],
    },
    { name: "Check-In", href: `/dashboard/${userRole}/checkin`, icon: QrCode, roles: ["admin", "staff", "member"] },
    { name: "Analytics", href: `/dashboard/${userRole}/analytics`, icon: BarChart3, roles: ["admin"] },
    { name: "Settings", href: `/dashboard/${userRole}/settings`, icon: Settings, roles: ["admin", "staff", "member"] },
  ]

  const filteredNavigation = navigation.filter((item) => item.roles.includes(userRole))

  // Don't render anything until the component has mounted client-side
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold text-primary">OmniSpace</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              ×
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b">
            <h1 className="text-xl font-bold text-primary">OmniSpace</h1>
            <Badge variant="secondary" className="ml-2 text-xs">
              {userRole.toUpperCase()}
            </Badge>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" alt="User" />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userRole} account</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
