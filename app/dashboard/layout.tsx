'use client'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard-layout'

export default function DashboardRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <SessionProvider>
      <AuthProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </AuthProvider>
    </SessionProvider>
  )
}
