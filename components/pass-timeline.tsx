"use client";

import React from "react";
import { motion } from "framer-motion";
import { ICONS } from "@/constants";

/**
 * The life of a pass as a vertical timeline, laid out the way Zuppdate's public
 * event page (`app/e/[slug]`) lays out its schedule: a fixed-width time column
 * on the left, a rail of dots down the middle, and the step itself on the
 * right, with past steps dimmed, the current one emphasised, and future ones
 * faded back.
 *
 * Only the layout and the three visual states are borrowed. None of Zuppdate's
 * per-event-type theming comes with it; this uses Zuppgate's own slate/indigo
 * palette so it sits in the dashboard without looking transplanted.
 *
 * Like that page, whether a step has happened is derived from its timestamp
 * against the current time rather than baked in server-side, so the timeline
 * advances while the page is open. `at` is an ISO instant for exactly that
 * comparison; `atLabel` is the IST string shown to the reader.
 */

export type { TimelineStep } from "@/lib/pass-timeline";
import type { TimelineStep } from "@/lib/pass-timeline";

type Tone = "neutral" | "good" | "bad" | "warn";

const STEP_STYLE: Record<TimelineStep["kind"], { tone: Tone; icon: keyof typeof ICONS }> = {
  CREATED: { tone: "neutral", icon: "Add" },
  WINDOW_OPEN: { tone: "neutral", icon: "Clock" },
  QR_ISSUED: { tone: "neutral", icon: "Key" },
  OTP_ISSUED: { tone: "neutral", icon: "Key" },
  OTP_VERIFIED: { tone: "good", icon: "Success" },
  SCAN_GRANTED: { tone: "good", icon: "Success" },
  SCAN_DENIED: { tone: "bad", icon: "Failure" },
  REVOKED: { tone: "bad", icon: "Close" },
  WINDOW_CLOSED: { tone: "neutral", icon: "Clock" },
};

const TONE_DOT: Record<Tone, string> = {
  neutral: "bg-indigo-500",
  good: "bg-emerald-500",
  bad: "bg-rose-500",
  warn: "bg-amber-500",
};

const TONE_CHIP: Record<Tone, string> = {
  neutral: "bg-indigo-50 text-indigo-600",
  good: "bg-emerald-100 text-emerald-700",
  bad: "bg-rose-100 text-rose-700",
  warn: "bg-amber-100 text-amber-700",
};

/** "14:02" and "08 Nov" from the IST label, falling back to the raw instant. */
function splitLabel(step: TimelineStep): { time: string; date: string } {
  const label = step.atLabel;
  if (label && label.includes(" ")) {
    const [datePart, timePart] = label.split(" ");
    const [y, m, d] = datePart.split("-").map(Number);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const hhmm = (timePart ?? "").slice(0, 5);
    if (y && m && d && hhmm) {
      return { time: hhmm, date: `${String(d).padStart(2, "0")} ${months[m - 1]}` };
    }
  }
  const dt = new Date(step.at);
  return {
    time: Number.isNaN(dt.getTime()) ? "--:--" : dt.toISOString().slice(11, 16),
    date: Number.isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10),
  };
}

export function PassTimeline({ timeline }: { timeline: TimelineStep[] }) {
  // Re-render every 30s so steps cross from upcoming to done on their own,
  // the same reason Zuppdate's schedule keeps its own ticking clock.
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  if (!timeline || timeline.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <ICONS.Logs className="h-8 w-8 text-slate-300" />
        </div>
        <p className="font-medium text-slate-500">Nothing recorded yet</p>
        <p className="mt-1 text-xs text-slate-400">Steps appear here as the pass is issued and used</p>
      </div>
    );
  }

  // The last step already in the past is "where things stand".
  const pastIndexes = timeline
    .map((s, i) => ({ i, t: new Date(s.at).getTime() }))
    .filter(({ t }) => !Number.isNaN(t) && t <= now)
    .map(({ i }) => i);
  const currentIndex = pastIndexes.length > 0 ? pastIndexes[pastIndexes.length - 1] : -1;

  return (
    <div className="relative">
      {timeline.map((stepItem, i) => {
        const style = STEP_STYLE[stepItem.kind] ?? { tone: "neutral" as Tone, icon: "Info" as const };
        const at = new Date(stepItem.at).getTime();
        const isFuture = !Number.isNaN(at) && at > now;
        const isCurrent = i === currentIndex;
        const isPast = !isFuture && !isCurrent;
        const { time, date } = splitLabel(stepItem);
        const Icon = ICONS[style.icon] ?? ICONS.Info;
        const isLast = i === timeline.length - 1;

        return (
          <motion.div
            key={`${stepItem.kind}-${stepItem.at}-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.4) }}
            className={
              // Same three-state treatment as Zuppdate's activity rows: done is
              // dimmed and desaturated, upcoming is faded, current is full strength.
              isPast
                ? "opacity-60 grayscale-[40%] transition-opacity hover:opacity-90"
                : isFuture
                  ? "opacity-[0.55] transition-opacity hover:opacity-80"
                  : ""
            }
          >
            <div className={`flex gap-3 sm:gap-4 ${isLast ? "" : "pb-1"}`}>
              {/* Time column */}
              <div className="w-14 shrink-0 pt-0.5 text-right sm:w-20">
                <p
                  className={`text-sm font-bold tabular-nums ${
                    isCurrent ? "text-indigo-700" : "text-slate-800"
                  }`}
                >
                  {time}
                </p>
                <p className="text-[10px] font-semibold tabular-nums text-slate-400">{date}</p>
              </div>

              {/* Rail */}
              <div className="relative flex w-5 shrink-0 flex-col items-center">
                <span
                  className={`relative mt-1.5 flex h-2.5 w-2.5 shrink-0 rounded-full ${
                    isFuture ? "bg-slate-300" : TONE_DOT[style.tone]
                  }`}
                >
                  {isCurrent && (
                    <span
                      className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                        TONE_DOT[style.tone]
                      }`}
                    />
                  )}
                </span>
                {!isLast && <span className="mt-1 w-px flex-1 bg-slate-200" />}
              </div>

              {/* Step */}
              <div className={`min-w-0 flex-1 ${isLast ? "pb-1" : "pb-6"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-sm ${
                      isCurrent ? "font-black text-slate-900" : "font-bold text-slate-800"
                    }`}
                  >
                    {stepItem.title}
                  </p>
                  {typeof stepItem.securityLevel === "number" && (
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
                      L{stepItem.securityLevel}
                    </span>
                  )}
                  {isFuture && (
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Scheduled
                    </span>
                  )}
                  {isCurrent && (
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${TONE_CHIP[style.tone]}`}>
                      Latest
                    </span>
                  )}
                </div>

                {(stepItem.detail || stepItem.guard) && (
                  <p
                    className={`mt-0.5 text-xs font-medium ${
                      style.tone === "bad" ? "text-rose-600" : "text-slate-500"
                    }`}
                  >
                    {stepItem.detail}
                    {stepItem.detail && stepItem.guard ? " · " : ""}
                    {stepItem.guard ? `guard ${stepItem.guard}` : ""}
                  </p>
                )}
              </div>

              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  isFuture ? "bg-slate-100 text-slate-400" : TONE_CHIP[style.tone]
                }`}
              >
                <Icon size={15} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
