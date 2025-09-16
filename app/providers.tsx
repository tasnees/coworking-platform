"use client"

import { ClerkProvider } from "@/lib/clerk-provider"
import { AuthProvider } from "@/contexts/AuthContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ClerkProvider>
  )
}
