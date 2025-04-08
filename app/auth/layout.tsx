"use client";

import { useAuth } from "@/components/auth/auth-provider";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and session exists, redirect to dashboard
    if (!isLoading && session) {
      router.push("/dashboard");
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

  // Only render auth pages if not authenticated
  return !session ? (
    <div className="flex min-h-screen items-center justify-center">
      {children}
    </div>
  ) : null;
}