"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Briefcase,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Radar,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useBackendStatus } from "@/lib/useBackendStatus";

const RAIL = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Radar },
  { href: "/applications", label: "Applications", icon: KanbanSquare },
  { href: "/resume-studio", label: "Resume Studio", icon: FileText },
  { href: "/resume-builder", label: "Resume Builder", icon: Briefcase },
  { href: "/recruiters", label: "Recruiters", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { status, dryRun } = useBackendStatus();
  const [open, setOpen] = useState(false);

  const title =
    RAIL.find((r) => pathname.startsWith(r.href))?.label ??
    (pathname.startsWith("/onboarding") ? "Welcome" : "Console");

  const userInitial = (session?.user?.name ?? session?.user?.email ?? "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col items-center border-r border-line bg-surface py-4 md:flex no-print">
        <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-ink">
          <Sparkles className="h-4 w-4" />
        </Link>

        <nav className="mt-6 flex flex-1 flex-col items-center gap-1" aria-label="Console">
          {RAIL.map((r) => {
            const active = pathname.startsWith(r.href);
            return (
              <Link
                key={r.href}
                href={r.href}
                title={r.label}
                className={`group relative grid h-10 w-10 place-items-center rounded-xl transition ${
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-ink"
                }`}
              >
                <r.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink shadow-[var(--shadow-card)] group-hover:block">
                  {r.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-2">
          <ThemeToggle />
          <span
            className="grid h-8 w-8 place-items-center rounded-full border border-accent-line bg-accent-soft font-mono text-xs text-accent"
            title={session?.user?.email ?? undefined}
          >
            {userInitial}
          </span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-16">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-glass px-4 backdrop-blur-md no-print">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted md:hidden"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <span className="text-sm font-semibold text-ink">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/plans" className="btn btn-accent rounded-full text-xs">
              Upgrade
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hidden items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted transition hover:border-danger hover:text-danger sm:flex"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </header>

        {/* Mobile drawer */}
        {open && (
          <nav
            className="border-b border-line bg-surface p-3 md:hidden no-print"
            aria-label="Mobile console"
          >
            <ul className="grid gap-1">
              {RAIL.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                      pathname.startsWith(r.href)
                        ? "bg-accent-soft text-accent"
                        : "text-muted hover:bg-surface-2 hover:text-ink"
                    }`}
                  >
                    <r.icon className="h-4 w-4" /> {r.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/plans"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-ink"
                >
                  <Sparkles className="h-4 w-4" /> Plans & Upgrade
                </Link>
              </li>
            </ul>
          </nav>
        )}

        <main id="main" className="flex- px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
