"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

const LINKS: { label: string; href: string }[] = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how" },
  { label: "Templates", href: "/#templates" },
  { label: "Pricing", href: "/plans" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export function PillNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 no-print">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 rounded-full border border-line bg-surface/90 py-2 pl-4 pr-2 shadow-[var(--shadow-card)] backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-accent-ink">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink">
            Job·Agent
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Marketing"
        >
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={`rounded-full px-3 py-1.5 text-[13px] transition ${
                pathname === l.href
                  ? "bg-surface-2 text-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-1.5 text-[13px] text-muted transition hover:text-ink sm:block"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="btn btn-primary rounded-full text-[13px]"
          >
            Start free
          </Link>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="mx-auto mt-2 max-w-4xl rounded-2xl border border-line bg-surface p-3 shadow-[var(--shadow-pop)] md:hidden"
          aria-label="Mobile"
        >
          <ul className="grid gap-1">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
