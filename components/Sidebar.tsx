'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ICONS, COLORS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout }) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', icon: ICONS.Dashboard, path: '/' },
    { name: 'Invitations', icon: ICONS.Invitations, path: '/invitations' },
    { name: 'Personnel', icon: ICONS.Personnel, path: '/personnel' },
    // { name: 'Scan Logs', icon: ICONS.Logs, path: '/logs' }, // Hidden for now
    { name: 'Alerts', icon: ICONS.Alerts, path: '/alerts' },
    { name: 'My Profile', icon: ICONS.Profile, path: '/profile' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ICONS.ShieldCheck className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                Knockster
              </span>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
            >
              <ICONS.Close size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 group
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span>{item.name}</span>

                  {item.name === 'Alerts' && (
                    <span className="ml-auto w-5 h-5 bg-rose-500 text-white text-[10px]
                      flex items-center justify-center rounded-full font-bold">
                      2
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center
                  justify-center text-slate-500 font-semibold">
                  HK
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Managing Node
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    Hacker's Kingdom HQ
                  </p>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 py-2
                    text-xs font-bold text-rose-500 hover:bg-rose-50
                    rounded-lg transition-colors"
                >
                  <ICONS.Logout size={14} />
                  Logout Session
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
