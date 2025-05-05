"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AnimatedBackground from "@/components/animatedBackground";
import { useAuth } from "./auth-provider";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Redirect based on role after login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        throw error;
      }

      console.log("Login successful:", data.user?.email);

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 500);
    } catch (error: any) {
      setError(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <AnimatedBackground />
      <div className="container relative z-10 flex flex-col items-center justify-center gap-6 px-4 py-8">


        <Card className="w-full max-w-md bg-gray-900/70 backdrop-blur-xl border-green-600/40 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-green-400">Admin Login</CardTitle>
            <CardDescription className="text-white/70">
              Sign in to access the Sports Emissions Dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="bg-gray-800/60 border-green-600/50 text-white placeholder:text-white/60 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Link href="#" className="text-sm text-green-300 hover:text-green-400">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800/60 border-green-600/50 text-white focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-green-600 text-white hover:bg-green-500 disabled:bg-green-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-center text-sm text-white/70">
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-green-300 hover:text-green-400">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}