"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Force redirect if session exists
    if (session) {
      console.log("Login page: Session detected, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {isLoading ? (
        <div className="text-center">Loading authentication state...</div>
      ) : session ? (
        <div className="text-center">
          <p>Authenticated as {session.user.email}</p>
          <p>Redirecting to dashboard...</p>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}