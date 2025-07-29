"use client"

import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: ("admin" | "staff" | "member")[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ["admin", "staff", "member"],
  redirectTo = "/auth/login"
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // If not logged in, redirect to login
      if (!user) {
        router.push(redirectTo)
        return
      }

      // If user role is not in allowed roles, redirect to dashboard
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        router.push(`/dashboard/${user.role}`)
      }
    }
  }, [user, isLoading, allowedRoles, router, redirectTo])

  // Show loading state while checking auth
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If user role is not allowed, show unauthorized message
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  // If user is authenticated and has the right role, render children
  return <>{children}</>
}

// Higher-order component for protected routes with specific roles
export function withRole(
  WrappedComponent: React.ComponentType,
  allowedRoles: ("admin" | "staff" | "member")[] = ["admin", "staff", "member"]
) {
  return function WithRoleWrapper() {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <WrappedComponent />
      </ProtectedRoute>
    )
  }
}
