
"use client";
import React, { useState, useMemo } from 'react';
import { mockLogs } from '@/services/mockData';
import { ICONS, SECURITY_INFO } from '@/constants';

const ScanLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Success' | 'Failure'>('All');
  const [levelFilter, setLevelFilter] = useState<'All' | 'L1' | 'L2' | 'L3' | 'L4'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log => {
      const matchesSearch = log.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (log.reason?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || log.result === statusFilter;
      const matchesLevel = levelFilter === 'All' || log.securityLevel === levelFilter;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [searchTerm, statusFilter, levelFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Access Scan Logs</h1>
          <p className="text-slate-500 mt-1">Audit trail of all visitor entry attempts</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all ${isRefreshing ? 'opacity-50' : ''}`}
          >
            <div className={isRefreshing ? 'animate-spin' : ''}>
              {/* Fix: Changed ICONS.History to ICONS.Logs as defined in constants.tsx */}
              <ICONS.Logs size={16} />
            </div>
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-xl text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-all">
            Export CSV
          </button>
        </div>
      </header>

      {/* Real-time Ticker */}
      <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-between text-white overflow-hidden relative">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Live Monitoring</p>
            <p className="font-semibold">{filteredLogs.length} matching events currently listed</p>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full flex items-center justify-center translate-x-1/4">
           <ICONS.Logs size={140} className="text-white/10 -rotate-12" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
           <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 gap-3 w-full md:max-w-md focus-within:ring-2 focus-within:ring-blue-100 transition-all">
             <ICONS.Search className="text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search guest or reason..." 
               className="bg-transparent border-none focus:outline-none text-sm w-full"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           
           <div className="flex items-center gap-2 w-full md:w-auto">
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value as any)}
               className="flex-1 md:flex-none px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
             >
               <option value="All">All Status</option>
               <option value="Success">Success Only</option>
               <option value="Failure">Failure Only</option>
             </select>
             <select 
               value={levelFilter}
               onChange={(e) => setLevelFilter(e.target.value as any)}
               className="flex-1 md:flex-none px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
             >
               <option value="All">All Tiers</option>
               <option value="L1">Level 1</option>
               <option value="L2">Level 2</option>
               <option value="L3">Level 3</option>
               <option value="L4">Level 4</option>
             </select>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Guest Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Lvl</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Details / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/30 transition-all group animate-in fade-in slide-in-from-top-1">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{log.guestName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{new Date(log.scanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                    <p className="text-[10px] text-slate-400">{new Date(log.scanTime).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      log.result === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {log.result === 'Success' ? <ICONS.Success size={12} /> : <ICONS.Failure size={12} />}
                      {log.result}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${SECURITY_INFO[log.securityLevel].color}`}>
                      {log.securityLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-500">{log.reason || 'Normal Entry Verification'}</p>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                       <ICONS.Search size={32} className="opacity-20" />
                       <p className="text-sm font-medium">No logs match your current filters</p>
                       <button 
                        onClick={() => {setSearchTerm(''); setStatusFilter('All'); setLevelFilter('All');}}
                        className="text-xs text-blue-600 font-bold hover:underline"
                       >
                         Clear all filters
                       </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
           <p className="text-xs text-slate-500 font-medium">Found {filteredLogs.length} events</p>
           <div className="flex gap-2">
             <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">Previous</button>
             <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">Next</button>
           </div>
        </div>
      </div>
    </>
  );
};

export default ScanLogs;
