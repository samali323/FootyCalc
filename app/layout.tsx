import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { AuthProvider } from "@/components/auth/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sports Emissions Dashboard",
  description: "Track and analyze sports travel emissions",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-6 lg:pl-6">
                <div className="mx-auto max-w-7xl">
                  {children}
                </div>
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}