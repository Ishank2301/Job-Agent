"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Minus, Sparkles } from "lucide-react";

const TIERS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    tagline: "Get your search on rails",
    highlight: false,
    cta: "Start free",
    features: [
      "1 master resume",
      "3 AI tailor runs / month",
      "ATS scoring & meter",
      "20 job discoveries / run",
      "Application Kanban",
      "4 resume templates",
      "DRY_RUN safety model",
    ],
  },
  {
    name: "Pro",
    price: "₹799",
    period: "per month",
    tagline: "For an active, focused search",
    highlight: true,
    cta: "Go Pro",
    features: [
      "Everything in Free",
      "5 master resumes",
      "60 AI tailor runs / month",
      "Full board aggregation",
      "30 outreach drafts / month",
      "All 12+ premium templates",
      "AI resume editor",
      "Priority email support",
    ],
  },
  {
    name: "Max",
    price: "₹2,999",
    period: "per month",
    tagline: "Maximum throughput",
    highlight: false,
    cta: "Go Max",
    features: [
      "Everything in Pro",
      "Unlimited master resumes",
      "Unlimited AI tailor runs",
      "Multi-agent pipelines",
      "100 outreach drafts / month*",
      "Interview prep assistant",
      "Dedicated scrape slots",
      "1:1 onboarding & API access",
    ],
  },
];

const COMPARISON: {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  max: string | boolean;
}[] = [
  { label: "Master resumes", free: "1", pro: "5", max: "Unlimited" },
  { label: "AI tailor runs / month", free: "3", pro: "60", max: "Unlimited" },
  { label: "Job discoveries / run", free: "20", pro: "Unlimited", max: "Unlimited" },
  { label: "Outreach drafts / month", free: "5", pro: "30", max: "100*" },
  { label: "Resume templates", free: "4", pro: "All 12+", max: "All 12+" },
  { label: "AI resume editor", free: false, pro: true, max: true },
  { label: "Job boards aggregated", free: "3", pro: "5", max: "5 + custom" },
  { label: "Interview prep assistant", free: false, pro: false, max: true },
  { label: "API access", free: false, pro: false, max: true },
  { label: "Human-approval safety gates", free: true, pro: true, max: true },
  { label: "Self-host for free", free: true, pro: true, max: true },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true)
    return (
      <Check
        className="mx-auto h-4 w-4 text-accent"
        aria-label="Included"
      />
    );
  if (v === false)
    return <Minus className="mx-auto h-4 w-4 text-faint" aria-label="Not included" />;
  return <span className="text-sm text-ink-soft">{v}</span>;
}

export function PlansGrid() {
  const [plan, setPlan] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => {
      setPlan(localStorage.getItem("ja_plan") ?? "");
    }, 0);
    return () => clearTimeout(t);
  }, []);

  function choose(name: string) {
    localStorage.setItem("ja_plan", name);
    setPlan(name);
  }

  return (
    <>
      {/* Tier cards */}
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {TIERS.map((t, i) => {
          const active = plan === t.name;
          return (
            <div
              key={t.name}
              className={`card card-hover relative flex flex-col p-7 fade-up d${i + 1} ${
                t.highlight ? "ring-2 ring-accent" : ""
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-ink">
                  Most popular
                </span>
              )}

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">{t.name}</h2>
                {active && (
                  <span className="chip border-accent-line bg-accent-soft text-accent">
                    CURRENT
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">{t.tagline}</p>

              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="display text-4xl font-semibold text-ink">
                  {t.price}
                </span>
                <span className="text-xs text-faint">{t.period}</span>
              </p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-ink-soft"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => choose(t.name)}
                className={`mt-7 w-full justify-center ${
                  t.highlight ? "btn btn-accent" : "btn btn-ghost"
                }`}
              >
                {active ? "Selected ✓" : t.cta}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[11px] text-faint">
        * Outreach is always bounded by your safety settings — the agent never
        exceeds your daily cap or sends without approval. Plan selection is
        stored locally; billing integration coming soon.
      </p>

      {/* Comparison table */}
      <section className="mt-16">
        <h2 className="display text-2xl font-semibold tracking-tight text-ink">
          Compare every feature
        </h2>
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="px-5 py-4 text-xs font-medium text-muted">Feature</th>
                <th className="px-5 py-4 text-center text-xs font-medium text-muted">
                  Free
                </th>
                <th className="px-5 py-4 text-center text-xs font-medium text-accent">
                  Pro
                </th>
                <th className="px-5 py-4 text-center text-xs font-medium text-muted">
                  Max
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.label} className="border-b border-line last:border-0">
                  <td className="px-5 py-3.5 text-sm text-ink-soft">{row.label}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Cell v={row.free} />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Cell v={row.pro} />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Cell v={row.max} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ-lite */}
      <section className="mx-auto mt-16 max-w-2xl text-center">
        <Sparkles className="mx-auto h-5 w-5 text-accent" />
        <h3 className="display mt-4 text-xl font-semibold text-ink">
          Is the free plan actually usable?
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Yes — and self-hosting the entire stack is free forever, on every
          plan. Paid tiers buy volume and convenience, not safety: the
          human-approval gates are identical everywhere.{" "}
          <Link href="/docs" className="text-accent underline underline-offset-2">
            Read the docs
          </Link>
        </p>
      </section>
    </>
  );
}
