"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ICONS } from "@/constants";

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

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Invitations", icon: ICONS.Invitations, path: "/invitations" },
    { name: "Personnel", icon: ICONS.Personnel, path: "/personnel" },
    { name: "Visitor Types", icon: ICONS.Users, path: "/visitor-types" },
    { name: "Alerts", icon: ICONS.Alerts, path: "/alerts" },
    { name: "Profile", icon: ICONS.Profile, path: "/profile" },
  ];

  if (user?.canManageHierarchy) {
    navItems.splice(1, 0, { name: "Hierarchy", icon: ICONS.Layers, path: "/hierarchy" });
  }

  const displayImageUrl = user?.imageUrl?.startsWith('http') 
    ? user.imageUrl 
    : user?.imageUrl ? `https://wowfy.in/testusr/images/${user.imageUrl}` : null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto pointer-events-auto bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-purple-500/5 rounded-3xl flex items-center justify-between p-3 px-6 transition-all duration-300">
          
          {/* Logo Section */}
          <Link href="/invitations" className="flex items-center gap-3 group">
            {displayImageUrl ? (
              <img src={displayImageUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm transition-transform group-hover:scale-105" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-md">
                <ICONS.ShieldCheck className="text-white w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-800 tracking-tight">
                {user?.organizationName || "Knockster"}
              </h1>
              <p className="text-[9px] font-bold text-purple-500 uppercase tracking-widest leading-none">
                {user?.organizationType || "Platform"}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive ? "text-indigo-700" : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/50"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <item.icon size={16} />
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User Section / Logout */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 font-bold text-sm hover:shadow-md hover:shadow-rose-100 transition-all border border-rose-100"
            >
              <ICONS.Logout size={16} />
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <ICONS.Close size={24} /> : <ICONS.Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-24 z-40 bg-white/90 backdrop-blur-2xl border border-white shadow-2xl rounded-3xl p-4 lg:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                      isActive ? "bg-gradient-to-r from-purple-50 to-blue-50 text-indigo-700 border border-indigo-100/50" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon size={20} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                    {item.name}
                  </Link>
                );
              })}
              <div className="h-px bg-slate-100 my-2" />
              <button
                onClick={onLogout}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-rose-50 text-rose-600 font-bold transition-all"
              >
                <ICONS.Logout size={20} />
                Sign Out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
