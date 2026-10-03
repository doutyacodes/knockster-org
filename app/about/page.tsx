"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  role: string;
  organizationName: string;
  organizationType: string;
  organizationNodeId: string;
  canManageHierarchy: boolean;
  maxSubNodes: number;
  imageUrl?: string;
}

const SECTIONS = [
  {
    title: "Four-Tier Access Control",
    body: [
      "At the centre of Zuppgate is a four-tier access control architecture, designed to accommodate different security and operational requirements. Physical access is not identical across every organisation: a routine office visit and a visit to a more restricted environment may require different levels of verification and oversight. Our four tiers allow organisations to choose the process appropriate to their requirements, bringing flexibility to how access is authorised and checked.",
      "The purpose is to make verification proportionate and practical, with a clear procedure for the people implementing it. Hosts and administrators define the conditions of access, visitors understand the steps they must complete, and security teams follow the checks required by the selected tier. This creates a consistent framework for managing access while allowing organisations to apply the level of control their setting demands.",
    ],
  },
  {
    title: "Zero Trust Across the Visit",
    body: [
      "Our Zero Trust approach extends across the visit. An invitation records the host’s permission, but entry remains subject to the invitation’s validity, its conditions and the verification required by the chosen tier. Once the visitor enters, the same visit continues through a connected record, with visibility into entry time, visit status and authorised time remaining. Exit follows the procedure associated with the selected tier, completing the record of the visitor’s time on the premises.",
      "By connecting these stages, Zuppgate helps teams answer practical questions: Is this visit authorised? Have the required checks been completed? Has the visitor entered? How much authorised time remains? Has the visitor exited? This continuity gives organisations a clearer basis for managing physical access from arrival to departure.",
    ],
  },
  {
    title: "Built for Every Environment",
    body: [
      "Zuppgate is designed to support physical access management across a wide range of environments—from apartments, residential communities and private homes to offices, schools, factories and large campuses. Its four-tier architecture accommodates progressively stricter access requirements, including those of VIP residences and offices, sensitive technology facilities and defence establishments. Organisations can select the level of verification and oversight appropriate to their premises, bringing everyday access and more demanding security workflows into the same platform.",
    ],
  },
];

export default function AboutPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  // Show the full dashboard nav when signed in, the public nav otherwise
  useEffect(() => {
    if (localStorage.getItem("zuppgate_auth") !== "true") return;
    setLoggedIn(true);
    api.get<User>("/api/auth/me").then(setUser).catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("zuppgate_auth");
    localStorage.removeItem("zuppgate_token");
    localStorage.removeItem("zuppgate_user");
    setUser(null);
    setLoggedIn(false);
    router.push("/login");
  };

  const variant = loggedIn ? "app" : "public";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] selection:bg-[#FFE500] selection:text-black">
      <Navbar user={user} onLogout={handleLogout} variant={variant} />

      <main className="flex-1 w-full pt-28 sm:pt-32 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Hero */}
          <section className="space-y-6">
            <span className="inline-block text-xs font-black uppercase tracking-widest bg-black text-[#FFE500] px-3 py-1.5 rounded-full">
              About Zuppgate
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">
              Never Trust.{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Always Verify.</span>
                <span className="absolute left-0 right-0 bottom-1 h-3 sm:h-4 bg-[#FFE500]" />
              </span>
            </h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Zuppgate is a physical access management platform by ByRoice, built to help organisations control who enters their premises, under what conditions and for how long. Our tagline, “Never Trust. Always Verify.”, reflects the principle behind the platform: physical access should depend on valid authorisation and the required verification, rather than assumptions or possession of an invitation alone.
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              We connect access permissions, digital invitations, verification, entry and exit through one coordinated workflow. This gives hosts, visitors, administrators and security teams a shared understanding of each visit, while making responsibilities clear at every stage. Whether someone is arriving for a meeting, an institutional visit or another authorised purpose, Zuppgate helps the organisation manage that access through a defined process.
            </p>
          </section>

          {/* Sections */}
          {SECTIONS.map((section, i) => (
            <section
              key={section.title}
              className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xl shadow-black/5 p-6 sm:p-10"
            >
              <div className="flex items-center gap-4 mb-5">
                <span className="w-11 h-11 shrink-0 rounded-2xl bg-black text-[#FFE500] font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{section.title}</h2>
              </div>
              <div className="space-y-4 text-base text-slate-600 leading-relaxed">
                {section.body.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer variant={variant} />
    </div>
  );
}
