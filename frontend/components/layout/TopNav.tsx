"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBackendStatus } from "@/lib/useBackendStatus";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/applications", label: "Applications" },
  { href: "/resume-studio", label: "Resume Studio" },
  { href: "/recruiters", label: "Recruiters" },
  { href: "/settings", label: "Settings" },
  { href: "/docs", label: "Docs" },
];

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" stroke="#34d399" strokeWidth="1.4" />
      <circle cx="12" cy="11" r="2.4" fill="#34d399" />
    </svg>
  );
}

export function TopNav({ dryRun }: { dryRun: boolean }) {
  const pathname = usePathname();
  const status = useBackendStatus();

  if (pathname === "/") return null;

  const label =
    status === "online" ? "ONLINE" : status === "retrying" ? "RECONNECTING…" : status === "checking" ? "CHECKING…" : "OFFLINE";

  return (
    <header className="glass fixed inset-x-0 top-0 z-50 border-b border-white/5">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="font-mono text-sm tracking-[0.28em] text-zinc-100">JOB·AGENT</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                    active ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="chip">
            <span className={`pulse-dot ${status === "online" ? "" : "off"}`} />
            {label}
          </span>
          <span
            className={`chip ${
              dryRun
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/20 bg-amber-500/10 text-amber-300"
            }`}
          >
            {dryRun ? "DRY RUN" : "LIVE MODE"}
          </span>
        </div>
      </div>
    </header>
  );
}