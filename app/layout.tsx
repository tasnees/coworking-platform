import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
