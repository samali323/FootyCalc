"use client";
import { useAuth } from "@/components/auth/auth-provider";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If not loading and no session, redirect to login
    if (!isLoading && !session) {
      router.push("/auth/login");
    }
  }, [session, isLoading, router]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Only render children if authenticated
  return session ? (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
     
      <main className="flex-1 overflow-y-auto p-6 lg:pl-6">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  ) : null;
}