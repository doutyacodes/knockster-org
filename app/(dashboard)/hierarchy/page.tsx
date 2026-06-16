"use client";

import React, { useState, useEffect } from "react";
import {
  Layers, Plus, Search, Building2, Trash2, Loader2,
  AlertCircle, CheckCircle, GitBranch, UserCog,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

interface SubNode {
  id: string;
  name: string;
  type: string;
  status: string;
  parentId: string | null;
  createdAt: string;
}

interface SubNodeAdmin {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

interface User {
  id: string;
  canManageHierarchy: boolean;
  maxSubNodes: number;
  organizationNodeId: string;
  organizationName: string;
}

const TYPE_COLORS: Record<string, string> = {
  school: "bg-sky-100 text-sky-700",
  classroom: "bg-violet-100 text-violet-700",
  lab: "bg-emerald-100 text-emerald-700",
  block: "bg-amber-100 text-amber-700",
  building: "bg-blue-100 text-blue-700",
  gate: "bg-rose-100 text-rose-700",
  custom: "bg-slate-100 text-slate-600",
};

export default function HierarchyPage() {
  const [subNodes, setSubNodes] = useState<SubNode[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ name: "", type: "classroom", parentId: "" as string | undefined });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedNodeForAdmins, setSelectedNodeForAdmins] = useState<SubNode | null>(null);
  const [nodeAdmins, setNodeAdmins] = useState<SubNodeAdmin[]>([]);
  const [adminForm, setAdminForm] = useState({ email: "", password: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usr, nodes] = await Promise.all([
        api.get<User>("/api/auth/me"),
        api.get<SubNode[]>("/api/organizations/sub-nodes"),
      ]);
      setUser(usr);
      setSubNodes(nodes);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/organizations/sub-nodes", form);
      setSuccess("Unit created successfully!");
      setIsModalOpen(false);
      setForm({ name: "", type: "classroom", parentId: undefined });
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create unit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setSubmitting(true);
      await api.delete(`/api/organizations/sub-nodes?id=${id}`);
      setSuccess("Unit deleted successfully");
      setDeleteConfirmId(null);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete unit");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchNodeAdmins = async (nodeId: string) => {
    try {
      const admins = await api.get<SubNodeAdmin[]>(`/api/organizations/sub-node-admins?organizationNodeId=${nodeId}`);
      setNodeAdmins(admins);
    } catch (err: any) {
      setError(err.message || "Failed to fetch node admins");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNodeForAdmins) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/organizations/sub-node-admins", {
        ...adminForm,
        organizationNodeId: selectedNodeForAdmins.id,
      });
      setSuccess("Admin created successfully!");
      setAdminForm({ email: "", password: "" });
      fetchNodeAdmins(selectedNodeForAdmins.id);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  const flattenedWithDepth = React.useMemo(() => {
    if (!user) return [];
    const result: (SubNode & { depth: number })[] = [];
    const build = (parentId: string | null, depth: number) => {
      const children = subNodes.filter(
        (n) => n.parentId === parentId || (parentId === null && n.parentId === user.organizationNodeId)
      );
      children.forEach((child) => {
        result.push({ ...child, depth });
        build(child.id, depth + 1);
      });
    };
    const directChildren = subNodes.filter((n) => n.parentId === user.organizationNodeId);
    directChildren.forEach((node) => {
      result.push({ ...node, depth: 0 });
      build(node.id, 1);
    });
    return result;
  }, [subNodes, user]);

  const filteredNodes = flattenedWithDepth.filter(
    (n) =>
      n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const remainingQuota = user ? user.maxSubNodes - subNodes.length : 0;
  const isQuotaFull = remainingQuota <= 0;
  const quotaPercent = user ? Math.min(100, (subNodes.length / user.maxSubNodes) * 100) : 0;
  const selectedParentName = form.parentId
    ? subNodes.find((n) => n.id === form.parentId)?.name
    : user?.organizationName;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-medium">Loading hierarchy...</p>
      </div>
    );
  }

  if (user && !user.canManageHierarchy) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] p-12 shadow-xl">
        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-500 font-medium">You don't have permission to manage the organizational hierarchy.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="space-y-8">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 backdrop-blur-lg border border-white p-8 rounded-[2rem] shadow-xl shadow-purple-500/5">
        <div>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Organization Structure</p>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-800 tracking-tight">
            Campus Hierarchy
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Manage your organizational units, buildings, and access zones.
          </p>
        </div>
        <button
          onClick={() => { setForm({ name: "", type: "building", parentId: undefined }); setIsModalOpen(true); }}
          disabled={isQuotaFull}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shrink-0 ${
            isQuotaFull
              ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-indigo-200 hover:scale-[1.02]"
          }`}
        >
          <Plus className="w-5 h-5" />
          Add Root Unit
        </button>
      </header>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="text-emerald-500 w-5 h-5" />
            <p className="text-emerald-700 font-bold text-sm">{success}</p>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="text-rose-500 w-5 h-5" />
            <p className="text-rose-700 font-bold text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Units", value: subNodes.length,
            icon: <Layers className="w-6 h-6" />,
            color: "from-indigo-500/10 to-blue-500/5 text-indigo-700 bg-indigo-100",
          },
          {
            label: "Remaining Quota", value: `${remainingQuota}`,
            icon: isQuotaFull ? <AlertCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />,
            color: isQuotaFull
              ? "from-rose-500/10 to-pink-500/5 text-rose-700 bg-rose-100"
              : "from-emerald-500/10 to-teal-500/5 text-emerald-700 bg-emerald-100",
          },
          {
            label: "Organization", value: user?.organizationName || "—",
            icon: <Building2 className="w-6 h-6" />,
            color: "from-violet-500/10 to-purple-500/5 text-violet-700 bg-violet-100",
            small: true,
          },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${stat.color.split(" ")[0]} ${stat.color.split(" ")[1]} bg-white/70 backdrop-blur-xl rounded-[1.75rem] p-6 border border-white shadow-xl shadow-indigo-500/5 flex items-center gap-5`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color.split(" ").slice(2).join(" ")}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`font-black text-slate-900 ${stat.small ? "text-base" : "text-3xl"} truncate max-w-[150px]`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quota Bar */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] p-5 border border-white shadow-lg flex items-center gap-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Capacity</span>
        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${quotaPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${quotaPercent > 90 ? "bg-rose-500" : quotaPercent > 60 ? "bg-amber-500" : "bg-indigo-500"}`} />
        </div>
        <span className="text-xs font-black text-slate-600 whitespace-nowrap">
          {subNodes.length} / {user?.maxSubNodes}
        </span>
      </div>

      {/* Node List */}
      <div className="bg-white/40 backdrop-blur-xl border border-white rounded-[2rem] shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/60 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search units..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all font-medium" />
          </div>
          <span className="text-xs text-slate-500 font-bold">{filteredNodes.length} units</span>
        </div>

        <div className="divide-y divide-white/60">
          {filteredNodes.length === 0 ? (
            <div className="py-20 text-center">
              <Layers className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">
                {searchTerm ? "No units match your search" : "No units yet. Start building your hierarchy."}
              </p>
            </div>
          ) : (
            filteredNodes.map((node, i) => {
              const typeColor = TYPE_COLORS[node.type] ?? TYPE_COLORS.custom;
              return (
                <motion.div key={node.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 p-5 hover:bg-white/60 transition-all group"
                  style={{ paddingLeft: `${node.depth * 32 + 20}px` }}>
                  {node.depth > 0 && (
                    <div className="flex-shrink-0 w-6 flex justify-center">
                      <div className="w-px h-4 bg-slate-200 absolute" />
                      <div className="w-4 h-px bg-slate-200 mt-2" />
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    node.depth === 0 ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{node.name}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${typeColor}`}>
                      {node.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Add Sub-Unit"
                      onClick={() => { setForm({ name: "", type: "classroom", parentId: node.id }); setIsModalOpen(true); }}
                      disabled={isQuotaFull}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-30">
                      <GitBranch className="w-4 h-4" />
                    </button>
                    <button title="Manage Admins"
                      onClick={() => { setSelectedNodeForAdmins(node); fetchNodeAdmins(node.id); setIsAdminModalOpen(true); }}
                      className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                      <UserCog className="w-4 h-4" />
                    </button>
                    <button title="Delete" onClick={() => setDeleteConfirmId(node.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl">
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-7 h-7 text-rose-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 text-center mb-2">Delete this unit?</h3>
              <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
                This will permanently delete the unit and all its sub-units, admins, and associated security staff.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirmId!)} disabled={submitting}
                  className="flex-1 py-3.5 bg-rose-600 text-white rounded-2xl text-sm font-bold hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white/90 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Create New Unit</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-bold uppercase tracking-widest">
                    Under: <span className="text-indigo-500 ml-1">{selectedParentName}</span>
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 rounded-full flex items-center justify-center transition-all">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <form className="p-8 space-y-6" onSubmit={handleCreate}>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Unit Name</label>
                  <input type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-purple-100 focus:border-purple-400 focus:outline-none font-medium"
                    placeholder="e.g., Grade 10-A, North Gate" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Unit Type</label>
                  <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-purple-100 focus:border-purple-400 focus:outline-none font-medium">
                    <option value="school">School</option>
                    <option value="classroom">Classroom</option>
                    <option value="lab">Laboratory</option>
                    <option value="block">Block</option>
                    <option value="building">Building</option>
                    <option value="gate">Security Gate</option>
                    <option value="custom">Custom Unit</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting}
                    className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:opacity-90">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Unit"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Management Modal */}
      <AnimatePresence>
        {isAdminModalOpen && selectedNodeForAdmins && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setIsAdminModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white/90 backdrop-blur-2xl w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50 shrink-0">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Unit Admins</h3>
                  <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">
                    {selectedNodeForAdmins.name}
                  </p>
                </div>
                <button onClick={() => setIsAdminModalOpen(false)}
                  className="w-10 h-10 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 rounded-full flex items-center justify-center transition-all">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-8 space-y-8">
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Add New Admin</p>
                  <form className="space-y-4" onSubmit={handleCreateAdmin}>
                    <input type="email" required value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-purple-100 focus:border-purple-400 focus:outline-none font-medium"
                      placeholder="admin@organization.com" />
                    <input type="password" required value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-purple-100 focus:border-purple-400 focus:outline-none font-medium"
                      placeholder="Password" />
                    <button type="submit" disabled={submitting}
                      className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Admin Account"}
                    </button>
                  </form>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Existing Admins</p>
                  {nodeAdmins.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50 rounded-2xl">
                      <p className="text-slate-400 text-sm font-medium">No admins assigned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {nodeAdmins.map((admin) => (
                        <div key={admin.id}
                          className="flex items-center justify-between p-4 bg-white/70 border border-slate-100 rounded-2xl">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{admin.email}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Added {new Date(admin.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            {admin.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
