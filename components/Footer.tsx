import React from "react";
import Link from "next/link";
import Image from "next/image";

const appLinks = [
  { name: "Invitations", path: "/invitations" },
  { name: "Personnel", path: "/personnel" },
  { name: "Visitor Types", path: "/visitor-types" },
  { name: "Alerts", path: "/alerts" },
  { name: "About", path: "/about" },
  { name: "Profile", path: "/profile" },
];

const publicLinks = [
  { name: "About", path: "/about" },
  { name: "Login", path: "/login" },
  { name: "Sign Up", path: "/signup" },
];

const Footer: React.FC<{ variant?: "app" | "public" }> = ({ variant = "app" }) => {
  const links = variant === "public" ? publicLinks : appLinks;
  return (
    <footer className="relative z-10 w-full bg-black border-t border-white/10">
      <div className="w-full px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="space-y-3">
            <Image src="/logo.png" alt="Zuppgate - Never trust. Always verify" width={5250} height={2100} className="h-16 w-auto -ml-2" />
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-3">
            {links.map((l) => (
              <Link key={l.path} href={l.path} className="text-sm font-semibold text-slate-300 hover:text-[#FFE500] transition-colors">
                {l.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-xs font-medium text-slate-400">
          <p>
            © {new Date().getFullYear()} Zuppgate by{" "}
            <a href="https://www.byroice.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFE500] transition-colors">ByRoice</a>
            . All rights reserved.
          </p>
          <p className="font-bold uppercase tracking-widest text-[#FFE500]/80">Never trust. Always verify.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
