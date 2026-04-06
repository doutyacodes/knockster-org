"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Search,
  Building2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api-client";

interface SubNode {
  id: string;
  name: string;
  type: string;
  status: string;
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

export default function HierarchyPage() {
  const [subNodes, setSubNodes] = useState<SubNode[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "classroom",
  });

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedNodeForAdmins, setSelectedNodeForAdmins] = useState<SubNode | null>(null);
  const [nodeAdmins, setNodeAdmins] = useState<SubNodeAdmin[]>([]);
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usr, nodes] = await Promise.all([
        api.get<User>("/api/auth/me"),
        api.get<SubNode[]>("/api/organizations/sub-nodes")
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
      setSuccess("Sub-node created successfully!");
      setIsModalOpen(false);
      setForm({ name: "", type: "classroom" });
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create node");
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

  const filteredNodes = subNodes.filter(node => 
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const remainingQuota = user ? user.maxSubNodes - subNodes.length : 0;
  const isQuotaFull = remainingQuota <= 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (user && !user.canManageHierarchy) {
      return (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-800">Access Denied</h2>
              <p className="text-red-600">You do not have permission to manage the organizational hierarchy.</p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campus Hierarchy</h1>
          <p className="text-slate-500">Manage classrooms, buildings, and specialized units for {user?.organizationName}.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isQuotaFull}
          className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200
            ${isQuotaFull ? 'bg-slate-200 text-slate-500 shadow-none cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}
          `}
        >
          <Plus className="w-5 h-5" />
          <span>Add Sub-Node</span>
        </button>
      </header>

      {/* Quota Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Layers className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sub-nodes</p>
                  <p className="text-2xl font-bold text-slate-800">{subNodes.length}</p>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isQuotaFull ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                  <CheckCircle className={`${isQuotaFull ? 'text-rose-600' : 'text-emerald-600'} w-6 h-6`} />
              </div>
              <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Quota</p>
                  <p className={`text-2xl font-bold ${isQuotaFull ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {remainingQuota} units
                  </p>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Building2 className="text-indigo-600 w-6 h-6" />
              </div>
              <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parent Organization</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{user?.organizationName}</p>
              </div>
          </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Unit Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredNodes.length > 0 ? (
                filteredNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="font-semibold text-slate-800">{node.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-slate-600">{node.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
                        {node.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 text-right">
                        <button 
                          onClick={() => {
                            setSelectedNodeForAdmins(node);
                            fetchNodeAdmins(node.id);
                            setIsAdminModalOpen(true);
                          }}
                          className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                        >
                          Manage Admins
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No sub-nodes found. {isQuotaFull ? "You have reached your quota limit." : "Click 'Add Sub-Node' to create your first unit."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Add New Unit</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45 text-slate-400" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleCreate}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Unit Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., Grade 10-A, Physics Lab"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Unit Type</label>
                <select
                  required
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="school">School</option>
                  <option value="classroom">Classroom</option>
                  <option value="lab">Laboratory</option>
                  <option value="block">Block</option>
                  <option value="building">Building</option>
                  <option value="gate">Security Gate</option>
                  <option value="custom">Custom Unit</option>
                </select>
              </div>
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Unit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Management Modal */}
      {isAdminModalOpen && selectedNodeForAdmins && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Manage Admins</h3>
                <p className="text-xs text-slate-500">For {selectedNodeForAdmins.name}</p>
              </div>
              <button 
                onClick={() => setIsAdminModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45 text-slate-400" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1 space-y-8">
              {/* Add Admin Form */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Add New Admin</h4>
                <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleCreateAdmin}>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="teacher@school.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-md shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Create Admin User"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Admins List */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3">Existing Admins</h4>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <tr>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {nodeAdmins.length > 0 ? (
                        nodeAdmins.map((admin) => (
                          <tr key={admin.id}>
                            <td className="px-4 py-3 font-semibold text-slate-700">{admin.email}</td>
                            <td className="px-4 py-3">
                              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                {admin.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              {new Date(admin.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                            No admins assigned to this unit yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
