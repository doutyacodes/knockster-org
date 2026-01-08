"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ICONS } from "@/constants";

const LoginPage = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      // Store token and user data
      localStorage.setItem("knockster_token", data.data.token);
      localStorage.setItem("knockster_user", JSON.stringify(data.data.user));
      localStorage.setItem("knockster_auth", "true"); // For backward compatibility

      // Redirect to dashboard
      router.replace("/");
    } catch (error) {
      console.error('Login error:', error);
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
            <ICONS.ShieldCheck className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              Knockster
            </h1>
            <p className="text-slate-500 mt-2 font-semibold">
              Enterprise Security Management
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                <ICONS.Failure size={16} />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                Administrator Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@knockster.io"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl
                  focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                  transition-all text-sm font-medium"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                Secure Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl
                  focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                  transition-all text-sm font-medium"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl
                hover:bg-blue-700 transition-all shadow-xl shadow-blue-200
                flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate Access
                  <ICONS.ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-400 font-medium text-center">
          Authorized Org Admin access only.
          <br />
          IP logging and behavioral analysis active.
          {/* test */}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
