"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, useAuth } from "@/components/auth/auth-provider"
import { Sidebar } from "@/components/sidebar"
import { ToastContainer } from "react-toastify"
import LoginPage from "./auth/login/page"
import SignupPage from "./sign-up/page"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

// Component to handle protected routes
function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading, profile } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // Define protected admin routes
    const protectedRoutes = [
      "/adminDashboard",
      // "/process-calculation",
      "/editor",
    ]

    // Redirect non-admin users from protected routes to dashboard
    if (user && protectedRoutes.includes(pathname) && profile?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [profile, isLoading, pathname, router, user])

  // Render children if not loading and user is authorized
  return isLoading ? null : <>{children}</>
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Explicitly exclude sidebar for /view/[id] routes
  if (pathname.startsWith("/view")) {
    return <>{children}</>
  }

  switch (pathname) {
    case "/":
      return <AuthProvider>{children}</AuthProvider>

    case "/auth/login":
      return (
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      )

    case "/sign-up":
      return (
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      )

    default:
      return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-6 lg:pl-6">
                <ToastContainer />
                <div className="mx-auto max-w-7xl">
                  <ProtectedContent>{children}</ProtectedContent>
                </div>
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      )
  }
}