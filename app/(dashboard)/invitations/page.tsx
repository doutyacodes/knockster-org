"use client"
import React, { useState, useEffect } from 'react';
import { ICONS, SECURITY_INFO } from '@/constants';
import { InvitationStatus, SecurityLevel } from '@/types';
import { useRouter } from 'next/navigation';

interface Invitation {
  id: string;
  guestName: string;
  guestPhone: string;
  employeeName: string;
  employeePhone: string;
  validFrom: string;
  validTo: string;
  securityLevel: number;
  status: InvitationStatus;
  createdAt: string;
}

const Invitations: React.FC = () => {
  const [filter, setFilter] = useState<InvitationStatus | 'All'>('All');
  const [showModal, setShowModal] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    employeeName: '',
    employeePhone: '',
    guestName: '',
    guestPhone: '',
    validFrom: '',
    validTo: '',
    securityLevel: 1,
  });

  // Fetch invitations
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('knockster_token');

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/invitations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch invitations');
      }

      setInvitations(data.data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.employeeName || !formData.employeePhone || !formData.guestName ||
        !formData.guestPhone || !formData.validFrom || !formData.validTo) {
      setError('All fields are required');
      return;
    }

    setCreating(true);

    try {
      const token = localStorage.getItem('knockster_token');

      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create invitation');
      }

      // Reset form and close modal
      setFormData({
        employeeName: '',
        employeePhone: '',
        guestName: '',
        guestPhone: '',
        validFrom: '',
        validTo: '',
        securityLevel: 1,
      });
      setShowModal(false);

      // Refresh invitations
      await fetchInvitations();
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      setError(error.message || 'Failed to create invitation');
    } finally {
      setCreating(false);
    }
  };

  const filteredInvitations = invitations.filter(
    i => filter === 'All' || i.status === filter.toUpperCase()
  );

  // Copy guest QR page URL to clipboard
  const handleCopyGuestUrl = (e: React.MouseEvent, invitationId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/guest/${invitationId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Guest QR page URL copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy URL');
    });
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Guest Invitations</h1>
          <p className="text-slate-500 mt-1">Manage visitor access and security levels</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm font-medium"
        >
          <ICONS.Add size={18} />
          Create Invitation
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 inline-flex flex-wrap md:flex-nowrap mb-2">
        {['All', 'Active', 'Upcoming', 'Expired', 'Revoked'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 mt-4">Loading invitations...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
          <ICONS.Failure className="text-rose-600" size={20} />
          <p className="text-rose-600 font-medium">{error}</p>
        </div>
      )}

      {/* Invitations Table */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Guest Detail</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Valid Period</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Host / Employee</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Security Level</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                          <ICONS.Calendar className="text-slate-400" size={32} />
                        </div>
                        <div>
                          <p className="text-slate-900 font-semibold">No invitations found</p>
                          <p className="text-slate-500 text-sm mt-1">Create your first invitation to get started</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvitations.map((invite) => (
                    <tr
                      key={invite.id}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/invitations/${invite.id}`)}
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{invite.guestName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{invite.guestPhone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <ICONS.Calendar size={14} className="text-slate-400" />
                          <span>{new Date(invite.validFrom).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(invite.validFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                          {new Date(invite.validTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900 font-medium">{invite.employeeName}</p>
                        <p className="text-xs text-slate-500">{invite.employeePhone}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${SECURITY_INFO[`L${invite.securityLevel}` as SecurityLevel].color}`}>
                          L{invite.securityLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                          invite.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                          invite.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600' :
                          invite.status === 'REVOKED' ? 'bg-rose-50 text-rose-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            invite.status === 'ACTIVE' ? 'bg-emerald-500' :
                            invite.status === 'UPCOMING' ? 'bg-blue-500' :
                            invite.status === 'REVOKED' ? 'bg-rose-500' :
                            'bg-slate-400'
                          }`} />
                          {invite.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => handleCopyGuestUrl(e, invite.id)}
                          className="px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all flex items-center gap-2 ml-auto"
                        >
                          <ICONS.Link size={14} />
                          Copy Guest URL
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Invitation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Create New Invitation</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <ICONS.Close size={20} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2">
                  <ICONS.Failure className="text-rose-600" size={16} />
                  <p className="text-rose-600 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Employee Detail */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee (Host)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Host Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.employeeName}
                      onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Host Phone</label>
                    <input
                      type="tel"
                      placeholder="+1..."
                      value={formData.employeePhone}
                      onChange={(e) => setFormData({ ...formData, employeePhone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Guest Detail */}
              <div className="space-y-4 pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Guest Detail</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Guest Name</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Guest Phone</label>
                    <input
                      type="tel"
                      placeholder="+1..."
                      value={formData.guestPhone}
                      onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Security & Dates */}
              <div className="space-y-4 pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Access Control</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Valid From</label>
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Valid Until</label>
                    <input
                      type="datetime-local"
                      value={formData.validTo}
                      onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-slate-700">Security Level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(SECURITY_INFO).map(([key, value]) => (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setFormData({ ...formData, securityLevel: parseInt(key.replace('L', '')) })}
                        className={`p-3 rounded-xl border transition-all text-center flex flex-col items-center gap-1.5
                        ${formData.securityLevel === parseInt(key.replace('L', '')) ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${value.color}`}>{key}</span>
                        <span className="text-[9px] text-slate-500 font-medium leading-tight">{value.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={creating}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={creating}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create & Send Invite'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Invitations;
