"use client";

import { ReactNode, useState } from "react";

export function SectionHeader({
  eyebrow,
  title,
  desc,
  children,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  children?: ReactNode;
}) {
  return (
    <div className="fade-up flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
          {title}
        </h1>
        {desc && <p className="mt-2 max-w-2xl text-sm text-zinc-500">{desc}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "zinc",
  delay = "",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "zinc" | "emerald" | "sky" | "violet" | "amber" | "red";
  delay?: string;
}) {
  const tones: Record<string, string> = {
    zinc: "text-zinc-100",
    emerald: "text-emerald-300",
    sky: "text-sky-300",
    violet: "text-violet-300",
    amber: "text-amber-300",
    red: "text-red-300",
  };

  return (
    <div className={`card card-hover p-5 fade-up ${delay}`}>
      <p className="eyebrow">{label}</p>
      <p className={`mt-3 font-mono text-3xl ${tones[tone]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

export function Chip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`chip ${className}`}>{children}</span>;
}

export function Bar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`bar ${className}`}>
      <div style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function AtsDial({ score }: { score: number | null }) {
  const v = score ?? 0;
  return (
    <div className="dial" style={{ ["--v" as never]: v } as React.CSSProperties}>
      <div>{score == null ? "—" : Math.round(score)}</div>
    </div>
  );
}

export function EmptyState({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 border-dashed p-12 text-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-zinc-600">
        <path d="M4 13a8 8 0 0 1 16 0" strokeLinecap="round" />
        <path d="M4 13v3a2 2 0 0 0 2 2h2v-5H4zM20 13v3a2 2 0 0 1-2 2h-2v-5h4z" strokeLinejoin="round" />
      </svg>
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      <p className="max-w-sm text-xs leading-relaxed text-zinc-500">{desc}</p>
      {children}
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);

  return (
    <button
      className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-[10px] text-zinc-400 transition hover:border-white/25 hover:text-white"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1200);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {ok ? "COPIED" : "COPY"}
    </button>
  );
}