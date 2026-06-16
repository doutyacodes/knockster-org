"use client";

import { ICONS, SECURITY_INFO } from "@/constants";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SecurityLevel } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface ScanEvent {
  id: number;
  scannedAt: string;
  scanResult: string;
  failureReason?: string | null;
  securityLevel: number;
}

interface InvitationDetail {
  id: number;
  guestName: string;
  guestPhone: string;
  employeeName: string;
  employeePhone: string;
  validFrom: string;
  validTo: string;
  securityLevel: SecurityLevel;
  status: string;
  createdAt: string;
  scanEvents: ScanEvent[];
  qrSession: {
    id: number;
    qrCode: string;
    expiresAt: string;
  } | null;
}

export default function InvitationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [invitation, setInvitation] = useState<InvitationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchInvitationDetail(); }, [id]);

  const fetchInvitationDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('knockster_token');
      if (!token) { router.push('/login'); return; }
      const response = await fetch(`/api/invitations/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to fetch invitation');
      setInvitation(data.data);
    } catch (error: any) {
      setError(error.message || 'Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke this invitation? This action cannot be undone.')) return;
    try {
      setRevoking(true);
      const token = localStorage.getItem('knockster_token');
      const response = await fetch(`/api/invitations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'REVOKED' }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to revoke invitation');
      await fetchInvitationDetail();
    } catch (error: any) {
      alert(error.message || 'Failed to revoke invitation');
    } finally {
      setRevoking(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/guest/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleResend = () => {
    alert('Resend functionality will be available once SMS/Email integration is complete');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-32 bg-white/40 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2 h-72 bg-white/40 rounded-[2rem] animate-pulse" />
          <div className="md:col-span-3 h-72 bg-white/40 rounded-[2rem] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-700 transition-colors text-sm font-bold">
          <ICONS.ArrowRight className="rotate-180" size={16} />
          Back to Invitations
        </button>
        <div className="bg-rose-50 border border-rose-200 rounded-[2rem] p-12 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ICONS.Failure className="text-rose-600" size={32} />
          </div>
          <p className="text-rose-700 font-bold">{error || 'Invitation not found'}</p>
        </div>
      </div>
    );
  }

  const secKey = `L${invitation.securityLevel}` as SecurityLevel;
  const secInfo = SECURITY_INFO[secKey];
  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    UPCOMING: "bg-blue-100 text-blue-700",
    REVOKED: "bg-rose-100 text-rose-700",
    EXPIRED: "bg-slate-100 text-slate-500",
  };
  const statusDots: Record<string, string> = {
    ACTIVE: "bg-emerald-500",
    UPCOMING: "bg-blue-500",
    REVOKED: "bg-rose-500",
    EXPIRED: "bg-slate-400",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6">

      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-700 transition-colors text-sm font-bold">
        <ICONS.ArrowRight className="rotate-180" size={16} />
        Back to Invitations
      </button>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* QR Panel */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-xl flex flex-col items-center gap-5">
            <div className="flex items-center gap-2 self-stretch justify-between">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[invitation.status] ?? "bg-slate-100 text-slate-500"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${statusDots[invitation.status] ?? "bg-slate-400"}`} />
                {invitation.status}
              </span>
              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${secInfo?.color ?? "bg-slate-100 text-slate-600"}`}>
                {secKey}
              </span>
            </div>

            <div className="w-full aspect-square bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 p-5 flex items-center justify-center shadow-inner relative overflow-hidden">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${invitation.id}`}
                alt="QR Code" className="w-full h-full object-contain rounded-xl" />
              <div className="absolute inset-0 flex items-end justify-center pb-3">
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                  Rotating QR
                </span>
              </div>
            </div>

            <button onClick={handleCopyLink}
              className={`w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                copied
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
              }`}>
              {copied ? <><ICONS.Success size={16} /> Link Copied!</> : <><ICONS.Link size={16} /> Copy Guest Link</>}
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button onClick={handleRevoke} disabled={revoking || invitation.status === 'REVOKED'}
              className="w-full py-3.5 px-4 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-all border border-rose-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {revoking
                ? <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
                : <ICONS.Close size={16} />}
              {invitation.status === 'REVOKED' ? 'Already Revoked' : 'Revoke Access'}
            </button>
            <button onClick={handleResend}
              className="w-full py-3.5 px-4 bg-white/60 text-slate-600 font-bold rounded-2xl hover:bg-white transition-all border border-slate-200 flex items-center justify-center gap-2">
              <ICONS.Phone size={16} />
              Resend to Guest
            </button>
          </div>
        </div>

        {/* Details Panel */}
        <div className="md:col-span-3 space-y-5">
          {/* Guest Info */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-7 border border-white shadow-xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Guest</p>
            <h1 className="text-3xl font-black text-slate-900 mb-1">{invitation.guestName}</h1>
            <div className="flex items-center gap-2 text-slate-500">
              <ICONS.Phone size={14} />
              <span className="text-sm font-medium">{invitation.guestPhone}</span>
            </div>
          </div>

          {/* Host Info */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-7 border border-white shadow-xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Invited By</p>
            <p className="text-xl font-black text-slate-900 mb-1">{invitation.employeeName}</p>
            <div className="flex items-center gap-2 text-slate-500">
              <ICONS.Phone size={14} />
              <span className="text-sm font-medium">{invitation.employeePhone}</span>
            </div>
          </div>

          {/* Validity */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-7 border border-white shadow-xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Validity Period</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 mb-1">From</p>
                <p className="font-black text-slate-900 text-sm">{new Date(invitation.validFrom).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 mb-1">Until</p>
                <p className="font-black text-slate-900 text-sm">{new Date(invitation.validTo).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Timeline */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl overflow-hidden">
        <div className="p-7 border-b border-slate-100/60">
          <h3 className="font-black text-slate-900 text-lg">Scan Activity</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{invitation.scanEvents.length} event{invitation.scanEvents.length !== 1 ? "s" : ""} recorded</p>
        </div>

        <div className="p-7">
          {invitation.scanEvents.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ICONS.Logs className="text-slate-300 w-8 h-8" />
              </div>
              <p className="text-slate-500 font-medium">No scan activity yet</p>
              <p className="text-xs text-slate-400 mt-1">Scans will appear here once the guest uses their pass</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {invitation.scanEvents.map((log, i) => (
                  <motion.div key={log.id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      log.scanResult === "SUCCESS" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                    }`}>
                      {log.scanResult === "SUCCESS" ? <ICONS.Success size={18} /> : <ICONS.Failure size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900">
                        {log.scanResult === "SUCCESS" ? "Access Granted" : "Access Denied"}
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {new Date(log.scannedAt).toLocaleString()}
                      </p>
                      {log.failureReason && (
                        <p className="text-xs text-rose-600 font-medium mt-1">{log.failureReason}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                      L{log.securityLevel}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
