"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

import { api } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  role: string;
  organizationName: string;
  organizationType: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
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

  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        organizationName={user?.organizationName}
        organizationType={user?.organizationType}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          userEmail={user?.email}
          role={user?.role} // Note: API returns 'orgadmin', we might want to capitalize it or map it
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
