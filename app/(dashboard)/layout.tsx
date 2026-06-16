"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

import { api } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  role: string;
  organizationName: string;
  organizationType: string;
  organizationNodeId: string;
  canManageHierarchy: boolean;
  maxSubNodes: number;
  imageUrl?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Check authentication and fetch user data on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = localStorage.getItem("knockster_auth") === "true";
      const token = localStorage.getItem("knockster_token");

      if (!authStatus) {
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push("/login");
        return;
      }

      try {
        // Fetch user data
        const userData = await api.get<User>("/api/auth/me");
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token might be invalid
          localStorage.removeItem("knockster_auth");
          localStorage.removeItem("knockster_token");
          setIsAuthenticated(false);
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        // Fallback to basic auth check if API fails but token exists,
        // OR redirect to login if we want strict security.
        // For now, let's keep them logged in but without data if API fails,
        // or maybe strict logout? Let's assume strict.
        localStorage.removeItem("knockster_auth");
        setIsAuthenticated(false);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);



  const handleLogout = () => {
    localStorage.removeItem("knockster_auth");
    localStorage.removeItem("knockster_token");
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  // Show loading or nothing while checking auth
  if (isLoading || !isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-[#FDFDFE] relative overflow-x-hidden selection:bg-purple-200">
      {/* Soft Animated Background Gradients inspired by CodBe */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-purple-300/30 to-indigo-300/30 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-gradient-to-bl from-blue-300/30 to-cyan-200/30 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-gradient-to-tr from-pink-200/30 to-orange-200/20 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="relative z-10 pt-32 pb-16 px-4 md:px-8 max-w-7xl mx-auto min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
}
