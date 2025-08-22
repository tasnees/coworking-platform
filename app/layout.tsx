import type { Metadata, Viewport } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"
import { ErrorBoundary } from "@/components/error-boundary"

// Generate static params for all routes
export function generateStaticParams() {
  return [
    // Public routes
    { path: [''] },
    { path: ['login'] },
    { path: ['register'] },
    { path: ['forgot-password'] },
    
    // Dashboard routes
    { path: ['dashboard'] },
    
    // Admin routes
    { path: ['dashboard', 'admin'] },
    { path: ['dashboard', 'admin', 'amenities'] },
    { path: ['dashboard', 'admin', 'analytics'] },
    { path: ['dashboard', 'admin', 'bookings'] },
    { path: ['dashboard', 'admin', 'checkin'] },
    { path: ['dashboard', 'admin', 'floorplan'] },
    { path: ['dashboard', 'admin', 'hours'] },
    { path: ['dashboard', 'admin', 'members'] },
    { path: ['dashboard', 'admin', 'memberships'] },
    { path: ['dashboard', 'admin', 'settings'] },
    { path: ['dashboard', 'admin', 'wifi'] },
    
    // Member routes
    { path: ['dashboard', 'member'] },
    { path: ['dashboard', 'member', 'amenities'] },
    { path: ['dashboard', 'member', 'bookings'] },
    { path: ['dashboard', 'member', 'checkin'] },
    { path: ['dashboard', 'member', 'floorplan'] },
    { path: ['dashboard', 'member', 'memberships'] },
    { path: ['dashboard', 'member', 'settings'] },
    { path: ['dashboard', 'member', 'wifi'] },
    
    // Staff routes
    { path: ['dashboard', 'staff'] },
    { path: ['dashboard', 'staff', 'bookings'] },
    { path: ['dashboard', 'staff', 'checkin'] },
    { path: ['dashboard', 'staff', 'members'] },
    { path: ['dashboard', 'staff', 'memberships'] },
    { path: ['dashboard', 'staff', 'settings'] },
  ];
}

export const metadata: Metadata = {
  title: "Coworking Platform",
  description: "Professional coworking space management system",
  generator: 'Next.js',
  applicationName: 'Coworking Platform',
  referrer: 'origin-when-cross-origin',
  keywords: ['coworking', 'space', 'management', 'office', 'workspace'],
  authors: [{ name: 'Coworking Team' }],
  creator: 'Coworking Team',
  publisher: 'Coworking Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background">
        <ErrorBoundary>
          <Providers session={session}>
            {children}
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
