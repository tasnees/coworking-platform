'use client'

import { useState, type ReactNode, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { LogoutButton } from '@/components/auth/LogoutButton'

type NavigationItem = {
  name: string
  href: (role: string) => string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

const navigation: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: (role) => `/dashboard/${role}`, 
    icon: LayoutDashboard, 
    roles: ['admin', 'staff', 'member'] 
  },
  { 
    name: 'Bookings', 
    href: (role) => `/dashboard/${role}/bookings`, 
    icon: Calendar, 
    roles: ['admin', 'staff', 'member'] 
  },
  { 
    name: 'Members', 
    href: (role) => `/dashboard/${role}/members`, 
    icon: Users, 
    roles: ['admin', 'staff'] 
  },
  { 
    name: 'Memberships', 
    href: (role) => `/dashboard/${role}/memberships`, 
    icon: CreditCard, 
    roles: ['admin', 'member'] 
  },
  { 
    name: 'Check-In', 
    href: (role) => `/dashboard/${role}/checkin`, 
    icon: QrCode, 
    roles: ['admin', 'staff', 'member'] 
  },
  { 
    name: 'Analytics', 
    href: (role) => `/dashboard/${role}/analytics`, 
    icon: BarChart3, 
    roles: ['admin'] 
  },
  { 
    name: 'Settings', 
    href: (role) => `/dashboard/${role}/settings`, 
    icon: Settings, 
    roles: ['admin', 'staff', 'member'] 
  },
]

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: 'admin' | 'staff' | 'member';
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  
  // Use provided userRole or extract from pathname
  const role = userRole || (pathname?.split('/')[2] as 'admin' | 'staff' | 'member') || 'member';
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Filter navigation items based on user role
  const filteredNavItems = navigation.filter(item => 
    item.roles.includes(role as 'admin' | 'staff' | 'member')
  )
  
  // Check if current path is active
  const isActive = (href: (role: string) => string) => {
    return pathname === href(role as 'admin' | 'staff' | 'member');
  }

  // Handle authentication state
  useEffect(() => {
    if (isMounted && !isLoading && !user) {
      const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/auth/login?callbackUrl=${callbackUrl}`);
    }
  }, [user, isLoading, router, isMounted]);

  // Show loading state while checking auth or if not mounted
  if (isLoading || !isMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated - will be handled by the useEffect
  if (!user || !isMounted) {
    return null;
  }

  const renderNavItems = () => {
    return filteredNavItems.map((item) => {
      const Icon = item.icon
      const href = item.href(role)
      const active = isActive(item.href)
      return (
        <Link
          key={item.name}
          href={href}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            active
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Icon className="mr-3 h-5 w-5" />
          {item.name}
        </Link>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between border-b px-4">
            <h1 className="text-xl font-bold text-primary">OmniSpace</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              ×
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {renderNavItems()}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center border-b px-4">
            <h1 className="text-xl font-bold text-primary">OmniSpace</h1>
            <Badge variant="secondary" className="ml-2 text-xs">
              {role.toUpperCase()}
            </Badge>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {renderNavItems()}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="ghost" size="sm" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-8 w-8 rounded-full"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.image || "/placeholder-user.jpg"} 
                        alt={user.name || "User"} 
                      />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email || ''}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/${role}/settings`)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="w-full">
                    <LogoutButton 
                      className="w-full justify-start px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      redirectPath="/auth/login"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
