"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ICONS } from '@/constants';

const Profile: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Profile data
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('knockster_token');

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      setProfileData(data.data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passwordData.newPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Reset password form and close modal
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);

      alert('Password updated successfully! Please login again.');
      handleLogout();
    } catch (error: any) {
      console.error('Error updating password:', error);
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

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 mt-4">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Profile</h1>
          <p className="text-slate-500 mt-1">Manage your account settings and preferences</p>
        </div>
        {showFeedback && (
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
            <ICONS.Success size={16} />
            Changes Saved
          </div>
        )}
      </header>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
          <ICONS.Failure className="text-rose-600" size={20} />
          <p className="text-rose-600 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6 flex items-end justify-between">
            <div className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg ring-1 ring-slate-100 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <ICONS.Profile className="text-white w-12 h-12" />
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Organization</p>
              <p className="text-sm font-bold text-slate-900">{profileData.organizationName || 'N/A'}</p>
              <p className="text-xs text-slate-500 capitalize">{profileData.organizationType || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 px-1">This is your login email and cannot be changed</p>
            </div>

            <div className="space-y-4 pt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Security & Access</p>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-3 w-full p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-left"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-500 shadow-sm">
                  <ICONS.ShieldCheck size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Update Password</p>
                  <p className="text-xs text-slate-500">Secure your admin dashboard</p>
                </div>
                <ICONS.ArrowRight size={18} className="text-slate-300" />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-4 bg-rose-50/50 rounded-2xl hover:bg-rose-50 transition-all text-left group"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <ICONS.Logout size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Logout</p>
                  <p className="text-xs text-slate-500">End your current session</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ICONS.ShieldCheck className="text-blue-500" size={20} />
                Update Password
              </h2>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
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
                  <label className="text-sm font-semibold text-slate-700">New Password</label>
                  <input
                    type="password"
                    placeholder="Min 8 characters"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <ICONS.Warning size={16} className="text-amber-500 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  After updating your password, you will be logged out and need to sign in again with your new credentials.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
