'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('knockster_auth') === 'true';
    setIsAuthenticated(authStatus);
    setIsLoading(false);

    if (!authStatus) {
      router.push('/login');
    }
  }, [router]);

  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('knockster_auth');
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Show loading or nothing while checking auth
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={handleLogout} 
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}