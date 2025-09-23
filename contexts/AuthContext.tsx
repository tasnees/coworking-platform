"use client"

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
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
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const login = async (email: string, password: string) => {
    // This will be handled by NextAuth sign-in page
    return { error: 'Use NextAuth sign-in page instead' }
  }

  const logout = async () => {
    try {
      await signOut({ callbackUrl: '/auth/signin' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Only provide context after the component has mounted
  if (!isMounted) {
    return null
  }

  const user = session?.user ? {
    id: (session.user as any).id || '',
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: (session.user as any).role || 'MEMBER',
  } : null

  const value = {
    user,
    login,
    logout,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
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

  return context
}
