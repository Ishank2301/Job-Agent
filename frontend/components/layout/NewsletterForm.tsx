"use client";

import { useState } from "react";
import { Check, Loader2, Mail } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setState("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };

      if (res.ok) {
        setState("success");
        setMessage("You’re on the list — see you in the next issue.");
      } else {
        setState("error");
        setMessage(data.message ?? "Something went wrong. Try again.");
      }
    } catch {
      setState("error");
      setMessage("Network error — check your connection and retry.");
    }
  }

  if (state === "success") {
    return (
      <p
        className="flex items-center gap-2 rounded-lg border border-accent-line bg-accent-soft px-3 py-2.5 text-sm text-accent"
        role="status"
      >
        <Check className="h-4 w-4 shrink-0" /> {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full" noValidate>
      <div className={compact ? "flex flex-col gap-2" : "flex gap-2"}>
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder="you@example.com"
          className="input-dark min-w-0 flex-1"
          aria-invalid={state === "error"}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="btn btn-glow justify-center whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Subscribe
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {message}
        </p>
      )}
      {state === "idle" && (
        <p className="mt-2 text-[11px] text-faint">
          One email a month: product updates, job-search playbooks. No spam,
          unsubscribe anytime.
        </p>
      )}
    </form>
  );
}
