"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ICONS } from "@/constants";
import { api } from "@/lib/api-client";

/**
 * Zuppdate events asking to use this organisation's gate.
 *
 * An organiser can nominate a venue from Zuppdate, but issuing passes into
 * somebody else's door needs that venue's consent — so each request lands here
 * for the venue's own admin to approve or decline. Until then the event cannot
 * issue a single pass.
 */

interface EventRequest {
  securityId: string;
  eventId: string;
  approval: "PENDING" | "APPROVED" | "DECLINED" | "NOT_REQUIRED";
  requestedAt: string | null;
  decidedAt: string | null;
  declineReason: string | null;
  securityLevel: number;
  maxPasses: number | null;
  isEnabled: boolean;
  nodeId: string | null;
  nodeName: string | null;
  eventName: string;
  eventSlug: string;
  eventType: string;
  eventStart: string;
  eventEnd: string | null;
  eventLocation: string | null;
  eventStatus: string;
}

const FILTERS = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Declined", value: "DECLINED" },
  { label: "All", value: "all" },
] as const;

export default function EventRequestsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("PENDING");
  const [rows, setRows] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  const load = async (status: string) => {
    try {
      setLoading(true);
      setError("");
      if (!localStorage.getItem("zuppgate_token")) {
        router.push("/login");
        return;
      }
      setRows(await api.get<EventRequest[]>(`/api/event-requests?status=${status}`));
    } catch (e) {
      console.error("Failed to load event requests:", e);
      setError("Could not load event requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const decide = async (eventId: string, decision: "APPROVED" | "DECLINED") => {
    let reason: string | null = null;
    if (decision === "DECLINED") {
      reason = window.prompt("Why are you declining? (the organiser sees this)") ?? null;
      if (reason === null) return; // cancelled
    }
    try {
      setActing(eventId);
      await api.patch("/api/event-requests", { eventId, decision, reason });
      await load(filter);
    } catch (e: any) {
      alert(e?.message || "Could not save that decision");
    } finally {
      setActing(null);
    }
  };

  const pendingCount = rows.filter((r) => r.approval === "PENDING").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <header className="bg-white/40 backdrop-blur-lg border border-white p-8 rounded-[2rem] shadow-xl shadow-purple-500/5">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-800 tracking-tight">
          Event Requests
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Zuppdate events asking to use your gate. Nothing is issued until you approve.
        </p>
      </header>

      <div className="bg-white/60 backdrop-blur-xl p-2 rounded-3xl shadow-xl shadow-indigo-100/20 border border-white inline-flex flex-wrap gap-2">
        {FILTERS.map(({ label, value }) => {
          const selected = filter === value;
          const lit = value === "PENDING" && pendingCount > 0;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative ${
                selected ? (lit ? "text-amber-700" : "text-indigo-700") : lit ? "text-amber-600" : "text-slate-500 hover:text-indigo-600 hover:bg-white/50"
              }`}
            >
              {selected && (
                <motion.div
                  layoutId="eventRequestTab"
                  className={`absolute inset-0 rounded-2xl bg-white shadow-sm border ${lit ? "border-amber-200/70" : "border-indigo-100/50"}`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {lit && !selected && (
                <span className="absolute inset-0 rounded-2xl bg-amber-50/80 border border-amber-200/60" />
              )}
              <span className="relative z-10 inline-flex items-center gap-2">
                {label}
                {value === "PENDING" && pendingCount > 0 && (
                  <span className="rounded-lg bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-700 tabular-nums">
                    {pendingCount}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-rose-50/80 backdrop-blur-md border border-rose-200 rounded-3xl p-5 flex items-center gap-3">
          <ICONS.Failure className="text-rose-600" size={24} />
          <p className="text-rose-700 font-bold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/40 backdrop-blur-md rounded-[2rem] h-56 animate-pulse border border-white/50" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-xl border border-white rounded-[3rem] shadow-xl shadow-indigo-100/20">
          <div className="w-24 h-24 bg-gradient-to-tr from-purple-100 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ICONS.Calendar className="text-indigo-400 w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-indigo-950 mb-2">Nothing here</h3>
          <p className="text-slate-500 font-medium">
            {filter === "PENDING" ? "No events are waiting on you." : "No requests match that filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {rows.map((r) => (
              <motion.div
                layout
                key={r.securityId}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl shadow-indigo-500/5 border border-white relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${
                    r.approval === "APPROVED" ? "bg-emerald-400" : r.approval === "DECLINED" ? "bg-rose-400" : "bg-amber-400"
                  }`}
                />

                <div className="flex justify-between items-start gap-3 mb-5">
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-slate-900 truncate">{r.eventName}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      {r.eventType}
                      {r.eventLocation ? ` · ${r.eventLocation}` : ""}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 shrink-0">
                    L{r.securityLevel}
                  </span>
                </div>

                <div className="space-y-3 text-xs font-semibold text-slate-600">
                  <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your venue</p>
                    <p className="text-sm font-bold text-slate-800">{r.nodeName ?? "—"}</p>
                  </div>
                  <p>
                    {new Date(r.eventStart).toLocaleString()}
                    {r.eventEnd ? ` → ${new Date(r.eventEnd).toLocaleString()}` : ""}
                  </p>
                  <p className="text-slate-500">
                    {r.maxPasses != null ? `Up to ${r.maxPasses} passes` : "No pass limit set"}
                    {r.isEnabled ? "" : " · organiser has it turned off"}
                  </p>
                  {r.approval === "DECLINED" && r.declineReason && (
                    <p className="text-rose-600">Declined: {r.declineReason}</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`${process.env.NEXT_PUBLIC_ZUPPDATE_URL ?? ""}/e/${r.eventSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                  >
                    <ICONS.Link size={13} /> View event
                  </a>

                  {r.approval === "PENDING" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => decide(r.eventId, "DECLINED")}
                        disabled={acting === r.eventId}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => decide(r.eventId, "APPROVED")}
                        disabled={acting === r.eventId}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                        r.approval === "APPROVED" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${r.approval === "APPROVED" ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {r.approval}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
