"use client";

import { ICONS } from "@/constants";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScanEvent {
  id: string;
  scannedAt: string;
  scanResult: string;
  failureReason?: string | null;
  invitationId: string;
  securityLevel: number;
}

interface PersonnelDetail {
  id: string;
  username: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  isActive: boolean;
  createdAt: string;
  deviceId: string | null;
  deviceModel: string | null;
  deviceOs: string | null;
  lastSeenAt: string | null;
  scanHistory: ScanEvent[];
  stats: {
    totalScans: number;
    successfulScans: number;
    successRate: string;
  };
}

export default function PersonnelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [personnel, setPersonnel] = useState<PersonnelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchPersonnelDetail(); }, [id]);

  const fetchPersonnelDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('knockster_token');
      if (!token) { router.push('/login'); return; }
      const response = await fetch(`/api/personnel/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to fetch personnel details');
      setPersonnel(data.data);
    } catch (error: any) {
      setError(error.message || 'Failed to load personnel details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-32 bg-white/40 rounded-2xl animate-pulse" />
        <div className="h-48 bg-white/40 rounded-[2rem] animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white/40 rounded-[1.5rem] animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error || !personnel) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-700 transition-colors text-sm font-bold">
          <ICONS.ArrowRight className="rotate-180" size={16} />
          Back to Personnel
        </button>
        <div className="bg-rose-50 border border-rose-200 rounded-[2rem] p-12 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ICONS.Failure className="text-rose-600" size={32} />
          </div>
          <p className="text-rose-700 font-bold">{error || 'Personnel not found'}</p>
        </div>
      </div>
    );
  }

  const successRate = Number(personnel.stats.successRate);
  const rateColor = successRate >= 90 ? "text-emerald-600" : successRate >= 70 ? "text-amber-600" : "text-rose-600";
  const rateBg = successRate >= 90 ? "from-emerald-50 to-teal-50/40" : successRate >= 70 ? "from-amber-50 to-yellow-50/40" : "from-rose-50 to-pink-50/40";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6">

      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-700 transition-colors text-sm font-bold">
        <ICONS.ArrowRight className="rotate-180" size={16} />
        Back to Personnel
      </button>

      {/* Hero Section */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-12 w-32 h-32 rounded-full bg-white blur-2xl" />
            <div className="absolute bottom-0 right-8 w-20 h-20 rounded-full bg-white blur-xl" />
          </div>
        </div>
        <div className="px-8 pb-8">
          <div className="relative -mt-10 flex items-end justify-between mb-6">
            <div className="w-20 h-20 rounded-[1.25rem] border-4 border-white shadow-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
              <ICONS.Personnel className="text-indigo-500 w-9 h-9" />
            </div>
            <div className="mb-1 flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black ${
                personnel.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${personnel.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                {personnel.isActive ? "Active" : "Inactive"}
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-1">{personnel.username}</h1>
          <p className="text-slate-500 text-sm font-medium">
            Joined {new Date(personnel.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Scans",
            value: personnel.stats.totalScans,
            sub: "All time",
            color: "from-blue-50 to-sky-50/40",
            text: "text-blue-700",
            accent: "bg-blue-100",
          },
          {
            label: "Successful",
            value: personnel.stats.successfulScans,
            sub: "Access granted",
            color: "from-emerald-50 to-teal-50/40",
            text: "text-emerald-700",
            accent: "bg-emerald-100",
          },
          {
            label: "Success Rate",
            value: `${personnel.stats.successRate}%`,
            sub: "Accuracy",
            color: rateBg,
            text: rateColor,
            accent: "bg-white",
          },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className={`bg-gradient-to-br ${s.color} backdrop-blur-xl rounded-[1.5rem] p-5 border border-white shadow-lg`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-3xl font-black ${s.text} mb-1`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-medium">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white/70 backdrop-blur-xl rounded-[1.75rem] p-6 border border-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <ICONS.Time className="text-indigo-600" size={18} />
            </div>
            <p className="font-black text-slate-800 text-sm">Active Shift</p>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {personnel.shiftStart && personnel.shiftEnd
              ? `${personnel.shiftStart} – ${personnel.shiftEnd}`
              : 'Not configured'}
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-[1.75rem] p-6 border border-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <ICONS.Personnel className="text-violet-600" size={18} />
            </div>
            <p className="font-black text-slate-800 text-sm">Device</p>
          </div>
          <p className="text-base font-black text-slate-900 mb-1">
            {personnel.deviceModel && personnel.deviceOs
              ? `${personnel.deviceModel} · ${personnel.deviceOs}`
              : 'No device bound'}
          </p>
          {personnel.lastSeenAt && (
            <p className="text-xs text-slate-500 font-medium">
              Last active: {new Date(personnel.lastSeenAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Scan History */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100/60">
          <h3 className="font-black text-slate-900 text-lg">Scan History</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Recent access verification events</p>
        </div>

        <div className="p-6 space-y-3">
          {personnel.scanHistory.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ICONS.Logs className="text-slate-300 w-8 h-8" />
              </div>
              <p className="text-slate-500 font-medium">No scan activity recorded yet</p>
            </div>
          ) : (
            <AnimatePresence>
              {personnel.scanHistory.map((scan, i) => (
                <motion.div key={scan.id}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-colors group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    scan.scanResult === "SUCCESS" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                  }`}>
                    {scan.scanResult === "SUCCESS" ? <ICONS.Success size={18} /> : <ICONS.Failure size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {scan.scanResult === "SUCCESS" ? "Access Granted" : "Access Denied"}
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {new Date(scan.scannedAt).toLocaleString()}
                    </p>
                    {scan.failureReason && (
                      <p className="text-xs text-rose-600 font-medium mt-1">{scan.failureReason}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                    L{scan.securityLevel}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
