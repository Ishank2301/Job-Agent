import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Gauge, ShieldCheck, Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { Ambient3D } from "@/components/three/Ambient3D";
import { Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

/** Treat placeholder values as "not configured" too. */
function isConfigured(...values: (string | undefined)[]): boolean {
  return values.every(
    (v) => Boolean(v) && !v!.startsWith("paste-your-"),
  );
}

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: "Nothing sends without you",
    desc: "Every email and form fill stops at an approval gate you control.",
  },
  {
    icon: Sparkles,
    title: "Resumes tailored, never fabricated",
    desc: "The agent rephrases and reorders your real experience — it can’t invent skills.",
  },
  {
    icon: Gauge,
    title: "Live ATS scoring",
    desc: "See how every role matches before you spend a single application.",
  },
];

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  const providers = {
    google: isConfigured(
      process.env.AUTH_GOOGLE_ID,
      process.env.AUTH_GOOGLE_SECRET,
    ),
    github: isConfigured(
      process.env.AUTH_GITHUB_ID,
      process.env.AUTH_GITHUB_SECRET,
    ),
  };

  return (
    <div className="relative">
      <Ambient3D />

      <div className="shell grid min-h-[calc(100vh-12rem)] items-center gap-12 py-8 lg:grid-cols-2">
        {/* Brand panel */}
        <section className="hidden lg:block">
          <p className="eyebrow">Human-in-the-loop by design</p>
          <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-tight tracking-tight text-ink">
            One click, and your whole job search runs{" "}
            <span className="grad-text">on rails</span>.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Sign in to unlock the console: live job discovery, per-role resume
            tailoring, recruiter outreach drafts and an application pipeline
            that never loses a thread.
          </p>

          <ul className="mt-8 space-y-5">
            {VALUE_PROPS.map((p) => (
              <li key={p.title} className="flex gap-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent-line bg-accent-soft text-accent">
                  <p.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{p.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {p.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <figure className="mt-10 max-w-md rounded-xl border border-line bg-surface-2 p-5">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
              ))}
            </div>
            <blockquote className="mt-3 text-sm leading-relaxed text-ink-soft">
              “It feels like a copilot, not a rogue bot. I love that nothing
              sends without my approval.”
            </blockquote>
            <figcaption className="mt-3 text-xs text-muted">
              P. Iyer — Data Scientist @ healthcare AI
            </figcaption>
          </figure>
        </section>

        {/* Auth card */}
        <section className="flex justify-center">
          <AuthCard providers={providers} />
        </section>
      </div>

      {/* Mobile-only compact value line */}
      <div className="shell pb-10 lg:hidden">
        <p className="text-center text-sm text-muted">
          <Link href="/about" className="underline underline-offset-2 hover:text-ink-soft">
            Why human-in-the-loop?
          </Link>{" "}
          Nothing sends without your approval — DRY_RUN is always the default.
        </p>
      </div>
    </div>
  );
}
