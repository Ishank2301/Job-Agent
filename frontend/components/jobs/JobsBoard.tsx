"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Chip, EmptyState } from "@/components/ui/kit";

export function JobsBoard({ jobs }: { jobs: any[] }) {
  const router = useRouter();

  // States for all the filters
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("all");

  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [scraping, setScraping] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const sources = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.source))).sort(),
    [jobs]
  );

  const domains = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.domain).filter(Boolean))).sort(),
    [jobs]
  );

  const levels = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.experience_level).filter(Boolean))).sort(),
    [jobs]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const l = location.toLowerCase();

    return jobs.filter((job) => {
      const matchesSource = source === "all" || job.source === source;
      const matchesDomain = domain === "all" || job.domain === domain;
      const matchesLevel = experienceLevel === "all" || job.experience_level === experienceLevel;
      const matchesLocation = l === "" || (job.location && job.location.toLowerCase().includes(l));

      const matchesQuery =
        q === "" ||
        `${job.title} ${job.company} ${(job.skills ?? []).join(" ")}`
          .toLowerCase()
          .includes(q);

      return matchesSource && matchesQuery && matchesDomain && matchesLevel && matchesLocation;
    });
  }, [jobs, search, source, domain, experienceLevel, location]);

  async function scrape() {
    setScraping(true);
    setNotice(null);
    try {
      await api("/jobs/scrape", { method: "POST" });
      setNotice("Scrape queued. The backend is collecting jobs — refresh in ~30s.");
    } catch (e: any) {
      setNotice(e.detail ?? "Scrape failed");
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      {/* Sidebar Filters */}
      <div className="lg:col-span-1 space-y-6 card p-5 fade-up d1">
        <div>
            <h3 className="font-mono text-[11px] tracking-[0.2em] text-muted mb-4 uppercase">Filter Roles</h3>
            <label className="block mb-2 text-sm text-ink-soft">Search Keywords</label>
            <input
              className="input-dark w-full mb-4"
              placeholder="Title, company, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <label className="block mb-2 text-sm text-ink-soft">Location</label>
            <input
              className="input-dark w-full mb-4"
              placeholder="City or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <label className="block mb-2 text-sm text-ink-soft">Domain</label>
            <select
              className="input-dark w-full mb-4"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              <option value="all">All Domains</option>
              {domains.map((d: any) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <label className="block mb-2 text-sm text-ink-soft">Experience Level</label>
            <select
              className="input-dark w-full mb-4"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              {levels.map((l: any) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <label className="block mb-2 text-sm text-ink-soft">Source Board</label>
            <select
              className="input-dark w-full mb-6"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="all">All sources</option>
              {sources.map((s) => (
                <option key={s as string} value={s as string}>{s as string}</option>
              ))}
            </select>

            <button className="btn btn-primary w-full" onClick={scrape} disabled={scraping}>
              {scraping ? "Queuing Scrape…" : "Trigger Job Scraper"}
            </button>
            {notice && <p className="mt-3 text-xs text-gold text-center">{notice}</p>}
        </div>
      </div>

      {/* Main Job Feed */}
      <div className="lg:col-span-3 space-y-4 fade-up d2">
        {filtered.length === 0 ? (
          <EmptyState
            title="No jobs found"
            desc="Adjust your filters or trigger a scrape to pull live openings from LinkedIn, Indeed and Glassdoor."
          >
            <button className="btn btn-ghost" onClick={() => {
                setSearch(""); setDomain("all"); setExperienceLevel("all"); setLocation(""); setSource("all");
            }}>
              Clear Filters
            </button>
          </EmptyState>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-xs text-muted font-medium">{filtered.length} openings matched</span>
            </div>
            {filtered.map((job) => (
              <article key={job.id} className="card card-hover p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold text-ink leading-tight">{job.title}</h2>
                        {job.domain && <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-medium tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{job.domain}</span>}
                    </div>
                    <p className="text-sm font-medium text-ink-soft">
                      {job.company} <span className="mx-1.5 text-line-strong">•</span> {job.location || "Location n/a"}
                    </p>
                    {job.salary && (
                        <p className="text-sm text-gold font-medium">{job.salary}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3 mb-2">
                      {job.experience_level && (
                        <Chip className="bg-surface-2 text-ink-soft border-line">
                          {job.experience_level}
                        </Chip>
                      )}
                      <Chip className="border-accent-line bg-accent-soft text-accent">
                        {job.source}
                      </Chip>
                    </div>

                  </div>
                  <div className="shrink-0 flex flex-col gap-2 items-end">
                    <button
                      className="btn btn-glow whitespace-nowrap"
                      onClick={() => save(job.id)}
                      disabled={busy === job.id}
                    >
                      {busy === job.id ? "Saving…" : "Save to Kanban"}
                    </button>
                    <p className="font-mono text-[10px] text-faint mt-1">
                        {new Date(job.scraped_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {(job.skills ?? []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5 pt-4 border-t border-line/50">
                    <span className="text-[11px] uppercase tracking-wider text-muted font-mono mr-2 self-center">Skills:</span>
                    {job.skills.slice(0, 10).map((skill: string) => (
                      <Chip key={skill} className="bg-surface-2 text-xs">{skill}</Chip>
                    ))}
                  </div>
                )}

                {job.description && (
                  <div className="mt-4 bg-surface-2/30 rounded-lg p-4">
                    <p
                      className={`whitespace-pre-line text-sm leading-relaxed text-muted ${
                        expanded === job.id ? "" : "line-clamp-3"
                      }`}
                    >
                      {job.description}
                    </p>
                    <button
                      className="mt-3 font-mono text-[11px] tracking-[0.15em] text-accent hover:text-emerald-400 transition-colors"
                      onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                    >
                      {expanded === job.id ? "COLLAPSE ↑" : "READ FULL JD ↓"}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
