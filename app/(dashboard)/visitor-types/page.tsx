"use client";

import React, { useState, useEffect } from "react";
import { ICONS } from "@/constants";
import { api } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

interface VisitorType {
  id: string;
  name: string;
  defaultSecurityLevel: number;
}

const LEVEL_STYLES: Record<number, { badge: string; ring: string; bg: string; icon: React.ElementType; desc: string }> = {
  1: { badge: "bg-sky-100 text-sky-700", ring: "ring-sky-200", bg: "from-sky-50 to-blue-50/40", icon: ICONS.ShieldCheck, desc: "Rotating QR Code only" },
  2: { badge: "bg-emerald-100 text-emerald-700", ring: "ring-emerald-200", bg: "from-emerald-50 to-teal-50/40", icon: ICONS.Key, desc: "QR Code + One-Time Password" },
  3: { badge: "bg-violet-100 text-violet-700", ring: "ring-violet-200", bg: "from-violet-50 to-purple-50/40", icon: ICONS.Personnel, desc: "Security Guard App Scanning" },
  4: { badge: "bg-rose-100 text-rose-700", ring: "ring-rose-200", bg: "from-rose-50 to-pink-50/40", icon: ICONS.Alerts, desc: "Full Multi-Factor Authentication" },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const VisitorTypesPage = () => {
  const [types, setTypes] = useState<VisitorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<VisitorType | null>(null);
  const [name, setName] = useState("");
  const [defaultSecurityLevel, setDefaultSecurityLevel] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchTypes(); }, []);

  const fetchTypes = async () => {
    try {
      const data = await api.get<VisitorType[]>("/api/visitor-types");
      setTypes(data);
    } catch (err: any) {
      setError(err.message || "Failed to load visitor types");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingType(null);
    setName("");
    setDefaultSecurityLevel(1);
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (type: VisitorType) => {
    setEditingType(type);
    setName(type.name);
    setDefaultSecurityLevel(type.defaultSecurityLevel);
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      if (editingType) {
        await api.put("/api/visitor-types", { id: editingType.id, defaultSecurityLevel });
        setSuccess("Security level updated successfully");
      } else {
        await api.post("/api/visitor-types", { name, defaultSecurityLevel });
        setSuccess("Visitor type created successfully");
      }
      setIsModalOpen(false);
      fetchTypes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save visitor type");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 backdrop-blur-lg border border-white p-8 rounded-[2rem] shadow-xl shadow-purple-500/5">
        <div>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Access Configuration</p>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-800 tracking-tight">
            Visitor Types
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Define guest categories with their default security protocols.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {types.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl">
              <ICONS.Users className="text-indigo-500" size={16} />
              <span className="text-sm font-black text-indigo-700">{types.length} types</span>
            </div>
          )}
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-200 font-bold shrink-0 hover:scale-[1.02]"
          >
            <ICONS.Plus size={20} />
            New Type
          </button>
        </div>
      </header>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <ICONS.Success className="text-emerald-500" size={20} />
            <p className="text-emerald-700 font-bold text-sm">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/40 rounded-[2rem] h-52 animate-pulse border border-white/50" />
          ))}
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {types.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full py-24 text-center bg-white/40 backdrop-blur-xl border border-white rounded-[3rem] shadow-xl">
                <div className="w-20 h-20 bg-gradient-to-tr from-violet-100 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <ICONS.Users className="text-indigo-400 w-9 h-9" />
                </div>
                <h3 className="text-2xl font-black text-indigo-950 mb-2">No visitor types yet</h3>
                <p className="text-slate-500 font-medium mb-6">Create categories to organize your guests</p>
                <button onClick={handleOpenCreate}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-200">
                  Create First Type
                </button>
              </motion.div>
            ) : (
              types.map((type) => {
                const lvl = LEVEL_STYLES[type.defaultSecurityLevel] ?? LEVEL_STYLES[1];
                const Icon = lvl.icon;
                return (
                  <motion.div key={type.id} variants={cardAnim} whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className={`bg-gradient-to-br ${lvl.bg} backdrop-blur-xl rounded-[2rem] p-6 shadow-xl shadow-indigo-500/5 border border-white/80 group flex flex-col`}>
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${lvl.badge} ring-4 ${lvl.ring}`}>
                        <Icon size={22} />
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${lvl.badge}`}>
                        Level {type.defaultSecurityLevel}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
                      {type.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium flex-1 mb-6">{lvl.desc}</p>
                    <button onClick={() => handleOpenEdit(type)}
                      className="w-full py-3 rounded-2xl border border-white/80 bg-white/70 backdrop-blur text-slate-700 text-sm font-bold hover:bg-white hover:shadow-md transition-all">
                      Edit Security Level
                    </button>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white/90 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {editingType ? "Edit Security Level" : "New Visitor Type"}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {editingType ? editingType.name : "Create Category"}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 rounded-full flex items-center justify-center transition-all">
                  <ICONS.Close size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-2">
                    <ICONS.Failure className="text-rose-600" size={16} />
                    <p className="text-rose-600 text-sm font-bold">{error}</p>
                  </div>
                )}

                {!editingType && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                      Category Name
                    </label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                      placeholder="e.g. VIP, Maintenance, Delivery" />
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    Default Security Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { level: 1, label: "L1", desc: "QR Code Only" },
                      { level: 2, label: "L2", desc: "QR + OTP" },
                      { level: 3, label: "L3", desc: "App Scanning" },
                      { level: 4, label: "L4", desc: "Multi-Factor" },
                    ].map(({ level, label, desc }) => {
                      const st = LEVEL_STYLES[level];
                      const selected = defaultSecurityLevel === level;
                      return (
                        <button key={level} type="button" onClick={() => setDefaultSecurityLevel(level)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${
                            selected ? `${st.badge} border-current ring-4 ${st.ring}` : "border-slate-100 hover:border-slate-200 bg-white"
                          }`}>
                          <span className="block text-sm font-black mb-0.5">{label}</span>
                          <span className="block text-xs opacity-80 font-medium">{desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 px-4 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-white hover:opacity-90 shadow-xl shadow-indigo-200 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editingType ? "Save Changes" : "Create Type")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VisitorTypesPage;
