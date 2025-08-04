"use client"

import { useRouter } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { UserRole } from "@/lib/auth-types"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
  loadingComponent?: ReactNode
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ["admin", "staff", "member"],
  redirectTo = "/auth/login",
  loadingComponent = (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    const user = session?.user
    const isAuthenticated = status === 'authenticated'
    
    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      router.push(redirectTo)
      return
    }

    if (user?.role && !allowedRoles.includes(user.role as UserRole)) {
      // Not authorized for this route, redirect to dashboard
      router.push('/dashboard')
      return
    }

    // User is authenticated and authorized
    setIsAuthorized(true)
  }, [status, session, allowedRoles, router, redirectTo])

  if (status === 'loading' || isAuthorized === null) {
    return <>{loadingComponent}</>
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

// Higher-order component for protected routes with specific roles
export function withRole<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  allowedRoles: UserRole[] = ["admin", "staff", "member"]
) {
  return function WithRoleWrapper(props: T) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <WrappedComponent {...props as T} />
      </ProtectedRoute>
    )
  }
}
