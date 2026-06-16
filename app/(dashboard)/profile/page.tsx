"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ICONS } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';

const Profile: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const [profileData, setProfileData] = useState({
    id: '',
    email: '',
    organizationName: '',
    organizationType: '',
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('knockster_token');
      if (!token) { router.push('/login'); return; }

      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to fetch profile');
      setProfileData(data.data);
    } catch (error: any) {
      setError(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('knockster_token');
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ password: passwordData.newPassword }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to update profile');
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      alert('Password updated successfully! Please login again.');
      handleLogout();
    } catch (error: any) {
      setError(error.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('knockster_token');
    localStorage.removeItem('knockster_user');
    localStorage.removeItem('knockster_auth');
    router.push('/login');
  };

  const initials = profileData.organizationName
    ? profileData.organizationName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-8 pb-10">

      <AnimatePresence>
        {showFeedback && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <ICONS.Success className="text-emerald-500" size={20} />
            <p className="text-emerald-700 font-bold text-sm">Profile updated successfully</p>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
            <ICONS.Failure className="text-rose-600" size={20} />
            <p className="text-rose-700 font-medium text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-indigo-500/5 border border-white overflow-hidden">
        {/* Hero Banner */}
        <div className="h-36 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-8 w-32 h-32 rounded-full bg-white blur-2xl" />
            <div className="absolute bottom-0 right-12 w-24 h-24 rounded-full bg-white blur-xl" />
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="relative -mt-14 mb-6 flex items-end justify-between">
            <div className="w-28 h-28 rounded-[1.5rem] border-4 border-white shadow-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <span className="text-3xl font-black text-white">{initials}</span>
            </div>
            <div className="mb-2 text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Organization</p>
              <p className="font-black text-slate-900 text-lg leading-tight">{profileData.organizationName || 'N/A'}</p>
              <p className="text-xs text-slate-500 capitalize font-medium">{profileData.organizationType || 'N/A'}</p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</p>
              <p className="font-bold text-slate-800">{profileData.email}</p>
              <p className="text-xs text-slate-400 mt-1">Your login email — cannot be changed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Account Actions</p>

        <motion.button whileHover={{ x: 4 }} onClick={() => { setError(''); setShowPasswordModal(true); }}
          className="flex items-center gap-4 w-full p-5 bg-white/70 backdrop-blur-xl border border-white rounded-[1.75rem] shadow-lg hover:shadow-xl transition-all text-left group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <ICONS.ShieldCheck size={22} />
          </div>
          <div className="flex-1">
            <p className="font-black text-slate-900 text-sm">Update Password</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Change your admin account password</p>
          </div>
          <ICONS.ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </motion.button>

        <motion.button whileHover={{ x: 4 }} onClick={handleLogout}
          className="flex items-center gap-4 w-full p-5 bg-rose-50/60 backdrop-blur-xl border border-rose-100 rounded-[1.75rem] shadow-lg hover:shadow-xl hover:bg-rose-50 transition-all text-left group">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm group-hover:bg-rose-500 group-hover:text-white transition-all">
            <ICONS.Logout size={22} />
          </div>
          <div className="flex-1">
            <p className="font-black text-slate-900 text-sm">Sign Out</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">End your current session securely</p>
          </div>
        </motion.button>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setShowPasswordModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white/90 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Update Password</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Security Settings</p>
                </div>
                <button onClick={() => setShowPasswordModal(false)}
                  className="w-10 h-10 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 rounded-full flex items-center justify-center transition-all">
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">New Password</label>
                    <input type="password" placeholder="Minimum 6 characters"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Confirm Password</label>
                    <input type="password" placeholder="Re-enter new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium" />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <ICONS.Warning size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700 leading-relaxed font-medium">
                    You will be signed out after updating your password. You'll need to sign in again with your new credentials.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                <button onClick={() => setShowPasswordModal(false)} disabled={isSaving}
                  className="flex-1 px-4 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handlePasswordChange} disabled={isSaving}
                  className="flex-1 px-4 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-white hover:opacity-90 shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Update Password"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
