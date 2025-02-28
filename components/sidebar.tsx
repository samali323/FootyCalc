"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Home, Users, Calendar, BarChart, Leaf, ChevronRight, Settings, HelpCircle } from "lucide-react"
import { getCarbonOffsetStatus } from "@/lib/carbonOffset"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Matches & Emissions", href: "/matches", icon: Calendar },
]

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "/help", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [offsetPercentage, setOffsetPercentage] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    <div className="hidden lg:block lg:w-72 shrink-0">
      <div className="fixed inset-y-0 z-20 flex h-full w-72 flex-col overflow-hidden rounded-r-xl bg-gray-900 shadow-xl">
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
          
          {/* Secondary Navigation */}
          {/* <div className="px-4 pb-2">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Support</p>
          </div>
          
          <nav className="mt-1 px-3 space-y-1">
            {secondaryNavigation.map(item => renderNavLink(item, 'secondary'))}
          </nav> */}
          
          {/* Footer with version */}
          <div className="mt-auto px-4 py-3 text-center">
            <div className="text-xs text-gray-500">v1.2.0</div>
          </div>
        </div>
      </div>  
    </div>
  )
}