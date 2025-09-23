import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"
import { ErrorBoundary } from "@/components/error-boundary"
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </head>
        <body className="min-h-screen bg-background font-sans antialiased">
          <ErrorBoundary>
            <Providers>
              <header className="border-b border-border bg-card">
                <div className="container flex h-16 items-center justify-between px-4">
                  <div className="text-lg font-semibold">Coworking Platform</div>
                  <nav className="flex items-center gap-4">
                    {/* Navigation will be handled by individual pages */}
                  </nav>
                </div>
              </header>
              <main className="flex-1">
                {children}
              </main>
              <Toaster />
            </Providers>
          </ErrorBoundary>
        </body>
      </html>
    </SessionProvider>
  )
}
