"use client"

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useClerk, useSession } from '@clerk/nextjs'
import type { User as ClerkUser } from '@clerk/nextjs/server'
import { UserRole } from '@/lib/auth-types'

// User type that matches our NextAuth session user
type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
  [key: string]: unknown; // Allow additional properties
};

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded: isUserLoaded, user } = useUser()
  const { isLoaded: isSessionLoaded, session } = useSession()
  const { signOut: clerkSignOut } = useClerk()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsMounted(true)
    if (isUserLoaded && isSessionLoaded) {
      setIsLoading(false)
    }
  }, [isUserLoaded, isSessionLoaded])

  const login = async (email: string, password: string) => {
    // This will be handled by Clerk's sign-in page
    return { error: 'Use Clerk sign-in component instead' }
  }

  const logout = async () => {
    try {
      await clerkSignOut()
      router.push('/auth/sign-in')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Only provide context after the component has mounted
  if (!isMounted) {
    return null
  }

  const clerkUser = user ? {
    id: user.id,
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    email: user.primaryEmailAddress?.emailAddress || '',
    image: user.imageUrl,
    role: (user.unsafeMetadata?.role as UserRole) || 'member',
  } : null

  const value = {
    user: clerkUser,
    login,
    logout,
    isLoading: !isUserLoaded || !isSessionLoaded || !isMounted,
    isAuthenticated: !!user && isMounted,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  // If we're on the server, return a default context
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  // Get Clerk's auth state directly
  const { isLoaded: isUserLoaded, user } = useUser()
  const { isLoaded: isSessionLoaded } = useSession()
  const { signOut: clerkSignOut } = useClerk()
  const router = useRouter()
  
  // If we have Clerk's auth state, use it to keep the context in sync
  useEffect(() => {
    if (isUserLoaded && isSessionLoaded && user) {
      // The context will be updated by the AuthProvider
      // This effect just ensures we have the latest auth state
    }
  }, [isUserLoaded, isSessionLoaded, user])
  
  // Return the context with Clerk's auth state
  return {
    ...context,
    // Override logout to use Clerk's signOut
    logout: async () => {
      await clerkSignOut()
      router.push('/auth/sign-in')
    },
    // Keep the rest of the context
    user: context.user,
    login: context.login,
    isLoading: context.isLoading,
    isAuthenticated: context.isAuthenticated
  }
}
