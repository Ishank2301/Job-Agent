"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

type State = "idle" | "opening";

/**
 * Composes a prefilled email in the visitor's own mail client — no backend
 * form-spam surface, and the visitor keeps a copy of the thread.
 */
export function ContactForm({ email }: { email: string }) {
  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [topic, setTopic] = useState("General question");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("idle");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[Job·Agent] ${topic} — ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${fromEmail}\nTopic: ${topic}\n\n${message}`,
    );
    setState("opening");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setTimeout(() => setState("idle"), 1500);
  }

  return (
    <form onSubmit={onSubmit} className="card-grad p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-1.5 block text-xs text-muted">
            Your name
          </label>
          <input
            id="cf-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className="input-dark"
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1.5 block text-xs text-muted">
            Your email
          </label>
          <input
            id="cf-email"
            type="email"
            required
            autoComplete="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-dark"
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="cf-topic" className="mb-1.5 block text-xs text-muted">
          Topic
        </label>
        <select
          id="cf-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input-dark appearance-none"
        >
          <option>General question</option>
          <option>Product feedback</option>
          <option>Bug report</option>
          <option>Self-hosting help</option>
          <option>Partnership / press</option>
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="cf-message" className="mb-1.5 block text-xs text-muted">
          Message
        </label>
        <textarea
          id="cf-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you need — the more detail, the faster the answer."
          className="input-dark resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={state === "opening"}
        className="btn btn-glow mt-6 disabled:opacity-60"
      >
        {state === "opening" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {state === "opening" ? "Opening your mail app…" : "Send Message"}
      </button>
      <p className="mt-3 text-[11px] text-faint">
        This opens your own email client with everything prefilled — nothing is
        submitted through the web.
      </p>
    </form>
  );
}
