"use client";
import React, { useState, useEffect } from "react";
import { ICONS, SECURITY_INFO } from "@/constants";
import { InvitationStatus, SecurityLevel } from "@/types";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Invitation {
  id: string;
  guestName: string;
  guestPhone: string;
  employeeName: string;
  employeePhone: string;
  validFrom: string;
  validTo: string;
  securityLevel: string;
  status: InvitationStatus;
  createdAt: string;
}

const Invitations: React.FC = () => {
  const [filter, setFilter] = useState<InvitationStatus | "All">("All");
  const [showModal, setShowModal] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [visitorTypes, setVisitorTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    employeeName: "",
    employeePhone: "",
    guestName: "",
    guestPhone: "",
    validFrom: "",
    validTo: "",
    securityLevel: "L1",
    visitorTypeId: "",
  });

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("knockster_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/invitations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch invitations");
      }

      setInvitations(data.data);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      setError("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorTypes = async () => {
    try {
      const token = localStorage.getItem("knockster_token");
      const response = await fetch("/api/visitor-types", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setVisitorTypes(data.data);
      }
    } catch (error) {
      console.error("Error fetching visitor types:", error);
    }
  };

  useEffect(() => {
    fetchInvitations();
    fetchVisitorTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.employeeName ||
      !formData.employeePhone ||
      !formData.guestName ||
      !formData.guestPhone ||
      !formData.validFrom ||
      !formData.validTo ||
      !formData.visitorTypeId
    ) {
      setError("All fields are required");
      return;
    }

    setCreating(true);

    try {
      const token = localStorage.getItem("knockster_token");

      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create invitation");
      }

      setFormData({
        employeeName: "",
        employeePhone: "",
        guestName: "",
        guestPhone: "",
        validFrom: "",
        validTo: "",
        securityLevel: "L1",
        visitorTypeId: "",
      });
      setShowModal(false);

      await fetchInvitations();
    } catch (error: any) {
      console.error("Error creating invitation:", error);
      setError(error.message || "Failed to create invitation");
    } finally {
      setCreating(false);
    }
  };

  const filteredInvitations = invitations.filter(
    (i) => filter === "All" || i.status === filter
  );

  const handleCopyGuestUrl = (e: React.MouseEvent, invitationId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/guest/${invitationId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => alert("Guest QR page URL copied to clipboard!"))
      .catch(() => alert("Failed to copy URL"));
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
            Guest Invitations
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Manage visitor access, security levels, and QR passes instantly.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-200 font-bold shrink-0 hover:scale-[1.02]"
        >
          <ICONS.Add size={20} />
          Create New Pass
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white/60 backdrop-blur-xl p-2 rounded-3xl shadow-xl shadow-indigo-100/20 border border-white inline-flex flex-wrap md:flex-nowrap gap-2">
        {[
          { label: "All Passes", value: "All" },
          { label: "Active", value: InvitationStatus.ACTIVE },
          { label: "Upcoming", value: InvitationStatus.UPCOMING },
          { label: "Expired", value: InvitationStatus.EXPIRED },
          { label: "Revoked", value: InvitationStatus.REVOKED },
        ].map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setFilter(value as any)}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative ${
              filter === value
                ? "text-indigo-700"
                : "text-slate-500 hover:text-indigo-600 hover:bg-white/50"
            }`}
          >
            {filter === value && (
              <motion.div
                layoutId="filterTab"
                className="absolute inset-0 bg-white rounded-2xl shadow-sm border border-indigo-100/50"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-50/80 backdrop-blur-md border border-rose-200 rounded-3xl p-5 flex items-center gap-3 shadow-lg shadow-rose-100/50">
          <ICONS.Failure className="text-rose-600" size={24} />
          <p className="text-rose-700 font-bold">{error}</p>
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white/40 backdrop-blur-md rounded-[2rem] h-64 animate-pulse border border-white/50 shadow-sm" />
          ))}
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredInvitations.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full py-20 text-center bg-white/40 backdrop-blur-xl border border-white rounded-[3rem] shadow-xl shadow-indigo-100/20"
              >
                <div className="w-24 h-24 bg-gradient-to-tr from-purple-100 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <ICONS.Calendar className="text-indigo-400 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-indigo-950 mb-2">No passes found</h3>
                <p className="text-slate-500 font-medium">Create your first invitation to get started</p>
              </motion.div>
            ) : (
              filteredInvitations.map((invite) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  key={invite.id}
                  onClick={() => router.push(`/invitations/${invite.id}`)}
                  className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl shadow-indigo-500/5 border border-white cursor-pointer group flex flex-col relative overflow-hidden"
                >
                  {/* Status Indicator */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    invite.status === InvitationStatus.ACTIVE ? "bg-emerald-400" :
                    invite.status === InvitationStatus.UPCOMING ? "bg-blue-400" :
                    invite.status === InvitationStatus.REVOKED ? "bg-rose-400" : "bg-slate-300"
                  }`} />

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {invite.guestName}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1 bg-slate-100 inline-block px-2 py-1 rounded-md">
                        {invite.guestPhone}
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      SECURITY_INFO[invite.securityLevel as SecurityLevel]?.color || "bg-slate-100 text-slate-600"
                    }`}>
                      {invite.securityLevel}
                    </span>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Host</p>
                      <p className="text-sm font-bold text-slate-800">{invite.employeeName}</p>
                      <p className="text-xs text-slate-500">{invite.employeePhone}</p>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600 text-xs font-semibold">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                        <ICONS.Calendar size={14} />
                      </div>
                      <div>
                        <p>{new Date(invite.validFrom).toLocaleString()}</p>
                        <p className="text-slate-400 mt-0.5">to {new Date(invite.validTo).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                      invite.status === InvitationStatus.ACTIVE ? "bg-emerald-50 text-emerald-600" :
                      invite.status === InvitationStatus.UPCOMING ? "bg-blue-50 text-blue-600" :
                      invite.status === InvitationStatus.REVOKED ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        invite.status === InvitationStatus.ACTIVE ? "bg-emerald-500" :
                        invite.status === InvitationStatus.UPCOMING ? "bg-blue-500" :
                        invite.status === InvitationStatus.REVOKED ? "bg-rose-500" : "bg-slate-400"
                      }`} />
                      {invite.status}
                    </span>

                    <button
                      onClick={(e) => handleCopyGuestUrl(e, invite.id)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors bg-white shadow-sm border border-indigo-100"
                      title="Copy QR Link"
                    >
                      <ICONS.Link size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white/90 backdrop-blur-2xl w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Create Pass</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">New Invitation</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 rounded-full flex items-center justify-center transition-all"
                >
                  <ICONS.Close size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-2">
                    <ICONS.Failure className="text-rose-600" size={16} />
                    <p className="text-rose-600 text-sm font-bold">{error}</p>
                  </div>
                )}

                {/* Employee Detail */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">1</div>
                    <p className="text-sm font-bold text-slate-700">Host Details</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Host Name"
                      value={formData.employeeName}
                      onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                    />
                    <input
                      type="tel"
                      placeholder="Host Phone"
                      value={formData.employeePhone}
                      onChange={(e) => setFormData({ ...formData, employeePhone: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Guest Detail */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">2</div>
                    <p className="text-sm font-bold text-slate-700">Guest Details</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Guest Name"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                    />
                    <input
                      type="tel"
                      placeholder="Guest Phone"
                      value={formData.guestPhone}
                      onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Access Control */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">3</div>
                    <p className="text-sm font-bold text-slate-700">Access Control</p>
                  </div>
                  <select
                    value={formData.visitorTypeId}
                    onChange={(e) => {
                      const vt = visitorTypes.find(v => v.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        visitorTypeId: e.target.value,
                        securityLevel: vt ? `L${vt.defaultSecurityLevel}` : formData.securityLevel
                      });
                    }}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                  >
                    <option value="" disabled>Select Visitor Type</option>
                    {visitorTypes.map(vt => (
                      <option key={vt.id} value={vt.id}>{vt.name}</option>
                    ))}
                  </select>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Valid From</label>
                      <input
                        type="datetime-local"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Valid Until</label>
                      <input
                        type="datetime-local"
                        value={formData.validTo}
                        onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    {Object.entries(SECURITY_INFO).map(([key, value]) => (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setFormData({ ...formData, securityLevel: key as SecurityLevel })}
                        className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center gap-1.5 ${
                          formData.securityLevel === key ? "border-purple-500 bg-purple-50 ring-4 ring-purple-500/10" : "border-slate-200 hover:border-purple-300"
                        }`}
                      >
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${value.color}`}>{key}</span>
                        <span className="text-[9px] text-slate-500 font-bold leading-tight">{value.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                  className="flex-1 px-4 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={creating}
                  className="flex-1 px-4 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-white hover:opacity-90 shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Invite"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Invitations;