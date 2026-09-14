import type { Metadata } from "next";
import Link from "next/link";

import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Job·Agent collects, uses and protects your data — OAuth account basics, self-hosted storage, cookies, third-party processors and your rights.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "September 9, 2026";

const SECTIONS: { id: string; heading: string; body: React.ReactNode }[] = [
  {
    id: "overview",
    heading: "1. Overview",
    body: (
      <>
        <p>
          Job·Agent is career-automation software that you can run as a hosted
          service or <strong>self-host entirely</strong>. This policy explains
          what data the software processes, where it lives, and the choices you
          have. The short version: <strong>we collect as little as
          possible, and the heavyweight data — resumes, applications, contact
          history — stays in a database you control.</strong>
        </p>
      </>
    ),
  },
  {
    id: "collect",
    heading: "2. Data we collect",
    body: (
      <>
        <ul>
          <li>
            <strong>Account basics via OAuth:</strong> when you sign in with
            Google or GitHub we receive your name, email address and profile
            avatar. We never see or store your provider password.
          </li>
          <li>
            <strong>Workspace content:</strong> the jobs you save, resumes you
            upload or tailor, applications you track, recruiter contacts you
            find, and email drafts you approve.
          </li>
          <li>
            <strong>Newsletter:</strong> if you subscribe, we store your email
            address for product updates. Unsubscribe with one click, any time.
          </li>
          <li>
            <strong>Operational logs:</strong> your self-hosted instance writes
            logs locally (email sends, state transitions) for auditability.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "storage",
    heading: "3. Where your data lives",
    body: (
      <>
        <p>
          In a self-hosted deployment, <strong>all workspace content is stored
          in your own PostgreSQL database</strong> on infrastructure you
          operate. Credentials and API keys live in environment variables on
          your machine. The hosted service stores the same categories of data
          on our infrastructure, encrypted in transit and at rest.
        </p>
      </>
    ),
  },
  {
    id: "use",
    heading: "4. How data is used",
    body: (
      <>
        <ul>
          <li>Authenticating you and maintaining your session.</li>
          <li>
            Running the agent: discovery, ATS scoring, resume tailoring and
            draft generation — only at your instruction.
          </li>
          <li>
            Enforcing safety limits (daily outreach caps, duplicate blocking)
            and keeping an audit trail of approved actions.
          </li>
          <li>
            Sending the newsletter, if and only if you opted in.
          </li>
        </ul>
        <p>We do not sell personal data. Ever. There is no ad model here.</p>
      </>
    ),
  },
  {
    id: "sharing",
    heading: "5. Third-party processors",
    body: (
      <>
        <p>
          Depending on features you enable, limited data flows to these
          independent services:
        </p>
        <ul>
          <li>
            <strong>OAuth providers (Google, GitHub):</strong> authentication
            handshakes. They process the login under their own privacy
            policies.
          </li>
          <li>
            <strong>LLM providers (optional):</strong> resume tailoring and
            drafting may send <em>resume text and job descriptions</em> to the
            configured provider (OpenAI, Anthropic, Gemini, or a local Ollama
            instance). If you point the system at a local Ollama host, that
            content never leaves your machine.
          </li>
          <li>
            <strong>Job boards:</strong> discovery queries public listings via
            scraping connectors. Your profile data is not shared with them.
          </li>
          <li>
            <strong>Email transport:</strong> approved outreach is sent via the
            SMTP/Gmail account <em>you</em> configure — it originates from you.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "6. Cookies & tracking",
    body: (
      <>
        <p>
          We use exactly one category of cookie: the{" "}
          <strong>authentication session cookie</strong> required to keep you
          signed in. There are no advertising cookies, no cross-site trackers
          and no third-party analytics scripts. Default deployments ship with
          telemetry disabled.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    heading: "7. Retention & deletion",
    body: (
      <>
        <p>
          Self-hosted: you own the database — delete rows or drop tables at
          any time; uninstalling removes everything. Hosted: deleting your
          workspace removes resumes, applications, drafts and logs. Newsletter
          addresses are removed immediately on unsubscribe. OAuth tokens are
          revoked on sign-out where the provider supports it.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    heading: "8. Your rights",
    body: (
      <>
        <p>
          You can access, export, correct or delete your data at any time from
          Settings, or by emailing{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>. We honor
          access and deletion requests regardless of jurisdiction, because it
          is your data.
        </p>
      </>
    ),
  },
  {
    id: "security",
    heading: "9. Security",
    body: (
      <>
        <p>
          Transport traffic should always run over TLS in production (see the
          deployment guide for mandatory HTTPS setup). Sessions are encrypted
          server-side, outbound actions are rate-limited, and the automation
          is architecturally incapable of submitting forms or sending email
          without a recorded human approval. Report vulnerabilities to{" "}
          <a href={`mailto:${site.securityEmail}`}>{site.securityEmail}</a>.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "10. Changes to this policy",
    body: (
      <>
        <p>
          Material changes will be announced on the blog and, for hosted
          users, by email. The “last updated” date above always reflects the
          current version.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="shell max-w-4xl py-10">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-muted">Last updated: {LAST_UPDATED}</p>

      <nav className="card-grad mt-8 p-5" aria-label="Table of contents">
        <p className="eyebrow">On this page</p>
        <ul className="mt-3 grid gap-1.5 text-sm text-muted sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="transition hover:text-accent">
                {s.heading}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="prose-site mt-10">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id}>
            <h2>{s.heading}</h2>
            {s.body}
          </section>
        ))}

        <hr />

        <p>
          Questions about any of this?{" "}
          <Link href="/contact">Contact us</Link> — a human reads every
          message.
        </p>
      </div>
    </div>
  );
}
