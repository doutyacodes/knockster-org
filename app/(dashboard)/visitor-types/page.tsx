"use client";

import React, { useState, useEffect } from "react";
import { ICONS } from "@/constants";
import { api } from "@/lib/api-client";

interface VisitorType {
  id: string;
  name: string;
  defaultSecurityLevel: number;
}

const VisitorTypesPage = () => {
  const [types, setTypes] = useState<VisitorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<VisitorType | null>(null);
  const [name, setName] = useState("");
  const [defaultSecurityLevel, setDefaultSecurityLevel] = useState(1);

  useEffect(() => {
    fetchTypes();
  }, []);

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
    setIsModalOpen(true);
  };

  const handleOpenEdit = (type: VisitorType) => {
    setEditingType(type);
    setName(type.name);
    setDefaultSecurityLevel(type.defaultSecurityLevel);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingType) {
        await api.put("/api/visitor-types", { id: editingType.id, defaultSecurityLevel });
        setSuccess("Visitor type updated successfully");
      } else {
        await api.post("/api/visitor-types", { name, defaultSecurityLevel });
        setSuccess("Visitor type created successfully");
      }
      setIsModalOpen(false);
      fetchTypes();
    } catch (err: any) {
      setError(err.message || "Failed to save visitor type");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Visitor Types</h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure visitor categories and their default security levels.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200"
        >
          <ICONS.Plus size={20} />
          <span>New Visitor Type</span>
        </button>
      </header>

      {success && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-semibold border border-emerald-100 flex items-center gap-2">
          <ICONS.Success size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-semibold border border-rose-100 flex items-center gap-2">
          <ICONS.Failure size={16} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Default Security Level</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {types.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    No visitor types configured yet.
                  </td>
                </tr>
              ) : (
                types.map((type) => (
                  <tr key={type.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {type.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
                        Level {type.defaultSecurityLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(type)}
                        className="text-slate-400 hover:text-blue-600 font-medium transition-colors"
                      >
                        Edit Default Level
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                {editingType ? "Edit Visitor Type" : "New Visitor Type"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ICONS.Close size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingType}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:opacity-50"
                  placeholder="e.g. VIP, Maintenance"
                />
                {editingType && (
                  <p className="text-xs text-slate-400 px-1">Name cannot be changed after creation.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                  Default Security Level
                </label>
                <select
                  value={defaultSecurityLevel}
                  onChange={(e) => setDefaultSecurityLevel(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value={1}>L1 - QR Code Only</option>
                  <option value={2}>L2 - QR + OTP</option>
                  <option value={3}>L3 - App Scanning</option>
                  <option value={4}>L4 - Multi-Factor Auth</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  {editingType ? "Update Type" : "Create Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorTypesPage;
