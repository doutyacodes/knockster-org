"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ICONS } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';

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

  const [addFormData, setAddFormData] = useState({
    username: '',
    password: '',
    shiftStart: '',
    shiftEnd: '',
  });

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
        headers: { 'Authorization': `Bearer ${token}` },
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

      setAddFormData({
        username: '',
        password: '',
        shiftStart: '',
        shiftEnd: '',
      });
      setIsAddModalOpen(false);

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

      const updateData: any = {
        username: editFormData.username,
        shiftStart: editFormData.shiftStart || null,
        shiftEnd: editFormData.shiftEnd || null,
        isActive: editFormData.isActive,
      };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 backdrop-blur-lg border border-white p-8 rounded-[2rem] shadow-xl shadow-purple-500/5">
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-800 tracking-tight">
            Security Personnel
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Manage guard accounts, credentials, and deployment shifts.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-200 font-bold shrink-0 hover:scale-[1.02]"
        >
          <ICONS.Add size={20} />
          Add Personnel
        </button>
      </header>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-50/80 backdrop-blur-md border border-rose-200 rounded-3xl p-5 flex items-center gap-3 shadow-lg shadow-rose-100/50">
          <ICONS.Failure className="text-rose-600" size={24} />
          <p className="text-rose-700 font-bold">{error}</p>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white/40 backdrop-blur-md rounded-[2rem] h-64 animate-pulse border border-white/50 shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {personnel.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full py-20 text-center bg-white/40 backdrop-blur-xl border border-white rounded-[3rem] shadow-xl shadow-indigo-100/20"
              >
                <div className="w-24 h-24 bg-gradient-to-tr from-purple-100 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <ICONS.Personnel className="text-indigo-400 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-indigo-950 mb-2">No personnel found</h3>
                <p className="text-slate-500 font-medium">Create your first guard account to get started</p>
              </motion.div>
            ) : (
              personnel.map((guard) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  key={guard.id}
                  onClick={() => router.push(`/personnel/${guard.id}`)}
                  className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl shadow-indigo-500/5 border border-white cursor-pointer group flex flex-col relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${guard.isActive ? 'bg-emerald-400' : 'bg-slate-300'}`} />

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-tr from-indigo-50 to-purple-50 rounded-[1.25rem] flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:text-indigo-600 transition-all shadow-sm">
                        <ICONS.Personnel size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[150px]">{guard.username}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${guard.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{guard.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100/50 group-hover:bg-white transition-all">
                      <div className="flex items-center gap-2 text-slate-500">
                        <ICONS.Time size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Active Shift</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">
                        {guard.shiftStart && guard.shiftEnd
                          ? `${guard.shiftStart} - ${guard.shiftEnd}`
                          : 'Not set'}
                      </span>
                    </div>

                    <div className="space-y-1 px-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Device Info</p>
                      <p className="text-sm text-slate-700 font-bold truncate">
                        {guard.deviceModel && guard.deviceOs
                          ? `${guard.deviceModel} (${guard.deviceOs})`
                          : 'No device bound'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                      <button
                        onClick={(e) => handleEditClick(e, guard)}
                        className="py-2.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-black hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleLogsClick(e, guard.id)}
                        className="py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-black hover:bg-slate-50 transition-all shadow-sm"
                      >
                        Logs
                      </button>
                      <button
                        onClick={(e) => handleCopyUrl(e, guard.id)}
                        className="col-span-2 py-3 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700 text-xs font-black hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <ICONS.Link size={16} />
                        Copy App Login URL
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add Personnel Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white/90 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Add Guard</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">New Personnel</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-10 h-10 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 rounded-full flex items-center justify-center transition-all"
                >
                  <ICONS.Close size={20} />
                </button>
              </div>

              <form onSubmit={handleAddPersonnel} className="p-8 space-y-6">
                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-2">
                    <ICONS.Failure className="text-rose-600" size={16} />
                    <p className="text-rose-600 text-sm font-bold">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Login Username</label>
                    <input
                      type="text"
                      placeholder="e.g. guard_north_lobby"
                      value={addFormData.username}
                      onChange={(e) => setAddFormData({ ...addFormData, username: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Password</label>
                    <input
                      type="password"
                      placeholder="Min 8 characters"
                      value={addFormData.password}
                      onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Shift Start</label>
                      <input
                        type="time"
                        value={addFormData.shiftStart}
                        onChange={(e) => setAddFormData({ ...addFormData, shiftStart: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Shift End</label>
                      <input
                        type="time"
                        value={addFormData.shiftEnd}
                        onChange={(e) => setAddFormData({ ...addFormData, shiftEnd: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 px-4 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPersonnel}
                  disabled={isSaving}
                  className="flex-1 px-4 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-white hover:opacity-90 shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Guard'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Personnel Modal */}
      <AnimatePresence>
        {editingGuard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setEditingGuard(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white/90 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Edit Guard</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Credentials & Access</p>
                </div>
                <button
                  onClick={() => setEditingGuard(null)}
                  className="w-10 h-10 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 rounded-full flex items-center justify-center transition-all"
                >
                  <ICONS.Close size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-2">
                    <ICONS.Failure className="text-rose-600" size={16} />
                    <p className="text-rose-600 text-sm font-bold">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Username / Identifier</label>
                    <input
                      type="text"
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">New Password (Optional)</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={editFormData.password}
                      onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Shift Start</label>
                      <input
                        type="time"
                        value={editFormData.shiftStart}
                        onChange={(e) => setEditFormData({ ...editFormData, shiftStart: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Shift End</label>
                      <input
                        type="time"
                        value={editFormData.shiftEnd}
                        onChange={(e) => setEditFormData({ ...editFormData, shiftEnd: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Account Status</label>
                    <div className="flex gap-2">
                      {[
                        { label: 'Active', value: true },
                        { label: 'Inactive', value: false },
                      ].map((status) => (
                        <button
                          key={status.label}
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, isActive: status.value })}
                          className={`flex-1 py-3 rounded-2xl text-xs font-black border-2 transition-all ${
                            editFormData.isActive === status.value
                              ? 'bg-purple-50 text-purple-700 border-purple-500 ring-4 ring-purple-500/10'
                              : 'bg-white text-slate-500 border-slate-100 hover:border-purple-200 hover:bg-slate-50'
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-start gap-3 mt-4">
                    <ICONS.Warning size={20} className="text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      Changing credentials will invalidate current active sessions for this guard. They will need to re-authenticate on their primary device.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-4 shrink-0">
                <button
                  onClick={() => setEditingGuard(null)}
                  disabled={isSaving}
                  className="flex-1 px-4 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-white transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 px-4 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-white hover:opacity-90 shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
