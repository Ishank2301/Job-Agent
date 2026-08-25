import { Chip, SectionHeader } from "@/components/ui/kit";
import Link from "next/link";
const SECTIONS = [
  {
    title: "Operating Model",
    body: "The agent runs a five-stage pipeline: Discover → Score → Tailor → Reach → Confirm. Every stage writes to Postgres, so the dashboard is always a live view of reality, not a cache.",
  },
  {
    title: "Safety Contract",
    body: "DRY_RUN defaults to true. Emails require explicit approval. Autofill halts at CONFIRMATION_REQUIRED and never clicks submit. Duplicate applications are blocked by unique constraints at the database level.",
  },
  {
    title: "Resume Guardrails",
    body: "The LLM may reorder and rephrase only. Personal data, template, education and the skill whitelist are frozen server-side after every generation — hallucinated skills are stripped before storage.",
  },
  {
    title: "ATS Scoring",
    body: "Keywords in Summary and Skills weigh 3×; experience bullets weigh 1×. The strategic target is 75–85%: high enough to pass screeners, low enough to avoid stuffing penalties.",
  },
  {
    title: "State Machine",
    body: "Applications move SAVED → APPLIED → ASSESSMENT → INTERVIEW → OFFER, with REJECTABLE at any active stage. The backend rejects invalid transitions with HTTP 409.",
  },
];

const ENDPOINTS = [
  ["GET", "/api/v1/jobs", "List indexed jobs"],
  ["POST", "/api/v1/jobs/scrape", "Queue a scrape run"],
  ["POST", "/api/v1/applications", "Save a job as application"],
  ["PATCH", "/api/v1/applications/{id}/status", "Move through state machine"],
  ["POST", "/api/v1/applications/{id}/run-agent", "Run recruiter + resume + email pipeline"],
  ["GET", "/api/v1/resumes/master", "Master resume schema"],
  ["POST", "/api/v1/resumes/tailor", "Create guarded tailored version"],
  ["POST", "/api/v1/recruiters/find", "Discover recruiter contact"],
  ["POST", "/api/v1/emails/draft", "Draft outreach email"],
  ["POST", "/api/v1/emails/{id}/approve", "Human approval gate"],
  ["POST", "/api/v1/emails/{id}/send", "Send (respects DRY_RUN + cap)"],
  ["GET", "/api/v1/settings", "Read runtime safety settings"],
  ["PATCH", "/api/v1/settings", "Toggle DRY_RUN / daily cap"],
];

export default function DocsPage() {
  return (
    <div className="shell space-y-10">
      <SectionHeader
        eyebrow="Manual"
        title="Operating Documentation"
        desc="Everything the agent will and will not do, in plain language."
      />

      <div className="grid gap-3 md:grid-cols-2">
        {SECTIONS.map((s, i) => (
          <div key={s.title} className={`card card-hover p-6 fade-up d${(i % 5) + 1}`}>
            <h2 className="text-sm font-semibold text-zinc-100">{s.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">{s.body}</p>
          </div>
        ))}
      </div>
      

      <div className="card flex items-center justify-between p-6 fade-up d3">
        <div>
          <p className="text-sm font-medium text-zinc-200">Developer Portal</p>
          <p className="mt-1 text-xs text-zinc-500">Raw endpoint reference for integrators.</p>
        </div>
        <Link href="/docs/api" className="btn btn-ghost">Open API Reference</Link>
      </div>
      
      <div className="card p-6 fade-up d4">
        <p className="eyebrow">Daily Workflow</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-400">
          <li>Scrape jobs from the Jobs feed.</li>
          <li>Save promising roles to the Applications board.</li>
          <li>Run the agent on Saved cards — recruiter, resume and draft are prepared.</li>
          <li>Review ATS scores and versions in Resume Studio.</li>
          <li>Approve emails only when DRY_RUN is intentionally off.</li>
          <li>Advance cards through the state machine as replies arrive.</li>
        </ol>
      </div>
    </div>
  );
}