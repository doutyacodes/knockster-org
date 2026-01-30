import React from "react";
import { ICONS } from "../constants";

interface TopbarProps {
  onMenuClick: () => void;
  userEmail?: string;
  role?: string;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick, userEmail, role }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
        >
          <ICONS.Menu size={24} />
        </button>
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 gap-2 w-64 md:w-96 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
          <ICONS.Search className="text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search for invitations, guards, logs..."
            className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
          <ICONS.Alerts size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-[1px] bg-slate-200"></div>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {userEmail || "User"}
            </p>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              {role || "Admin"}
            </p>
          </div>
          <img
            src="https://picsum.photos/seed/admin/100/100"
            alt="User"
            className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all"
          />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
