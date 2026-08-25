"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Chip, EmptyState } from "@/components/ui/kit";

export function JobsBoard({ jobs }: { jobs: any[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [scraping, setScraping] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const sources = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.source))).sort(),
    [jobs]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return jobs.filter((job) => {
      const matchesSource = source === "all" || job.source === source;
      const matchesQuery =
        q === "" ||
        `${job.title} ${job.company} ${job.location} ${(job.skills ?? []).join(" ")}`
          .toLowerCase()
          .includes(q);
      return matchesSource && matchesQuery;
    });
  }, [jobs, query, source]);

  async function scrape() {
    setScraping(true);
    setNotice(null);
    try {
      await api("/jobs/scrape", { method: "POST" });
      setNotice("Scrape queued. Refresh in ~30s to see results.");
    } catch (e: any) {
      setNotice(e.detail ?? "Scrape failed — is the backend running?");
    }
    setScraping(false);
  }

  async function save(jobId: string) {
    setBusy(jobId);
    try {
      await api("/applications", {
        method: "POST",
        body: JSON.stringify({ job_id: jobId }),
      });
      router.refresh();
    } catch (e: any) {
      setNotice(e.detail ?? "Could not save application");
    }
    setBusy(null);
  }

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center gap-3 p-4 fade-up d2">
        <input
          className="input-dark max-w-xs"
          placeholder="Search title, company, skill…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="input-dark w-auto"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="all">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-3">
          {notice && <span className="text-xs text-amber-300">{notice}</span>}
          <button className="btn btn-glow" onClick={scrape} disabled={scraping}>
            {scraping ? "Queuing…" : "Scrape Jobs"}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No jobs in the feed yet"
          desc="Trigger a scrape and the agent will pull live openings from LinkedIn, Indeed and Glassdoor into this feed."
        >
          <button className="btn btn-ghost" onClick={scrape} disabled={scraping}>
            {scraping ? "Queuing…" : "Run First Scrape"}
          </button>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {filtered.map((job, i) => (
            <article key={job.id} className={`card card-hover p-5 fade-up d${(i % 5) + 1}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">{job.title}</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {job.company} · {job.location || "Location n/a"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Chip className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                    {job.source}
                  </Chip>
                  <button
                    className="btn btn-ghost"
                    onClick={() => save(job.id)}
                    disabled={busy === job.id}
                  >
                    {busy === job.id ? "Saving…" : "Save → Applications"}
                  </button>
                </div>
              </div>

              {(job.skills ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.skills.slice(0, 10).map((skill: string) => (
                    <Chip key={skill}>{skill}</Chip>
                  ))}
                </div>
              )}

              {job.description && (
                <div className="mt-4">
                  <p
                    className={`whitespace-pre-line text-sm leading-relaxed text-zinc-500 ${
                      expanded === job.id ? "" : "line-clamp-3"
                    }`}
                  >
                    {job.description}
                  </p>
                  <button
                    className="mt-2 font-mono text-[11px] tracking-[0.15em] text-emerald-400 hover:text-emerald-300"
                    onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                  >
                    {expanded === job.id ? "COLLAPSE ↑" : "READ FULL JD ↓"}
                  </button>
                </div>
              )}

              <p className="mt-4 font-mono text-[10px] text-zinc-600">
                {new Date(job.scraped_at).toLocaleString()} · {job.url}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}