'use client'

import React, { ReactNode, Suspense, ErrorInfo } from 'react'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard-layout'
import { useRouter } from 'next/navigation.js'

// Loading component for the dashboard
function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  )
}

// Error boundary component
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by error boundary:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return <DashboardError error={this.state.error!} reset={this.resetError} />
    }

    return this.props.children
  }
}

// Error display component
function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-700 mb-4">{error.message || 'An unexpected error occurred'}</p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

// Error boundary for the dashboard
function DashboardErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardLoading />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// Wrapper to ensure auth is loaded
function AuthWrapper({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth()
  
  if (isLoading) {
    return <DashboardLoading />
  }
  
  return <>{children}</>
}

export default function DashboardRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <SessionProvider>
      <AuthProvider>
        <DashboardErrorBoundary>
          <AuthWrapper>
            <DashboardLayout>
              <Suspense fallback={<DashboardLoading />}>
                {children}
              </Suspense>
            </DashboardLayout>
          </AuthWrapper>
        </DashboardErrorBoundary>
      </AuthProvider>
    </SessionProvider>
  )
}
