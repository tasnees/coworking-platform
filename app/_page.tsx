"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { getDashboardPath } from "@/lib/utils/routes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Only run on client side
    setIsClient(true)
    
    if (status === 'authenticated' && !isRedirecting && isClient) {
      setIsRedirecting(true)
      const role = (session.user.role?.toLowerCase() as 'admin' | 'staff' | 'member') || 'member'
      router.push(getDashboardPath(role))
    }
  }, [status, session, isRedirecting, router, isClient])

  // Show loading state while checking auth status
  if (status === 'loading' || (status === 'authenticated' && isRedirecting)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If unauthenticated, show the landing page
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-16">
          <section className="text-center mb-20">
            <h1 className="text-5xl font-bold mb-6">Welcome to Our Coworking Space</h1>
            <p className="text-xl text-gray-600 mb-8">Find your perfect workspace and boost your productivity</p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          </section>
          
          {/* Features Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Smart Booking</h3>
              <p className="text-gray-600">Book workspaces in real-time with our intuitive booking system</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Member Network</h3>
              <p className="text-gray-600">Connect with other professionals in our community</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">24/7 Access</h3>
              <p className="text-gray-600">Access your workspace anytime, day or night</p>
            </div>
          </section>
        </main>
      </div>
    )
  }

  // Fallback loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}
