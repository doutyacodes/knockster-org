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
      router.replace("/invitations");
    } catch (error) {
      console.error('Login error:', error);
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FDFDFE] relative overflow-hidden selection:bg-purple-200">
      {/* Soft Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[0%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-purple-400/20 to-indigo-400/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-[20%] right-[0%] w-[50%] h-[70%] rounded-full bg-gradient-to-bl from-blue-400/20 to-cyan-300/20 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 ring-4 ring-white">
            <ICONS.ShieldCheck className="text-white w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-800 tracking-tighter">
              Knockster
            </h1>
            <p className="text-purple-600/80 mt-2 font-bold tracking-widest uppercase text-xs">
              Welcome Back
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-purple-900/5 border border-white">
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@knockster.io"
                className="w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-2xl
                  focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400
                  transition-all text-sm font-medium"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-2xl
                  focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400
                  transition-all text-sm font-medium"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl
                hover:opacity-90 transition-all shadow-xl shadow-indigo-200
                flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Access Platform
                  <ICONS.ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-400 font-medium text-center">
          Secure access portal.
          <br />
          <a href="/signup" className="text-purple-600 font-bold hover:underline mt-4 inline-block">Need an account? Sign up here</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
