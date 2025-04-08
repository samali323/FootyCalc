"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Home, Users, Calendar, BarChart, Leaf, ChevronRight, Menu, X, Settings, HelpCircle, TrendingUp, ShieldAlert } from "lucide-react"
import { getCarbonOffsetStatus } from "@/lib/carbonOffset"
import { useAuth } from "@/components/auth/auth-provider"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Matches & Emissions", href: "/matches", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
]

export function Sidebar() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState(null)
  const [offsetPercentage, setOffsetPercentage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  
  useEffect(() => {
    const fetchOffsetData = async () => {
      try {
        setIsLoading(true)
        const { offsetPercentage } = await getCarbonOffsetStatus()
        setOffsetPercentage(offsetPercentage)
      } catch (error) {
        console.error("Error fetching carbon offset status:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchOffsetData()
  }, [])

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const renderNavLink = (item, section) => {
    const { name, href, icon: Icon } = item
    const isMatchesEmissionsTab = name === "Matches & Emissions"
    const isActive = 
      pathname === href || 
      (isMatchesEmissionsTab && pathname === "/emissions")
    const isHovered = hoveredItem === `${section}-${name}`

    return (
      <Link
        key={`${section}-${name}`}
        href={href}
        className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-emerald-600/30 to-gray-800 text-white"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}
        onMouseEnter={() => setHoveredItem(`${section}-${name}`)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
        )}

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            isActive 
              ? "bg-emerald-600 text-white" 
              : "bg-gray-800 text-gray-400 group-hover:text-emerald-400"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>

        <span className="ml-3 flex-1 font-medium">{name}</span>

        {(isActive || isHovered) && (
          <ChevronRight className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-gray-400"}`} />
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile menu button - moved to right side */}
      <div className="fixed top-4 right-4 z-30 lg:hidden">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-gray-200 shadow-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop sidebar - left side */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:w-72">
        <div className="flex h-full flex-col overflow-hidden rounded-r-xl bg-gray-900 shadow-xl">
          {/* Sidebar content for desktop */}
          {renderSidebarContent()}
        </div>
      </div>

      {/* Mobile sidebar - right side */}
      <div 
        className={`fixed inset-y-0 right-0 z-20 w-72 transform overflow-y-auto transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-l-xl bg-gray-900 shadow-xl">
          {/* Sidebar content for mobile */}
          {renderSidebarContent()}
        </div>
      </div>

      {/* Spacer div to push content over on large screens */}
      <div className="hidden lg:block lg:w-72"></div>
    </>
  )

  function renderSidebarContent() {
    return (
      <>
        {/* Logo header */}
        <div className="flex h-16 items-center justify-start px-6 bg-gradient-to-r from-emerald-800 to-gray-900 border-b border-gray-800">
          <div className="flex items-center">
            <div className="p-1.5 bg-emerald-800/40 rounded-lg">
              <Leaf className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="ml-3 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-emerald-500">
              Sports Emissions
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="px-4 pb-2">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Main Navigation</p>
          </div>

          <nav className="mt-2 px-3 space-y-1">
            {navigation.map(item => renderNavLink(item, 'main'))}
            
            {/* Admin Dashboard - Only visible when user is logged in */}
           
{user && (
  <Link
    href="/dashboard"
    className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
      pathname === "/dashboard"
        ? "bg-gradient-to-r from-emerald-600/30 to-gray-800 text-white"
        : "text-gray-300 hover:bg-gradient-to-r hover:from-emerald-800/20 hover:to-gray-800 hover:text-white"
    }`}
    onMouseEnter={() => setHoveredItem("main-admin")}
    onMouseLeave={() => setHoveredItem(null)}
  >
    {pathname === "/dashboard" && (
      <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
    )}

    <span
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
        pathname === "/dashboard"
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" 
          : "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 group-hover:from-emerald-700 group-hover:to-emerald-900 group-hover:text-white"
      }`}
    >
      <ShieldAlert className="h-5 w-5" />
    </span>

    <span className="ml-3 flex-1 font-medium">
      <span className="flex items-center">
        Admin Dashboard
        <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-emerald-800/60 text-emerald-300 rounded-md">
          Pro
        </span>
      </span>
    </span>

    {(pathname === "/dashboard" || hoveredItem === "main-admin") && (
      <ChevronRight className={`h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 ${pathname === "/dashboard" ? "text-emerald-400" : "text-gray-400"}`} />
    )}
  </Link>
)}
          </nav>

          {/* Carbon Offset Insights */}
          <div className="px-4 pt-6 pb-2">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Insights</p>
          </div>

          <div className="mx-3 mb-6 overflow-hidden rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg border border-gray-800">
            <div className="px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-lg bg-emerald-600/20 p-3">
                  <BarChart className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Carbon Offset</dt>
                    <dd>
                      <div className="text-lg font-semibold text-white">
                        {isLoading ? (
                          <div className="h-6 w-16 bg-gray-700 rounded animate-pulse" />
                        ) : (
                          `${offsetPercentage}%`
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="relative h-2.5 overflow-hidden rounded-full bg-gray-700/60">
                  {isLoading ? (
                    <div className="absolute inset-y-0 left-0 bg-gray-600 rounded-full animate-pulse w-3/4" />
                  ) : (
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out"
                      style={{ width: offsetPercentage !== null ? `${offsetPercentage}%` : "0%" }}
                    />
                  )}
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                {isLoading ? (
                  <div className="h-3 w-32 bg-gray-700 rounded animate-pulse" />
                ) : (
                  <p>Team emissions offset this quarter</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-auto px-4 py-3 text-center">
            <div className="text-xs text-gray-500">v1.2.0</div>
          </div>
        </div>
      </>
    )
  }
}