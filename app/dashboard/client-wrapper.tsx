'use client'
import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/AuthContext'
interface ClientWrapperProps {
  children: ReactNode
  userRole?: 'admin' | 'staff' | 'member'
}
export default function ClientWrapper({ children, userRole = 'member' }: ClientWrapperProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  )
}
