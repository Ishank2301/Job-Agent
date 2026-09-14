"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";

import { GitHubButton, GoogleButton } from "@/components/auth/AuthButtons";

export interface ProviderConfig {
  google: boolean;
  github: boolean;
}

export function AuthCard({ providers }: { providers: ProviderConfig }) {
  const noneConfigured = !providers.google && !providers.github;

  return (
    <div className="card-grad w-full max-w-md p-8">
      <p className="eyebrow text-center">Welcome back</p>
      <h1 className="mt-2 text-center text-2xl font-semibold text-ink">
        Sign in to Job·Agent
      </h1>
      <p className="mt-2 text-center text-sm text-muted">
        Passwordless, one click, no forms. Use the account you already trust.
      </p>

      {noneConfigured && (
        <div
          className="mt-6 rounded-lg border border-line-strong bg-surface-2 p-4 text-xs leading-relaxed text-gold"
          role="note"
        >
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" /> OAuth isn’t configured yet
          </p>
          <p className="mt-2 text-gold/80">
            Add <code className="font-mono">AUTH_GOOGLE_ID</code> /{" "}
            <code className="font-mono">AUTH_GITHUB_ID</code> (and their
            secrets) to <code className="font-mono">frontend/.env.local</code>,
            then restart the dev server. Full walkthrough:{" "}
            <code className="font-mono">docs/AUTHENTICATION.md</code>.
          </p>
        </div>
      )}

      <div className="mt-8 space-y-3">
        <GoogleButton disabled={!providers.google} />
        {!providers.google && (
          <p className="text-center text-[11px] text-faint">
            Google sign-in needs OAuth credentials in .env.local
          </p>
        )}
        <GitHubButton disabled={!providers.github} />
        {!providers.github && (
          <p className="text-center text-[11px] text-faint">
            GitHub sign-in needs OAuth credentials in .env.local
          </p>
        )}
      </div>

      <p className="mt-6 flex items-start justify-center gap-1.5 text-center text-[11px] leading-relaxed text-faint">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        <span>
          We only receive your name, email and avatar. Passwords never touch
          our servers. DRY_RUN is on by default — nothing is sent anywhere
          without your approval.
        </span>
      </p>

      <p className="mt-4 text-center text-[11px] text-faint">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-muted">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-muted">
          Privacy Policy
        </Link>
        .
      </p>

      <div className="mt-6 border-t border-line pt-4 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-ink-soft"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
      </div>
    </div>
  );
}
