"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Define profile data type based on your profiles table
type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string; // e.g., "UserRole" or "admin"
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  setProfile: (profile: Profile | null) => void; // Function to update profile
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signOut: async () => { },
  setProfile: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Function to get the current session
    const fetchSession = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error fetching session:", error);
          return;
        }

        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          console.log("Session found:", data.session.user.email);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          console.log("No active session found");
        }
      } catch (err) {
        console.error("Unexpected error during session fetch:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial session fetch
    fetchSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);

        if (event === "SIGNED_IN") {
          console.log("User signed in:", newSession?.user?.email);
          setSession(newSession);
          setUser(newSession?.user ?? null);
          router.refresh();
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          setSession(null);
          setUser(null);
          setProfile(null);
          router.push("/auth/login");
          router.refresh();
        } else if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed");
          setSession(newSession);
          setUser(newSession?.user ?? null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      } else {
        console.log("Successfully signed out");
        setSession(null);
        setUser(null);
        setProfile(null);
        router.push("/auth/login");
      }
    } catch (err) {
      console.error("Unexpected error during sign out:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, signOut, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};