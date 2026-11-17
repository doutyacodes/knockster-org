"use client";

import { ICONS, SECURITY_INFO } from "@/constants";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SecurityLevel } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { PassTimeline, type TimelineStep } from "./_components/pass-timeline";

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
  /** Full lifecycle of the pass, assembled by the API. */
  timeline?: TimelineStep[];
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
  /** "details" is the default so the page opens exactly as it did before. */
  const [tab, setTab] = useState<"details" | "guest">("details");

  useEffect(() => { fetchInvitationDetail(); }, [id]);

  const fetchInvitationDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zuppgate_token');
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
      const token = localStorage.getItem('zuppgate_token');
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

      {/* Tabs. "Pass Details" is the default and renders exactly what this page
          always rendered. "Guest Pass" opens the visitor-facing /guest/[id]
          page in place, so the live rotating QR and OTP can be checked from the
          dashboard instead of only being copyable as a link. */}
      <div className="bg-white/60 backdrop-blur-xl p-2 rounded-3xl shadow-xl shadow-indigo-100/20 border border-white inline-flex gap-2">
        {([
          { label: "Pass Details", value: "details" as const, icon: ICONS.Info },
          { label: "Guest Pass", value: "guest" as const, icon: ICONS.Key },
        ]).map(({ label, value, icon: TabIcon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 relative ${
              tab === value ? "text-indigo-700" : "text-slate-500 hover:text-indigo-600 hover:bg-white/50"
            }`}
          >
            {tab === value && (
              <motion.div
                layoutId="invitationDetailTab"
                className="absolute inset-0 bg-white rounded-2xl shadow-sm border border-indigo-100/50"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-2">
              <TabIcon size={15} />
              {label}
            </span>
          </button>
        ))}
      </div>

      {tab === "guest" ? (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl overflow-hidden">
          <div className="p-7 border-b border-slate-100/60 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-black text-slate-900 text-lg">Guest Pass</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Exactly what {invitation.guestName} sees at <span className="font-mono">/guest/{invitation.id}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleCopyLink}
                className={`py-2.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
                  copied
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
                }`}>
                {copied ? <><ICONS.Success size={14} /> Copied</> : <><ICONS.Link size={14} /> Copy Link</>}
              </button>
              <a href={`/guest/${invitation.id}`} target="_blank" rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-2xl font-bold text-xs bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all inline-flex items-center gap-2">
                <ICONS.ArrowRight size={14} /> Open
              </a>
            </div>
          </div>
          {/* Same-origin embed of the real page, so the QR and OTP rotate here
              exactly as they do on the guest's phone rather than being a mock. */}
          <iframe
            src={`/guest/${invitation.id}`}
            title={`Guest pass for ${invitation.guestName}`}
            className="w-full h-[70vh] min-h-[520px] border-0 bg-white"
          />
        </div>
      ) : (
      <>
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

      {/* Pass Timeline — the whole life of the pass, laid out like Zuppdate's
          /e schedule. Replaces the old flat "Scan Activity" list, which showed
          gate scans only and so left out creation, the QR being issued, OTP
          verification and the window opening and closing. */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl overflow-hidden">
        <div className="p-7 border-b border-slate-100/60 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-900 text-lg">Pass Timeline</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {(invitation.timeline?.length ?? 0)} step{(invitation.timeline?.length ?? 0) !== 1 ? "s" : ""} ·{" "}
              {invitation.scanEvents.length} gate scan{invitation.scanEvents.length !== 1 ? "s" : ""}
            </p>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Times in IST
          </p>
        </div>

        <div className="p-7">
          <PassTimeline timeline={invitation.timeline ?? []} />
        </div>
      </div>
      </>
      )}
    </motion.div>
  );
}
