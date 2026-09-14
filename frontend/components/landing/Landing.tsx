"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  FileText,
  Gauge,
  LogIn,
  Mail,
  Radar,
  ShieldCheck,
  SquareKanban,
  Star,
} from "lucide-react";

import { Ambient3D } from "@/components/three/Ambient3D";
import { useBackendStatus } from "@/lib/useBackendStatus";

/* ---------------- Hero helpers ---------------- */

function Counter({ to }: { to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setN((p) => (p >= to ? to : p + Math.ceil(to / 90))),
      30,
    );
    return () => clearInterval(t);
  }, [to]);
  return <span className="font-mono">{n.toLocaleString()}+</span>;
}

function AtsPreviewCard() {
  const [score, setScore] = useState(64);
  useEffect(() => {
    const t = setInterval(() => setScore((s) => (s >= 94 ? 94 : s + 1)), 70);
    return () => clearInterval(t);
  }, []);

  const tags = ["langchain", "pytorch", "rag pipelines", "fastapi", "mlflow"].slice(
    0,
    Math.max(0, Math.floor((score - 64) / 6)),
  );

  return (
    <div className="relative z-10 w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-black/10 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-soft">
          Live Tailoring
        </p>
        <span className="rounded-full border border-accent-line bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
          AI Active
        </span>
      </div>

      <div className="mt-5 space-y-2.5">
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-surface-2" />
        <div className="h-2 w-full rounded-full bg-surface-2" />
        <div className="h-2 w-5/6 rounded-full bg-surface-2" />
        <div className="h-2 w-2/3 rounded-full bg-surface-2" />
      </div>

      <div className="mt-5 flex min-h-[28px] flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-accent-line bg-accent-soft px-2.5 py-0.5 font-mono text-[11px] text-accent"
          >
            + {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="dial" style={{ "--v": score } as React.CSSProperties}>
          <div>{score}</div>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">ATS Match</p>
          <p className="mt-1 text-xs text-muted">64% → 94% while you watch</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  const { status } = useBackendStatus();

  return (
    <section className="relative z-10 shell grid items-center gap-12 pb-20 pt-16 lg:grid-cols-2">
      <div>
        <div className="chip">
          <span className={`pulse-dot ${status === "online" ? "" : "off"}`} />
          {status === "online"
            ? "AGENT RUNNING"
            : "LOCAL MODE — START BACKEND TO GO LIVE"}
        </div>

        <h1 className="display mt-6 text-5xl font-semibold leading-[1.08] tracking-tight text-ink md:text-6xl">
          The AI agent that{" "}
          <span className="text-accent-grad">
            discovers, tailors and applies
          </span>{" "}
          to jobs for you.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Stop manual applications. Clear ATS filters, tailor a resume per
          role, and automate outreach — with full human approval control
          before anything is sent.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="btn btn-glow">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/dashboard" className="btn btn-ghost">
            Open Live Console
          </Link>
        </div>

        <p className="mt-4 text-xs text-muted">
          No credit card · Self-hostable · DRY_RUN by default
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted">
          <span>
            <Counter to={210000} /> applications automated
          </span>
          <span className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-gold text-gold" />
            ))}
            4.8/5 early-user rating
          </span>
        </div>
      </div>

      <div className="relative z-10 flex justify-center lg:justify-end">
        <AtsPreviewCard />
      </div>
    </section>
  );
}

/* ---------------- Trust strip ---------------- */

const SOURCES = ["LinkedIn", "Indeed", "Glassdoor", "Greenhouse", "Lever"];

function TrustStrip() {
  return (
    <section className="shell pb-16" aria-label="Supported job sources">
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em] text-faint">
        Aggregates roles from
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
        {SOURCES.map((s) => (
          <span
            key={s}
            className="text-sm font-medium text-faint transition hover:text-muted"
          >
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Bento features ---------------- */

const FEATURES = [
  {
    icon: FileText,
    title: "AI Resume Tailoring",
    desc: "Live keyword matching against any JD. Rephrases and reorders — never invents a single fact.",
    tag: "AI-Powered",
    span: "md:col-span-2",
  },
  {
    icon: Radar,
    title: "Automated Job Discovery",
    desc: "Aggregates LinkedIn, Indeed, Glassdoor, Greenhouse and Lever into one deduplicated feed.",
    tag: "Field Tested",
    span: "",
  },
  {
    icon: ShieldCheck,
    title: "Human-in-the-Loop",
    desc: "Dry-run kill switch and approval gates before every email or form interaction.",
    tag: "Safety First",
    span: "",
  },
  {
    icon: Gauge,
    title: "Real-time ATS Meter",
    desc: "Weighted scoring targets the 75–85% band — high enough to pass, low enough to stay human.",
    tag: "AI-Powered",
    span: "",
  },
  {
    icon: Mail,
    title: "Instant Outreach",
    desc: "Tone-matched referral emails drafted in seconds from your resume and the JD.",
    tag: "10s Drafts",
    span: "",
  },
  {
    icon: SquareKanban,
    title: "Application Kanban",
    desc: "Saved → Applied → Assessment → Interview → Offer. A strict state machine with zero lost threads.",
    tag: "Field Tested",
    span: "md:col-span-2",
  },
];

function Features() {
  return (
    <section id="features" className="shell py-20">
      <p className="eyebrow">Capabilities</p>
      <h2 className="display mt-3 max-w-xl text-3xl font-semibold tracking-tight text-ink">
        Everything between{" "}
        <span className="text-accent-grad">
          “job posted” and “offer signed”
        </span>
        .
      </h2>

      <div className="mt-10 grid gap-3 md:grid-cols-3">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={`card-grad card-hover p-6 fade-up d${(i % 6) + 1} ${f.span}`}
          >
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-accent-line bg-accent-soft text-accent">
                <f.icon className="h-4 w-4" />
              </span>
              <span className="chip">{f.tag}</span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */

const STEPS = [
  {
    icon: LogIn,
    step: "01",
    title: "Connect",
    desc: "Sign in with Google or GitHub. Your workspace, resume vault and pipeline are provisioned instantly — no forms, no passwords to manage.",
  },
  {
    icon: Radar,
    step: "02",
    title: "Discover & tailor",
    desc: "The agent scrapes fresh roles, dedupes them, scores each JD against your resume, and rewrites bullets to match — without inventing a single fact.",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Review & approve",
    desc: "Every outreach email and form fill waits for your explicit click. Nothing leaves the system until you say so — and one toggle shuts it all off.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="shell py-20">
      <p className="eyebrow">How it works</p>
      <h2 className="display mt-3 max-w-xl text-3xl font-semibold tracking-tight text-ink">
        From sign-in to sent outreach in{" "}
        <span className="grad-text">three supervised steps</span>.
      </h2>

      <ol className="mt-10 grid gap-3 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li
            key={s.step}
            className={`card-grad card-hover relative p-6 fade-up d${i + 1}`}
          >
            <span className="absolute right-5 top-5 font-mono text-xs text-faint">
              {s.step}
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-accent-line bg-accent-soft text-accent">
              <s.icon className="h-4 w-4" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- Templates ---------------- */

const CATS = ["All", "Tech", "Finance", "Executive", "Creative", "ATS-Classic"];

const TEMPLATES = [
  { name: "Neon Stack", cat: "Tech", accent: "#8b5cf6" },
  { name: "Kernel", cat: "Tech", accent: "#22d3ee" },
  { name: "Ledger", cat: "Finance", accent: "#38bdf8" },
  { name: "Boardroom", cat: "Executive", accent: "#fbbf24" },
  { name: "Prism", cat: "Creative", accent: "#f472b6" },
  { name: "Screener", cat: "ATS-Classic", accent: "#34d399" },
];

function Templates() {
  const [cat, setCat] = useState("All");
  const shown = TEMPLATES.filter((t) => cat === "All" || t.cat === cat);

  return (
    <section id="templates" className="shell py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Template Studio</p>
          <h2 className="display mt-3 text-3xl font-semibold tracking-tight text-ink">
            Designs that pass screeners and impress humans.
          </h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs transition ${
                cat === c ? "bg-surface-2 text-ink" : "text-muted hover:text-ink-soft"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((t, i) => (
          <div
            key={t.name}
            className={`card-grad card-hover group relative overflow-hidden p-5 fade-up d${(i % 5) + 1}`}
          >
            <div className="rounded-lg border border-line bg-surface-2 p-4">
              <div className="h-2.5 w-1/2 rounded" style={{ background: t.accent }} />
              <div className="mt-3 space-y-1.5">
                <div className="h-1.5 w-full rounded bg-surface-2" />
                <div className="h-1.5 w-5/6 rounded bg-surface-2" />
                <div className="h-1.5 w-2/3 rounded bg-surface-2" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <div className="h-8 rounded bg-surface-2" />
                <div className="h-8 rounded bg-surface-2" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">{t.name}</p>
                <p className="text-xs text-muted">{t.cat}</p>
              </div>
            </div>

            <div className="absolute inset-0 grid place-items-center bg-bg/90 opacity-0 backdrop-blur-[2px] transition group-hover:opacity-100">
              <Link href="/resume-studio" className="btn btn-glow">
                Use This Template
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Reviews ---------------- */

const REVIEWS = [
  {
    quote:
      "The agent shortlisted 40 roles overnight and my tailored resume cleared every ATS I tested. Landed an ML internship in 3 weeks.",
    name: "A. Sharma",
    role: "ML Engineer @ fintech startup",
  },
  {
    quote: "I love that nothing sends without my approval. It feels like a copilot, not a rogue bot.",
    name: "P. Iyer",
    role: "Data Scientist @ healthcare AI",
  },
  {
    quote: "The kanban plus ATS meter replaced three separate tools for me. The safety defaults are the real product.",
    name: "R. Mehta",
    role: "SDE-1 @ SaaS platform",
  },
];

function Reviews() {
  return (
    <section id="reviews" className="shell py-20">
      <p className="eyebrow">Early Users</p>
      <h2 className="display mt-3 text-3xl font-semibold tracking-tight text-ink">
        Trusted by people who hate applying manually.
      </h2>

      <div className="mt-10 grid gap-3 md:grid-cols-3">
        {REVIEWS.map((r, i) => (
          <div key={r.name} className={`card-grad p-6 fade-up d${i + 1}`}>
            <div className="flex gap-1">
              {[...Array(5)].map((_, s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-gold text-gold" />
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">“{r.quote}”</p>
            <p className="mt-4 text-sm font-medium text-ink">{r.name}</p>
            <p className="text-xs text-muted">{r.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

const FAQS = [
  {
    q: "Will the agent apply or send emails without my permission?",
    a: "No. Every email halts at CONFIRMATION_REQUIRED and autofill never clicks a final submit button. DRY_RUN is on by default, so nothing leaves the system until you explicitly approve it.",
  },
  {
    q: "Does the AI invent skills or experience on my resume?",
    a: "Never. Personal data, template, education and your skill whitelist are frozen server-side. The LLM may only reorder and rephrase existing content; hallucinated skills are stripped before storage.",
  },
  {
    q: "Is my data private?",
    a: "Everything lives in your own PostgreSQL database and local environment variables. No third-party resume databases, no data resale, no telemetry by default. See the Privacy Policy for details.",
  },
  {
    q: "Which job boards are supported?",
    a: "Discovery runs on LinkedIn, Indeed and Glassdoor via jobspy. The autofill engine supports Greenhouse and Lever forms, always in headed, human-reviewed mode.",
  },
  {
    q: "What stops it from spamming recruiters?",
    a: "A hard daily outreach cap (default 10), duplicate-application blocking at the database level, and per-email human approval.",
  },
  {
    q: "Can I turn it all off instantly?",
    a: "Yes — one toggle in Settings re-enables DRY_RUN and every outbound action becomes a simulated, logged no-op.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faqs" className="shell max-w-4xl py-20">
      <p className="eyebrow text-center">Questions</p>
      <h2 className="display mt-3 text-center text-3xl font-semibold tracking-tight text-ink">
        Everything people ask before trusting an agent.
      </h2>

      <div className="mt-10 space-y-2">
        {FAQS.map((f, i) => (
          <div key={f.q} className="card-grad overflow-hidden">
            <button
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-sm font-medium text-ink-soft"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              {f.q}
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted transition-transform ${
                  open === i ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ${
                open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-muted">{f.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- CTA band ---------------- */

function CtaBand() {
  return (
    <section className="shell pb-24">
      <div className="card-grad hero-glow relative overflow-hidden p-10 text-center md:p-14">
        <p className="eyebrow">Ready when you are</p>
        <h2 className="display mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Your next role is already posted. Start shortlisting in minutes.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
          Free to start, self-hostable, and every outbound action sits behind a
          hard human-approval gate. Sign in and watch your first tailored
          resume score itself.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/login" className="btn btn-glow">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Talk to Us
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Page ---------------- */

export function Landing() {
  return (
    <div className="relative">
      <Ambient3D />
      <div className="grid-bg hero-glow">
        <Hero />
      </div>
      <TrustStrip />
      <Features />
      <HowItWorks />
      <Templates />
      <Reviews />
      <Faq />
      <CtaBand />
    </div>
  );
}
