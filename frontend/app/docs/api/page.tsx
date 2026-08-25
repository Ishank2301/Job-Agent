import Link from "next/link";
import { Chip, SectionHeader } from "@/components/ui/kit";

export const dynamic = "force-dynamic";

const ENDPOINTS = [
  ["GET", "/api/v1/jobs", "List indexed jobs"],
  ["POST", "/api/v1/jobs/scrape", "Queue a scrape run"],
  ["POST", "/api/v1/applications", "Save a job as application"],
  ["PATCH", "/api/v1/applications/{id}/status", "Move through state machine"],
  ["POST", "/api/v1/applications/{id}/run-agent", "Run recruiter + resume + email pipeline"],
  ["GET", "/api/v1/resumes/master", "Master resume schema"],
  ["GET", "/api/v1/resumes/application/{id}", "Resume + version history"],
  ["POST", "/api/v1/resumes/tailor", "Create guarded tailored version"],
  ["POST", "/api/v1/recruiters/find", "Discover recruiter contact"],
  ["POST", "/api/v1/emails/draft", "Draft outreach email"],
  ["POST", "/api/v1/emails/{id}/approve", "Human approval gate"],
  ["POST", "/api/v1/emails/{id}/send", "Send (respects DRY_RUN + cap)"],
  ["GET", "/api/v1/settings", "Read runtime safety settings"],
  ["PATCH", "/api/v1/settings", "Toggle DRY_RUN / daily cap"],
  ["POST", "/api/v1/autofill/sessions", "Start headed autofill review"],
  ["POST", "/api/v1/autofill/confirmations/{id}/approve", "Mark manual review approved"],
];

export default function ApiDocsPage() {
  return (
    <div className="shell space-y-8">
      <SectionHeader
        eyebrow="Developer Portal"
        title="API Reference"
        desc="Raw machine interface. For the human operating manual, see the main docs."
      >
        <Link href="/docs" className="btn btn-ghost">User Docs</Link>
      </SectionHeader>

      <div className="card overflow-hidden fade-up">
        <table className="w-full text-left text-sm">
          <tbody>
            {ENDPOINTS.map(([method, path, desc]) => (
              <tr key={method + path} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-6 py-3">
                  <Chip
                    className={
                      method === "GET"
                        ? "border-sky-500/20 bg-sky-500/10 text-sky-300"
                        : method === "PATCH"
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    }
                  >
                    {method}
                  </Chip>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-300">{path}</td>
                <td className="px-6 py-3 text-xs text-zinc-500">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-6 fade-up d2">
        <p className="eyebrow">Auth & Safety Notes</p>
        <ul className="mt-4 space-y-2 text-sm text-zinc-500">
          <li>· All mutating routes are rate-limited (slowapi) and CORS-restricted to the frontend origin.</li>
          <li>· Email send routes are no-ops while DRY_RUN=true and always enforce the daily cap.</li>
          <li>· Invalid application state transitions return HTTP 409.</li>
        </ul>
      </div>
    </div>
  );
}