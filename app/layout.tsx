import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"
export const metadata: Metadata = {
  title: "Coworking Platform",
  description: "Professional coworking space management system",
  generator: 'v0.dev'
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="font-sans antialiased">
      <Providers>
        {children}
        <Toaster />
      </Providers>
    </div>
  )
}
