"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  onLogout?: () => void;
  variant?: "app" | "public";
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, variant = "app" }) => {
  const isPublic = variant === "public";
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  const navItems = isPublic ? [] : [
    { name: "Invitations", icon: ICONS.Invitations, path: "/invitations" },
    { name: "Personnel", icon: ICONS.Personnel, path: "/personnel" },
    { name: "Visitor Types", icon: ICONS.Users, path: "/visitor-types" },
    { name: "Alerts", icon: ICONS.Alerts, path: "/alerts" },
    { name: "About", icon: ICONS.Info, path: "/about" },
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
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-black border-b border-white/10 shadow-lg shadow-black/30">
        {/* Row 1: ByRoice (left) · Logo (center) · Account (right) */}
        <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:px-4 md:px-8 py-1">
          <div className="justify-self-start">
            <a
              href="https://www.byroice.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ByRoice"
              className="block opacity-90 hover:opacity-100 transition-opacity"
            >
              <Image src="/byroice.png" alt="ByRoice" width={669} height={237} className="h-5 sm:h-7 w-auto" priority />
            </a>
          </div>

          <Link href={isPublic ? "/login" : "/invitations"} aria-label="Zuppgate" className="justify-self-center block">
            <Image src="/logo.png" alt="Zuppgate - Never trust. Always verify" width={5250} height={2100} className="h-10 sm:h-12 w-auto" priority />
          </Link>

          <div className="justify-self-end flex items-center">
            {isPublic ? (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/about" className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                  About
                </Link>
                <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                  Login
                </Link>
                <Link href="/signup" className="px-5 py-2 rounded-xl bg-[#FFE500] text-black font-bold text-sm hover:opacity-90 transition-all">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-4">
                {user && (
                  <div className="flex items-center gap-3 pr-1">
                    {displayImageUrl && (
                      <img src={displayImageUrl} alt="Organization" className="w-9 h-9 rounded-full object-cover border border-white/20" />
                    )}
                    <div className="leading-tight text-right max-w-[160px]">
                      <p className="text-sm font-bold text-white truncate">{user.organizationName}</p>
                      <p className="text-[9px] font-bold text-[#FFE500] uppercase tracking-widest">{user.organizationType}</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl border border-[#FFE500]/40 text-[#FFE500] font-bold text-sm hover:bg-[#FFE500] hover:text-black transition-all"
                >
                  <ICONS.Logout size={16} />
                  Sign Out
                </button>
              </div>
            )}

            {/* Menu icon: below lg for the app, below md for login/signup */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              className={`${isPublic ? "md:hidden" : "lg:hidden"} p-2 text-[#FFE500] hover:bg-white/10 rounded-xl transition-colors`}
            >
              {isMobileMenuOpen ? <ICONS.Close size={26} /> : <ICONS.Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Row 2: Desktop navigation, centered */}
        {!isPublic && (
          <nav className="hidden lg:flex items-center justify-center gap-1 border-t border-white/10 px-8 py-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive ? "text-black" : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[#FFE500] rounded-xl"
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
        )}
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-x-0 top-[49px] sm:top-[57px] z-40 bg-black border-b border-white/10 shadow-2xl rounded-b-3xl p-4 max-h-[calc(100vh-57px)] overflow-y-auto ${isPublic ? "md:hidden" : "lg:hidden"}`}
          >
            <nav className="flex flex-col gap-2">
              {isPublic ? (
                <>
                  <Link href="/about" className="px-4 py-3.5 rounded-2xl font-bold text-slate-200 hover:bg-white/10 transition-all">
                    About
                  </Link>
                  <Link href="/login" className="px-4 py-3.5 rounded-2xl font-bold text-slate-200 hover:bg-white/10 transition-all">
                    Login
                  </Link>
                  <Link href="/signup" className="px-4 py-3.5 rounded-2xl font-bold bg-[#FFE500] text-black text-center transition-all hover:opacity-90">
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  {user && (
                    <div className="flex items-center gap-3 px-4 py-2">
                      {displayImageUrl && (
                        <img src={displayImageUrl} alt="Organization" className="w-9 h-9 rounded-full object-cover border border-white/20" />
                      )}
                      <div className="leading-tight min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user.organizationName}</p>
                        <p className="text-[9px] font-bold text-[#FFE500] uppercase tracking-widest">{user.organizationType}</p>
                      </div>
                    </div>
                  )}
                  {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.path);
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                          isActive ? "bg-[#FFE500] text-black" : "text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <item.icon size={20} className={isActive ? "text-black" : "text-slate-500"} />
                        {item.name}
                      </Link>
                    );
                  })}
                  <div className="h-px bg-white/10 my-2" />
                  <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-[#FFE500]/40 text-[#FFE500] font-bold transition-all hover:bg-[#FFE500] hover:text-black"
                  >
                    <ICONS.Logout size={20} />
                    Sign Out
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
