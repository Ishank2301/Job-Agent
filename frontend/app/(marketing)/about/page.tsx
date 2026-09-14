import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Eye,
  HeartHandshake,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why we built Job·Agent: a safety-first career automation platform where a human approves every outbound action. Our mission, principles and story.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Humans hold the keys",
    desc: "Automation should never surprise you. Every email, every form fill, every outbound action stops at an approval gate. DRY_RUN is the factory default, not an afterthought.",
  },
  {
    icon: Lock,
    title: "Your data stays yours",
    desc: "Self-hosted means self-owned. Your resumes, applications and contacts live in your PostgreSQL instance — no third-party resume databases, no resale, no hidden telemetry.",
  },
  {
    icon: Eye,
    title: "No fabrication, ever",
    desc: "The AI may rephrase and reorder your real experience. It may never invent a skill, a degree or a job. Hallucinated content is stripped before it ever reaches storage.",
  },
  {
    icon: HeartHandshake,
    title: "Respect on both sides",
    desc: "Recruiters are people too. Hard daily outreach caps, duplicate blocking and tone-matched drafts keep the agent helpful instead of spammy.",
  },
];

const STATS = [
  { value: "5+", label: "Job boards aggregated" },
  { value: "10/day", label: "Hard outreach cap" },
  { value: "0", label: "Auto-submits. Ever." },
  { value: "100%", label: "Self-hostable" },
];

const AUDIENCE = [
  {
    title: "Active job seekers",
    desc: "Apply to 5× more roles in the same hours — with a pipeline that remembers every thread.",
  },
  {
    title: "Career switchers",
    desc: "Reposition your real experience for each target role without pretending to be someone you’re not.",
  },
  {
    title: "Privacy-conscious builders",
    desc: "Run the whole stack on your own infrastructure. Audit every line before you let it act.",
  },
];

export default function AboutPage() {
  return (
    <div className="shell max-w-5xl">
      {/* Hero */}
      <section className="py-12 text-center">
        <p className="eyebrow">About us</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          We’re building the copilot for your career search —{" "}
          <span className="grad-text">with you holding the keys</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Job·Agent started with a simple frustration: applying to jobs is a
          full-time job. Copying resumes into forms, rewriting the same
          cover letter, chasing recruiter emails — hours of work that a
          machine could do, if only you could trust it.
        </p>
      </section>

      {/* Mission */}
      <section className="card-grad p-8 md:p-10">
        <p className="eyebrow">Our mission</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
          Automate the busywork. Never automate the judgment.
        </h2>
        <div className="prose-site mt-4 max-w-3xl">
          <p>
            Discovery, deduplication, keyword matching, drafting — machines are
            better at all of it. But deciding <em>who</em> to contact,{" "}
            <em>what</em> to say about your career, and <em>when</em> to hit
            send: that stays human. Every feature we ship is judged against one
            question — does this give the user more control, or less?
          </p>
          <p>
            That’s why the product is built around a strict state machine: an
            email can’t reach <code>SENT</code> without passing through{" "}
            <code>CONFIRMATION_REQUIRED</code>. It’s why the autofill worker
            runs headed and never clicks final submit. And it’s why
            DRY_RUN is the first thing you see in the header of every page.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16">
        <p className="eyebrow">Principles</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          What we optimize for.
        </h2>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="card-grad card-hover p-6">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-accent-line bg-accent-soft text-accent">
                <p.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats band */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="card-grad p-6 text-center">
            <p className="font-mono text-2xl font-semibold text-accent">
              {s.value}
            </p>
            <p className="mt-2 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Story */}
      <section className="py-16">
        <p className="eyebrow">The story</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          Born from a prototype, rebuilt for trust.
        </h2>
        <div className="prose-site mt-5 max-w-3xl">
          <p>
            The first version of Job·Agent was a weekend prototype: a scraper,
            a prompt, and a Gmail draft folder. It worked — and that was
            exactly the problem. An agent that <em>can</em> act also{" "}
            <em>will</em> act, unless the architecture makes carelessness
            impossible.
          </p>
          <p>
            So we rebuilt it as a full-stack system: FastAPI and PostgreSQL at
            the core, a strict application state machine, human-in-the-loop
            approval for every outbound action, and a provider-agnostic LLM
            layer you can point at a local Ollama instance so your resume text
            never leaves your machine.
          </p>
          <p>
            The result is automation you can leave running overnight — because
            the worst thing it can do without you is nothing.
          </p>
        </div>
      </section>

      {/* Audience */}
      <section className="pb-16">
        <p className="eyebrow">Who it’s for</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          Built for people who apply seriously.
        </h2>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {AUDIENCE.map((a) => (
            <div key={a.title} className="card-grad p-6">
              <Sparkles className="h-4 w-4 text-accent" />
              <h3 className="mt-3 text-base font-semibold text-ink">
                {a.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="card-grad hero-glow p-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Come work with us — well, have us work for you.
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="btn btn-glow">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Contact the Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
