"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Users, Calendar, BarChart, Leaf, ChevronRight, Menu, X, TrendingUp, ShieldAlert, Calculator, Book } from "lucide-react";
import { getCarbonOffsetStatus } from "@/lib/carbonOffset";
import { useAuth } from "@/components/auth/auth-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

// Define profile data type
type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string; // e.g., "UserRole" or "admin"
};

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Matches & Emissions", href: "/matches", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [offsetPercentage, setOffsetPercentage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, setProfile } = useAuth();
  const [fetchingProfile, setFetchingProfile] = useState(false);
  // Fetch profile data when user is available and profile is not set
  useEffect(() => {
    async function fetchProfile() {
      if (!user || profile) return; // Skip if no user or profile already set

      setFetchingProfile(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, role")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 indicates no rows returned
          throw new Error(error.message);
        }

        if (data) {
          setProfile(data); // Update AuthProvider with existing profile
          console.log("Profile fetched in Sidebar:", data);
        } else {
          // No profile exists, create admin profile
          const adminProfile: Profile = {
            id: user.id,
            first_name: user.email?.split("@")[0] || "Admin",
            last_name: "",
            email: user.email || "",
            role: "admin",
          };

          const { error: insertError } = await supabase
            .from("profiles")
            .insert([adminProfile]);

          if (insertError) {
            throw new Error("Failed to create admin profile: " + insertError.message);
          }

          setProfile(adminProfile); // Update AuthProvider with new admin profile
          console.log("Admin profile created in Sidebar:", adminProfile);
          toast.success("Admin profile created");
        }
      } catch (err: any) {
        console.error("Error fetching or creating profile:", err.message);
        toast.error(err.message || "Failed to fetch or create profile");
      } finally {
        setFetchingProfile(false);
      }
    }

    fetchProfile();
  }, [user, profile, setProfile]);


  // Fetch carbon offset data
  useEffect(() => {
    const fetchOffsetData = async () => {
      try {
        setIsLoading(true);
        const { offsetPercentage } = await getCarbonOffsetStatus();
        setOffsetPercentage(offsetPercentage);
      } catch (error) {
        console.error("Error fetching carbon offset status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffsetData();
  }, []);

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const renderNavLink = (item: { name: string; href: string; icon: any }, section: string) => {
    const { name, href, icon: Icon } = item;
    const isMatchesEmissionsTab = name === "Matches & Emissions";
    const isActive = pathname === href || (isMatchesEmissionsTab && pathname === "/emissions");
    const isHovered = hoveredItem === `${section}-${name}`;

    return (
      <Link
        key={`${section}-${name}`}
        href={href}
        className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
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
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive
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
    );
  };

  return (
    <>
      {/* Mobile menu button - moved to right side */}
      <div className="fixed top-4 right-4 z-30 lg:hidden">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-gray-200 shadow-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
          {renderSidebarContent()}
        </div>
      </div>

      {/* Mobile sidebar - right side */}
      <div
        className={`fixed inset-y-0 right-0 z-20 w-72 transform overflow-y-auto transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-l-xl bg-gray-900 shadow-xl">
          {renderSidebarContent()}
        </div>
      </div>

      {/* Spacer div to push content over on large screens */}
      <div className="hidden lg:block lg:w-72"></div>
    </>
  );

  function renderSidebarContent() {
    return (
      <>
        {/* Logo header */}
        <div className="flex h-16 items-center justify-start px-6 bg-gradient-to-r from-emerald-800 to-gray-900 border-b border-gray-800">
          <Link href="/" className="group">
            <div className="flex items-center cursor-pointer group-hover:scale-105 transition-transform duration-200">
              <div className="p-1.5 bg-emerald-800/40 rounded-lg">
                <Leaf className="h-6 w-6 text-emerald-400" />
              </div>
              <h1 className="ml-3 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-emerald-500">
                Sports Emissions
              </h1>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="px-4 pb-2">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Main Navigation</p>
          </div>

          <nav className="mt-2 px-3 space-y-1">
            {navigation.map(item => renderNavLink(item, "main"))}


            {/* Process Calculation - Only visible when user is logged in */}

            <Link
              href="/process-calculation"
              className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${pathname === "/process-calculation"
                ? "bg-gradient-to-r from-emerald-600/30 to-gray-800 text-white"
                : "text-gray-300 hover:bg-gradient-to-r hover:from-emerald-800/20 hover:to-gray-800 hover:text-white"
                }`}
              onMouseEnter={() => setHoveredItem("main-process")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {pathname === "/process-calculation" && (
                <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
              )}

              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${pathname === "/process-calculation"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 group-hover:from-emerald-700 group-hover:to-emerald-900 group-hover:text-white"
                  }`}
              >
                <Calculator className="h-5 w-5" />
              </span>

              <span className="ml-3 flex-1 font-medium">
                <span className="flex items-center">
                  Process Calculation
                  {/* <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-emerald-800/60 text-emerald-300 rounded-md">
                    Pro
                  </span> */}
                </span>
              </span>

              {(pathname === "/process-calculation" || hoveredItem === "main-process") && (
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 ${pathname === "/process-calculation" ? "text-emerald-400" : "text-gray-400"
                    }`}
                />
              )}
            </Link>
            {/* Admin Dashboard - Only visible for admin users */}
            {user && profile?.role === "admin" && (
              <Link
                href="/adminDashboard"
                className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${pathname === "/adminDashboard"
                  ? "bg-gradient-to-r from-emerald-600/30 to-gray-800 text-white"
                  : "text-gray-300 hover:bg-gradient-to-r hover:from-emerald-800/20 hover:to-gray-800 hover:text-white"
                  }`}
                onMouseEnter={() => setHoveredItem("main-admin")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {pathname === "/adminDashboard" && (
                  <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
                )}

                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${pathname === "/adminDashboard"
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

                {(pathname === "/adminDashboard" || hoveredItem === "main-admin") && (
                  <ChevronRight
                    className={`h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 ${pathname === "/adminDashboard" ? "text-emerald-400" : "text-gray-400"
                      }`}
                  />
                )}
              </Link>
            )}




            {/* Blog Management - Only visible when user is logged in */}
            {user && profile?.role === "admin" && (
              <Link
                href="/editor"
                className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${pathname === "/editor"
                  ? "bg-gradient-to-r from-emerald-600/30 to-gray-800 text-white"
                  : "text-gray-300 hover:bg-gradient-to-r hover:from-emerald-800/20 hover:to-gray-800 hover:text-white"
                  }`}
                onMouseEnter={() => setHoveredItem("main-blog")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {pathname === "/editor" && (
                  <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
                )}

                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${pathname === "/editor"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 group-hover:from-emerald-700 group-hover:to-emerald-900 group-hover:text-white"
                    }`}
                >
                  <Book className="h-5 w-5" />
                </span>

                <span className="ml-3 flex-1 font-medium">
                  <span className="flex items-center">
                    Blog Management
                    <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-emerald-800/60 text-emerald-300 rounded-md">
                      Pro
                    </span>
                  </span>
                </span>

                {(pathname === "/editor" || hoveredItem === "main-blog") && (
                  <ChevronRight
                    className={`h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 ${pathname === "/editor" ? "text-emerald-400" : "text-gray-400"
                      }`}
                  />
                )}
              </Link>
            )}
          </nav>

          {/* Carbon Offset Insights */}
          <div className="px-4 pt-2 pb-2">
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

          {/* <div className="mt-auto px-4 py-3 text-center">
            <div className="text-xs text-gray-500">v1.2.0</div>
          </div> */}
        </div>
      </>
    );
  }
}