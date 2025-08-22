"use client"

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/auth-types'

interface User {
  id: string
  email: string | null
  name: string | null
  image: string | null
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        return { error: result.error }
      }

      if (result?.ok) {
        return {}
      }

      return { error: 'Invalid credentials' }
    } catch (error) {
      console.error('Login error:', error)
      return { error: 'An error occurred during login' }
    }
  }

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Only provide context after the component has mounted
  if (!isMounted) {
    return null
  }

  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email || null,
    name: session.user.name || null,
    image: session.user.image || null,
    role: session.user.role || 'member' as UserRole
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
  if (typeof window === 'undefined') {
    return {
      user: null,
      login: async () => ({ error: 'Not available during SSR' }),
      logout: async () => {},
      isLoading: true,
      isAuthenticated: false,
    } as AuthContextType
  }

  if (context === null) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Make sure your app is wrapped with <Providers> in your component tree.'
    )
  }
  
  return context
}
