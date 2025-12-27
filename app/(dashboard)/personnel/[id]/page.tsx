"use client";

import { ICONS } from "@/constants";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    fetchPersonnelDetail();
  }, [id]);

  const fetchPersonnelDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('knockster_token');

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/personnel/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch personnel details');
      }

      setPersonnel(data.data);
    } catch (error: any) {
      console.error('Error fetching personnel:', error);
      setError(error.message || 'Failed to load personnel details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 mt-4">Loading personnel details...</p>
      </div>
    );
  }

  if (error || !personnel) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
        >
          <ICONS.ArrowRight className="rotate-180" size={16} />
          Back to list
        </button>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
          <ICONS.Failure className="text-rose-600 mx-auto" size={48} />
          <p className="text-rose-600 font-semibold mt-4">{error || 'Personnel not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
      >
        <ICONS.ArrowRight className="rotate-180" size={16} />
        Back to list
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                <ICONS.Personnel className="text-slate-400" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {personnel.username}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${personnel.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className="text-sm font-medium text-slate-600">
                    {personnel.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-2xl font-bold text-blue-600">{personnel.stats.totalScans}</p>
                <p className="text-xs text-blue-600 font-medium mt-1">Total Scans</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-2xl font-bold text-emerald-600">{personnel.stats.successRate}%</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Success Rate</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Shift Hours
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm font-bold text-slate-900">
                  {personnel.shiftStart && personnel.shiftEnd
                    ? `${personnel.shiftStart} - ${personnel.shiftEnd}`
                    : 'Not set'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Device Information
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm font-bold text-slate-900">
                  {personnel.deviceModel && personnel.deviceOs
                    ? `${personnel.deviceModel} (${personnel.deviceOs})`
                    : 'No device bound'}
                </p>
                {personnel.lastSeenAt && (
                  <p className="text-xs text-slate-500 mt-1">
                    Last seen: {new Date(personnel.lastSeenAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Scan History */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Recent Scan Activity
            </p>
            <div className="space-y-3">
              {personnel.scanHistory.length === 0 ? (
                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-slate-500 text-sm">No scan activity yet</p>
                </div>
              ) : (
                personnel.scanHistory.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          scan.scanResult === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        {scan.scanResult === "SUCCESS" ? (
                          <ICONS.Success size={14} />
                        ) : (
                          <ICONS.Failure size={14} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {scan.scanResult === "SUCCESS" ? "Successful" : "Failed"} Scan
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(scan.scannedAt).toLocaleString()}
                        </p>
                        {scan.failureReason && (
                          <p className="text-[10px] text-rose-600 mt-0.5">
                            {scan.failureReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      L{scan.securityLevel}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
