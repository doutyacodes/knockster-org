"use client";

import React, { useState, useEffect } from 'react';
import { ICONS } from '@/constants';
import { api } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface Alert {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  failureReason: string;
  timestamp: string;
  guestName: string;
  guestPhone: string;
  guardUsername: string;
  securityLevel: number;
  invitationId: string;
  invitationStatus: string;
}

interface AlertStats {
  total: number;
  high: number;
  medium: number;
  low: number;
  today: number;
}

interface AlertsData {
  alerts: Alert[];
  stats: AlertStats;
}

const SEVERITY_CONFIG = {
  high: {
    border: "border-rose-200",
    bg: "from-rose-50 to-pink-50/50",
    badge: "bg-rose-500 text-white",
    icon: "text-rose-500 bg-rose-50",
    dot: "bg-rose-500",
    label: "High",
  },
  medium: {
    border: "border-amber-200",
    bg: "from-amber-50 to-yellow-50/50",
    badge: "bg-amber-100 text-amber-800",
    icon: "text-amber-500 bg-amber-50",
    dot: "bg-amber-500",
    label: "Medium",
  },
  low: {
    border: "border-blue-200",
    bg: "from-blue-50 to-sky-50/50",
    badge: "bg-blue-100 text-blue-700",
    icon: "text-blue-500 bg-blue-50",
    dot: "bg-blue-500",
    label: "Low",
  },
};

const TIME_FILTERS = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "7 Days", value: "week" },
];

const SEVERITY_FILTERS = [
  { label: "All", value: "all" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
];

const cardAnim = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

const Alerts: React.FC = () => {
  const [alertsData, setAlertsData] = useState<AlertsData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [timeFilter, severityFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get(`/api/alerts?time=${timeFilter}&severity=${severityFilter}`);
      if (data) {
        setAlertsData(data);
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));
  const handleDismiss = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));
  const markAllAsRead = () => setAlerts([]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="space-y-8">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 backdrop-blur-lg border border-white p-8 rounded-[2rem] shadow-xl shadow-purple-500/5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Security Monitoring</p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-800 tracking-tight">
            Security Alerts
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Real-time monitoring of failed scans and security incidents.
          </p>
        </div>
        {alerts.length > 0 && (
          <button onClick={markAllAsRead}
            className="flex items-center gap-2 px-5 py-3 bg-white/60 border border-white rounded-2xl text-slate-600 font-bold text-sm hover:bg-white transition-all shadow-sm">
            <ICONS.Success size={16} />
            Clear All
          </button>
        )}
      </header>

      {/* Stats Row */}
      {alertsData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Alerts", value: alertsData.stats.total, color: "from-slate-50 to-slate-50/60", text: "text-slate-700", dot: "bg-slate-400" },
            { label: "High Priority", value: alertsData.stats.high, color: "from-rose-50 to-pink-50/60", text: "text-rose-700", dot: "bg-rose-500" },
            { label: "Medium", value: alertsData.stats.medium, color: "from-amber-50 to-yellow-50/60", text: "text-amber-700", dot: "bg-amber-500" },
            { label: "Today", value: alertsData.stats.today, color: "from-blue-50 to-sky-50/60", text: "text-blue-700", dot: "bg-blue-500" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className={`bg-gradient-to-br ${s.color} bg-white/70 backdrop-blur-xl rounded-[1.5rem] p-5 border border-white shadow-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              </div>
              <p className={`text-3xl font-black ${s.text}`}>{s.value}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur p-1.5 rounded-2xl border border-white shadow-sm">
          {TIME_FILTERS.map(f => (
            <button key={f.value} onClick={() => setTimeFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${
                timeFilter === f.value ? "text-indigo-700" : "text-slate-500 hover:text-slate-700"
              }`}>
              {timeFilter === f.value && (
                <motion.div layoutId="timeFilter"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-indigo-100/50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white/60 backdrop-blur p-1.5 rounded-2xl border border-white shadow-sm">
          {SEVERITY_FILTERS.map(f => (
            <button key={f.value} onClick={() => setSeverityFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${
                severityFilter === f.value ? "text-indigo-700" : "text-slate-500 hover:text-slate-700"
              }`}>
              {severityFilter === f.value && (
                <motion.div layoutId="severityFilter"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-indigo-100/50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          ))}
        </div>

        <button onClick={fetchAlerts}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-white/60 border border-white rounded-2xl text-slate-500 text-sm font-bold hover:bg-white transition-all shadow-sm">
          <ICONS.Search size={14} />
          Refresh
        </button>
      </div>

      {loading && !alertsData ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/40 rounded-[2rem] h-32 animate-pulse border border-white/50" />
          ))}
        </div>
      ) : error && !alertsData ? (
        <div className="py-20 text-center bg-white/40 backdrop-blur-xl border border-white rounded-[3rem]">
          <ICONS.Warning className="text-rose-500 mx-auto mb-4" size={48} />
          <p className="text-slate-600 font-bold mb-4">{error}</p>
          <button onClick={fetchAlerts}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl text-sm">
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {alerts.map((alert) => {
              const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.low;
              return (
                <motion.div key={alert.id} variants={cardAnim} initial="hidden" animate="show" exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                  layout
                  className={`bg-gradient-to-r ${cfg.bg} border ${cfg.border} rounded-[1.75rem] p-6 flex items-start gap-5 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${cfg.icon}`}>
                    {alert.type === 'OTP_FAILURE' ? <ICONS.Key size={22} /> : <ICONS.Alerts size={22} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <p className="font-black text-slate-900 text-base leading-snug">{alert.failureReason}</p>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${cfg.badge}`}>
                        {cfg.label} Priority
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 mb-4">
                      <span><span className="font-bold text-slate-700">Guest:</span> {alert.guestName} · {alert.guestPhone}</span>
                      <span><span className="font-bold text-slate-700">Guard:</span> {alert.guardUsername}</span>
                      <span><span className="font-bold text-slate-700">Level:</span> L{alert.securityLevel}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <ICONS.Time size={13} />
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        alert.invitationStatus === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        alert.invitationStatus === 'expired' ? 'bg-slate-100 text-slate-600' :
                        'bg-rose-100 text-rose-600'
                      }`}>
                        {alert.invitationStatus?.toUpperCase()}
                      </span>
                      <div className="flex gap-3 ml-auto">
                        <button onClick={() => handleAcknowledge(alert.id)}
                          className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors">
                          Acknowledge
                        </button>
                        <button onClick={() => handleDismiss(alert.id)}
                          className="text-xs font-black text-slate-400 hover:text-slate-600 transition-colors">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {alerts.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-24 text-center bg-white/40 backdrop-blur-xl border border-white rounded-[3rem] shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ICONS.Success className="text-emerald-500 w-9 h-9" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">All Clear</h3>
              <p className="text-slate-500 font-medium">No pending alerts. All systems operational.</p>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Alerts;
