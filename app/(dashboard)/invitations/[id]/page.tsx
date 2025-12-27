"use client";

import { ICONS, SECURITY_INFO } from "@/constants";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SecurityLevel } from "@/types";

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

  useEffect(() => {
    fetchInvitationDetail();
  }, [id]);

  const fetchInvitationDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('knockster_token');

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/invitations/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch invitation');
      }

      setInvitation(data.data);
    } catch (error: any) {
      console.error('Error fetching invitation:', error);
      setError(error.message || 'Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke this invitation? This action cannot be undone.')) {
      return;
    }

    try {
      setRevoking(true);
      const token = localStorage.getItem('knockster_token');

      const response = await fetch(`/api/invitations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'REVOKED' }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to revoke invitation');
      }

      // Refresh invitation data
      await fetchInvitationDetail();
      alert('Invitation revoked successfully');
    } catch (error: any) {
      console.error('Error revoking invitation:', error);
      alert(error.message || 'Failed to revoke invitation');
    } finally {
      setRevoking(false);
    }
  };

  const handleResend = () => {
    // TODO: Implement resend functionality with SMS/Email
    alert('Resend functionality will be available once SMS/Email integration is complete');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 mt-4">Loading invitation details...</p>
      </div>
    );
  }

  if (error || !invitation) {
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
          <p className="text-rose-600 font-semibold mt-4">{error || 'Invitation not found'}</p>
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
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
          {/* QR and Status */}
          <div className="w-full md:w-64 flex-shrink-0 flex flex-col items-center gap-6">
            <div className="relative p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 aspect-square w-full flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${invitation.id}`}
                alt="QR Code"
                className="w-40 h-40 opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                <p className="text-xs font-bold text-slate-400 uppercase bg-white px-3 py-1.5 rounded-full shadow-sm">
                  Rotating QR Code
                </p>
              </div>
            </div>
            <div className="w-full space-y-3">
              <button
                onClick={handleRevoke}
                disabled={revoking || invitation.status === 'REVOKED'}
                className="w-full py-3 px-4 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-all border border-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {revoking ? 'Revoking...' : invitation.status === 'REVOKED' ? 'Already Revoked' : 'Revoke Access'}
              </button>
              <button
                onClick={handleResend}
                className="w-full py-3 px-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all border border-slate-200"
              >
                Resend to Guest
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {invitation.guestName}
                </h1>
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                  <ICONS.Phone size={14} /> {invitation.guestPhone}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                    SECURITY_INFO[`L${invitation.securityLevel}` as SecurityLevel].color
                  }`}
                >
                  Security L{invitation.securityLevel}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                    invitation.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                    invitation.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600' :
                    invitation.status === 'REVOKED' ? 'bg-rose-50 text-rose-600' :
                    'bg-slate-100 text-slate-500'
                  }`}
                >
                  {invitation.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Validity Period
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(invitation.validFrom).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    to {new Date(invitation.validTo).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Invited By (Host)
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-900">
                    {invitation.employeeName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {invitation.employeePhone}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Recent Activity
              </p>
              <div className="space-y-3">
                {invitation.scanEvents.length === 0 ? (
                  <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-center">
                    <p className="text-slate-500 text-sm">No scan activity yet</p>
                  </div>
                ) : (
                  invitation.scanEvents.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            log.scanResult === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-rose-100 text-rose-600"
                          }`}
                        >
                          {log.scanResult === "SUCCESS" ? (
                            <ICONS.Success size={14} />
                          ) : (
                            <ICONS.Failure size={14} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {log.scanResult === "SUCCESS" ? "Successful" : "Failed"} Scan
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {new Date(log.scannedAt).toLocaleString()}
                          </p>
                          {log.failureReason && (
                            <p className="text-[10px] text-rose-600 mt-0.5">
                              {log.failureReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        L{log.securityLevel}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
