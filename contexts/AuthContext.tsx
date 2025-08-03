"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/auth-types'

interface User {
  id?: string
  email?: string | null
  name?: string | null
  image?: string | null
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

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
      return { error: 'An error occurred during login' }
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? '',
    image: session.user.image ?? null,
    role: session.user.role
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
