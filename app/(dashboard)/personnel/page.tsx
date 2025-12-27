"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ICONS } from '@/constants';

interface Personnel {
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
}

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState<Personnel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Add personnel form state
  const [addFormData, setAddFormData] = useState({
    username: '',
    password: '',
    shiftStart: '',
    shiftEnd: '',
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    username: '',
    password: '',
    shiftStart: '',
    shiftEnd: '',
    isActive: true,
  });

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('knockster_token');

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/personnel', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch personnel');
      }

      setPersonnel(data.data);
    } catch (error: any) {
      console.error('Error fetching personnel:', error);
      setError(error.message || 'Failed to load personnel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const handleAddPersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!addFormData.username || !addFormData.password) {
      setError('Username and password are required');
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('knockster_token');

      const response = await fetch('/api/personnel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(addFormData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create personnel');
      }

      // Reset form and close modal
      setAddFormData({
        username: '',
        password: '',
        shiftStart: '',
        shiftEnd: '',
      });
      setIsAddModalOpen(false);

      // Refresh personnel list
      await fetchPersonnel();
    } catch (error: any) {
      console.error('Error creating personnel:', error);
      setError(error.message || 'Failed to create personnel');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, guard: Personnel) => {
    e.stopPropagation();
    setEditingGuard(guard);
    setEditFormData({
      username: guard.username,
      password: '',
      shiftStart: guard.shiftStart || '',
      shiftEnd: guard.shiftEnd || '',
      isActive: guard.isActive,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingGuard) return;

    setIsSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('knockster_token');

      // Only send fields that have values
      const updateData: any = {
        username: editFormData.username,
        shiftStart: editFormData.shiftStart || null,
        shiftEnd: editFormData.shiftEnd || null,
        isActive: editFormData.isActive,
      };

      // Only include password if it was entered
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      const response = await fetch(`/api/personnel/${editingGuard.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update personnel');
      }

      // Close modal and refresh
      setEditingGuard(null);
      await fetchPersonnel();
    } catch (error: any) {
      console.error('Error updating personnel:', error);
      setError(error.message || 'Failed to update personnel');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogsClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    router.push(`/personnel/${id}`);
  };

  const handleCopyUrl = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/personnel/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Personnel URL copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy URL');
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 mt-4">Loading personnel...</p>
      </div>
    );
  }

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security Personnel</h1>
          <p className="text-slate-500 mt-1">Manage guard accounts and deployment shifts</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm font-medium"
        >
          <ICONS.Add size={18} />
          Add Personnel
        </button>
      </header>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
          <ICONS.Failure className="text-rose-600" size={20} />
          <p className="text-rose-600 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personnel.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
              <ICONS.Personnel className="text-slate-400" size={32} />
            </div>
            <p className="text-slate-900 font-semibold mt-4">No personnel added yet</p>
            <p className="text-slate-500 text-sm mt-2">Create your first guard account to get started</p>
          </div>
        ) : (
          personnel.map((guard) => (
            <div
              key={guard.id}
              onClick={() => router.push(`/personnel/${guard.id}`)}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-blue-100 transition-all group cursor-pointer relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <ICONS.Personnel size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 truncate max-w-[150px]">{guard.username}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${guard.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className="text-xs text-slate-500">{guard.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  <ICONS.More size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group-hover:bg-white group-hover:border group-hover:border-slate-100 transition-all">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ICONS.Time size={14} />
                    <span className="text-xs font-medium">Active Shift</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {guard.shiftStart && guard.shiftEnd
                      ? `${guard.shiftStart} - ${guard.shiftEnd}`
                      : 'Not set'}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Device Info</p>
                  <p className="text-sm text-slate-700 font-medium truncate">
                    {guard.deviceModel && guard.deviceOs
                      ? `${guard.deviceModel} (${guard.deviceOs})`
                      : 'No device bound'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={(e) => handleEditClick(e, guard)}
                    className="py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleLogsClick(e, guard.id)}
                    className="py-2 rounded-lg border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-all"
                  >
                    Logs
                  </button>
                  <button
                    onClick={(e) => handleCopyUrl(e, guard.id)}
                    className="col-span-2 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                  >
                    <ICONS.Link size={14} />
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Personnel Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add New Personnel</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <ICONS.Close size={20} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddPersonnel} className="p-6 space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2">
                  <ICONS.Failure className="text-rose-600" size={16} />
                  <p className="text-rose-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Login Username</label>
                  <input
                    type="text"
                    placeholder="e.g. guard_north_lobby"
                    value={addFormData.username}
                    onChange={(e) => setAddFormData({ ...addFormData, username: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <input
                    type="password"
                    placeholder="Min 8 characters"
                    value={addFormData.password}
                    onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Shift Start</label>
                    <input
                      type="time"
                      value={addFormData.shiftStart}
                      onChange={(e) => setAddFormData({ ...addFormData, shiftStart: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Shift End</label>
                    <input
                      type="time"
                      value={addFormData.shiftEnd}
                      onChange={(e) => setAddFormData({ ...addFormData, shiftEnd: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPersonnel}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Guard'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Personnel Modal */}
      {editingGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingGuard(null)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-50/30">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ICONS.Personnel className="text-blue-500" size={20} />
                Edit Credentials
              </h2>
              <button onClick={() => setEditingGuard(null)} className="p-2 hover:bg-white rounded-full transition-all shadow-sm">
                <ICONS.Close size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2">
                  <ICONS.Failure className="text-rose-600" size={16} />
                  <p className="text-rose-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username / Identifier</label>
                  <input
                    type="text"
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift Start</label>
                    <input
                      type="time"
                      value={editFormData.shiftStart}
                      onChange={(e) => setEditFormData({ ...editFormData, shiftStart: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift End</label>
                    <input
                      type="time"
                      value={editFormData.shiftEnd}
                      onChange={(e) => setEditFormData({ ...editFormData, shiftEnd: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Status</label>
                  <div className="flex gap-2">
                    {[
                      { label: 'Active', value: true },
                      { label: 'Inactive', value: false },
                    ].map((status) => (
                      <button
                        key={status.label}
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, isActive: status.value })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          editFormData.isActive === status.value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <ICONS.Warning size={16} className="text-amber-500 mt-0.5" />
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Changing credentials will invalidate current active sessions for this guard. They will need to re-authenticate on their primary device.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => setEditingGuard(null)}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-white transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
