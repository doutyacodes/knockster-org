"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ICONS, SECURITY_INFO } from "@/constants";
import { motion, AnimatePresence } from "framer-motion";

interface QRData {
  qrSession: { qrCode: string; expiresAt: string; createdAt: string };
  otp: { otpCode: string; expiresAt: string; createdAt: string } | null;
  invitation: {
    id: number;
    securityLevel: number;
    validFrom: string;
    validTo: string;
    status: string;
    employeeName: string;
    guestName: string;
  };
  organization: { name: string; type: string; imageUrl: string };
  qrExpirySeconds: number;
  otpExpirySeconds: number;
}

export default function GuestQRPage() {
  const params = useParams();
  const invitationId = params.invitationId as string;

  const [qrData, setQrData] = useState<QRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrTimeLeft, setQrTimeLeft] = useState(0);
  const [otpTimeLeft, setOtpTimeLeft] = useState(0);

  const fetchQRData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/guest/${invitationId}/qr`);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to load QR code');
      setQrData(data.data);
    } catch (error: any) {
      setError(error.message || 'Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQRData(); }, [invitationId]);

  useEffect(() => {
    if (!qrData) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const qrExpiry = new Date(qrData.qrSession.expiresAt).getTime();
      const qrRemaining = Math.max(0, Math.floor((qrExpiry - now) / 1000));
      setQrTimeLeft(qrRemaining);
      if (qrData.otp) {
        const otpExpiry = new Date(qrData.otp.expiresAt).getTime();
        setOtpTimeLeft(Math.max(0, Math.floor((otpExpiry - now) / 1000)));
      }
      if (qrRemaining === 0) fetchQRData();
    }, 1000);
    return () => clearInterval(interval);
  }, [qrData]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const progressPct = qrData ? (qrTimeLeft / qrData.qrExpirySeconds) * 100 : 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 mt-6 font-medium">Loading your access pass...</p>
        </div>
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-slate-50 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-2xl p-10 max-w-md w-full text-center border border-rose-100">
          <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ICONS.Failure className="text-rose-600" size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Pass Unavailable</h1>
          <p className="text-slate-500 font-medium">{error || 'This invitation is invalid or has expired.'}</p>
          <p className="text-sm text-slate-400 mt-4 font-medium">
            Contact your host if you believe this is an error.
          </p>
        </motion.div>
      </div>
    );
  }

  const securityLevel = `L${qrData.invitation.securityLevel}` as keyof typeof SECURITY_INFO;
  const securityInfo = SECURITY_INFO[securityLevel];

  const displayImageUrl = qrData.organization?.imageUrl?.startsWith('http')
    ? qrData.organization.imageUrl
    : qrData.organization?.imageUrl ? `https://wowfy.in/testusr/images/${qrData.organization.imageUrl}` : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4 pb-12">
      <div className="max-w-md mx-auto space-y-5 pt-6">

        {/* Org Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3">
          {displayImageUrl ? (
            <img src={displayImageUrl} alt="Logo"
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl mx-auto" />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200">
              <span className="text-3xl font-black text-white">
                {qrData.organization?.name?.[0]?.toUpperCase() || 'O'}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black text-slate-900">{qrData.organization?.name}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {qrData.organization?.type}
            </p>
          </div>
        </motion.div>

        {/* Security Level Banner */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl ${securityInfo?.color ?? "bg-slate-100 text-slate-600"}`}>
          <ICONS.ShieldCheck size={18} />
          <span className="text-sm font-black">Security Level L{qrData.invitation.securityLevel}</span>
          <span className="text-xs font-medium opacity-70">· {securityInfo?.description}</span>
        </motion.div>

        {/* QR Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
          <div className="p-8">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-[1.5rem] border border-slate-100 p-6 shadow-inner">
              <div className="aspect-square w-full max-w-[260px] mx-auto bg-white rounded-2xl p-4 shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                    JSON.stringify({ invitationId, qrCode: qrData.qrSession.qrCode })
                  )}`}
                  alt="Access QR Code" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Countdown */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>QR refreshes in</span>
                <span className={`font-black text-base ${qrTimeLeft < 60 ? "text-rose-500" : "text-slate-800"}`}>
                  {formatTime(qrTimeLeft)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                  className={`h-full rounded-full ${qrTimeLeft < 60 ? "bg-rose-500" : "bg-indigo-500"}`} />
              </div>
            </div>
          </div>

          {/* Guest/Host Strip */}
          <div className="border-t border-slate-100 grid grid-cols-2 divide-x divide-slate-100">
            <div className="p-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guest</p>
              <p className="font-black text-slate-900 truncate">{qrData.invitation.guestName}</p>
            </div>
            <div className="p-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Host</p>
              <p className="font-black text-slate-900 truncate">{qrData.invitation.employeeName}</p>
            </div>
          </div>
        </motion.div>

        {/* OTP Section */}
        <AnimatePresence>
          {qrData.otp && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2rem] border border-amber-200 p-7 shadow-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <ICONS.Key className="text-amber-700" size={20} />
                </div>
                <div>
                  <p className="font-black text-amber-900">One-Time Password</p>
                  <p className="text-xs text-amber-600 font-medium">Share when requested by security</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-amber-100">
                <div className="text-5xl font-black text-amber-600 tracking-[0.35em] font-mono">
                  {qrData.otp.otpCode}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 text-xs font-bold">
                <span className="text-amber-700">Expires in</span>
                <span className={`text-base font-black ${otpTimeLeft < 60 ? "text-rose-600" : "text-amber-700"}`}>
                  {formatTime(otpTimeLeft)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-amber-100 rounded-full mt-2 overflow-hidden">
                <motion.div
                  animate={{ width: `${(otpTimeLeft / (qrData.otpExpirySeconds || 300)) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                  className={`h-full rounded-full ${otpTimeLeft < 60 ? "bg-rose-500" : "bg-amber-500"}`} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validity */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white/80 backdrop-blur rounded-[1.5rem] p-5 border border-slate-100 shadow-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valid From</p>
              <p className="text-sm font-black text-slate-800">{new Date(qrData.invitation.validFrom).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valid Until</p>
              <p className="text-sm font-black text-slate-800">{new Date(qrData.invitation.validTo).toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur rounded-[1.5rem] p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ICONS.Info size={16} className="text-indigo-500" />
            <p className="text-sm font-black text-slate-700">How to use this pass</p>
          </div>
          <ol className="space-y-3">
            {[
              "Present this QR code at the entrance gate",
              ...(qrData.otp ? ["Provide the OTP code when asked by security"] : []),
              "Wait for verification and entry approval",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-600 font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Footer */}
        <div className="text-center pt-4 pb-2">
          <p className="text-[11px] text-slate-400 font-medium mb-3">
            Keep this page open for entry. Do not share your QR or OTP.
          </p>
          <div className="flex items-center justify-center gap-2">
            <ICONS.ShieldCheck className="text-slate-300 w-4 h-4" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Knockster</p>
          </div>
        </div>
      </div>
    </div>
  );
}
