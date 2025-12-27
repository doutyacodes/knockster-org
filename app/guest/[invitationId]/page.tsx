"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ICONS, SECURITY_INFO } from "@/constants";

interface QRData {
  qrSession: {
    qrCode: string;
    expiresAt: string;
    createdAt: string;
  };
  otp: {
    otpCode: string;
    expiresAt: string;
    createdAt: string;
  } | null;
  invitation: {
    id: number;
    securityLevel: number;
    validFrom: string;
    validTo: string;
    status: string;
  };
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

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load QR code');
      }

      setQrData(data.data);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching QR data:', error);
      setError(error.message || 'Failed to load QR code');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRData();
  }, [invitationId]);

  // Update countdown timers
  useEffect(() => {
    if (!qrData) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();

      // QR countdown
      const qrExpiry = new Date(qrData.qrSession.expiresAt).getTime();
      const qrRemaining = Math.max(0, Math.floor((qrExpiry - now) / 1000));
      setQrTimeLeft(qrRemaining);

      // OTP countdown
      if (qrData.otp) {
        const otpExpiry = new Date(qrData.otp.expiresAt).getTime();
        const otpRemaining = Math.max(0, Math.floor((otpExpiry - now) / 1000));
        setOtpTimeLeft(otpRemaining);
      }

      // Auto-refresh when QR expires
      if (qrRemaining === 0) {
        fetchQRData();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 mt-6 font-medium">Loading your access pass...</p>
        </div>
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-slate-100 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
            <ICONS.Failure className="text-rose-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-6">Access Denied</h1>
          <p className="text-slate-600 mt-3">{error || 'Invalid invitation'}</p>
          <p className="text-sm text-slate-400 mt-6">
            If you believe this is an error, please contact your host.
          </p>
        </div>
      </div>
    );
  }

  const securityLevel = `L${qrData.invitation.securityLevel}` as keyof typeof SECURITY_INFO;
  const securityInfo = SECURITY_INFO[securityLevel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 p-4 flex items-center justify-center">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
            <ICONS.ShieldCheck className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Knockster
            </h1>
            <p className="text-slate-500 mt-1 font-semibold">
              Visitor Access Pass
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
          {/* Security Level Banner */}
          <div className={`p-4 text-center ${securityInfo.color.replace('text', 'bg').replace('600', '50')} border-b border-slate-100`}>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${securityInfo.color}`}>
              <ICONS.ShieldCheck size={16} />
              Security Level L{qrData.invitation.securityLevel}
            </span>
            <p className="text-xs text-slate-600 mt-2">{securityInfo.description}</p>
          </div>

          {/* QR Code Section */}
          <div className="p-8">
            <div className="relative bg-gradient-to-br from-slate-50 to-white p-8 rounded-3xl border-2 border-slate-100 shadow-inner">
              <div className="aspect-square w-full max-w-sm mx-auto bg-white rounded-2xl p-6 shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                    JSON.stringify({
                      invitationId: invitationId,
                      qrCode: qrData.qrSession.qrCode
                    })
                  )}`}
                  alt="Access QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* QR Countdown */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-slate-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-slate-700">
                    Refreshes in: {formatTime(qrTimeLeft)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  QR code rotates every {qrData.qrExpirySeconds / 60} minutes for security
                </p>
              </div>
            </div>

            {/* OTP Section (L2/L4 only) */}
            {qrData.otp && (
              <div className="mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-200">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <ICONS.Key className="text-amber-600" size={24} />
                  <h2 className="text-lg font-bold text-amber-900">One-Time Password</h2>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                  <div className="text-5xl font-black text-amber-600 tracking-widest font-mono">
                    {qrData.otp.otpCode}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <ICONS.Clock className="text-amber-500" size={16} />
                    <span className="text-sm font-semibold text-amber-700">
                      Expires in: {formatTime(otpTimeLeft)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-amber-800 text-center mt-4">
                  Present this code when requested by security
                </p>
              </div>
            )}

            {/* Validity Period */}
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Valid From
                  </p>
                  <p className="font-semibold text-slate-900">
                    {new Date(qrData.invitation.validFrom).toLocaleString()}
                  </p>
                </div>
                <ICONS.ArrowRight className="text-slate-300" size={20} />
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Valid Until
                  </p>
                  <p className="font-semibold text-slate-900">
                    {new Date(qrData.invitation.validTo).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <ICONS.Info size={16} className="text-blue-600" />
            How to Use
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </span>
              <span>Present this QR code to security personnel at the gate</span>
            </li>
            {qrData.otp && (
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>Provide the OTP code when requested</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {qrData.otp ? '3' : '2'}
              </span>
              <span>Wait for verification and entry approval</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          Keep this page open for entry. Do not share this QR code or OTP.
        </p>
      </div>
    </div>
  );
}
