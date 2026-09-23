"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Chip, EmptyState } from "@/components/ui/kit";
import { Search, MapPin, Briefcase, GraduationCap, Building, Filter, LayoutGrid } from "lucide-react";
import type { Job } from "@/lib/types";

export function JobsBoard({ initialJobs }: { initialJobs: Job[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States for all the filters (read from URL first)
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [domain, setDomain] = useState(searchParams.get("domain") || "all");
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get("experience_level") || "all");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [source, setSource] = useState(searchParams.get("source") || "all");

  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [scraping, setScraping] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Hardcode domains and levels since backend does filtering now
  const domains = ["Engineering", "Data", "Product", "Design", "Sales", "Marketing"];
  const levels = ["Entry", "Mid", "Senior"];
  const sources = ["linkedin", "indeed", "glassdoor"];

  async function applyFilters() {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (domain !== "all") params.append("domain", domain);
      if (experienceLevel !== "all") params.append("experience_level", experienceLevel);
      if (location) params.append("location", location);
      if (source !== "all") params.append("source", source);

      router.push(`/jobs?${params.toString()}`);
      router.refresh();
  }

  async function clearFilters() {
      setSearch("");
      setDomain("all");
      setExperienceLevel("all");
      setLocation("");
      setSource("all");
      router.push("/jobs");
      router.refresh();
  }

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
    <div className="flex flex-col gap-6">
      {/* Top Banner similar to Internshala */}
      <div className="bg-surface-2 rounded-xl p-8 border border-line flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-50"></div>
        <div className="relative z-10 space-y-2">
            <h1 className="text-3xl font-bold text-ink">Find your dream job</h1>
            <p className="text-muted text-sm max-w-xl">Trending on Job Agent: Software Engineer, Data Scientist, Product Manager</p>
        </div>
        <div className="relative z-10 mt-6 md:mt-0 flex gap-3">
             <button className="btn btn-primary shadow-lg shadow-emerald-500/20" onClick={scrape} disabled={scraping}>
              {scraping ? "Queuing Scrape…" : "Discover New Roles"}
            </button>
        </div>
      </div>
      {notice && <p className="text-xs text-gold text-center">{notice}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6 card p-5 fade-up d1 sticky top-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-line">
              <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold text-ink uppercase tracking-wider text-sm">Filters</h3>
              </div>
          </div>

          <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-ink-soft">
                    <Search className="w-3.5 h-3.5 text-muted" /> Keywords
                </label>
                <input
                  className="input-dark w-full bg-surface-1"
                  placeholder="e.g. React, Python"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-ink-soft">
                    <MapPin className="w-3.5 h-3.5 text-muted" /> Location
                </label>
                <input
                  className="input-dark w-full bg-surface-1"
                  placeholder="e.g. Remote, NY"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-ink-soft">
                    <LayoutGrid className="w-3.5 h-3.5 text-muted" /> Domain
                </label>
                <div className="relative">
                    <select
                      className="input-dark w-full bg-surface-1 appearance-none cursor-pointer"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    >
                      <option value="all">All Domains</option>
                      {domains.map((d: any) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-ink-soft">
                    <GraduationCap className="w-3.5 h-3.5 text-muted" /> Experience Level
                </label>
                <select
                  className="input-dark w-full bg-surface-1 appearance-none cursor-pointer"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="all">All Levels</option>
                  {levels.map((l: any) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-ink-soft">
                    <Briefcase className="w-3.5 h-3.5 text-muted" /> Source Board
                </label>
                <select
                  className="input-dark w-full bg-surface-1 appearance-none cursor-pointer"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="all">All Sources</option>
                  {sources.map((s: any) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button
                  className="btn btn-primary w-full mt-4"
                  onClick={applyFilters}
              >
                  Apply Filters
              </button>
          </div>

          <div className="pt-4 border-t border-line mt-6">
              <button
                  className="w-full py-2 text-sm text-muted hover:text-ink transition-colors border border-transparent hover:border-line rounded"
                  onClick={clearFilters}
              >
                  Clear all filters
              </button>
          </div>
        </div>

        {/* Main Job Feed */}
        <div className="lg:col-span-3 space-y-4 fade-up d2">
          {initialJobs.length === 0 ? (
            <EmptyState
              title="No jobs found matching your criteria"
              desc="Try broadening your search filters or clear them completely."
            >
              <button className="btn btn-ghost" onClick={clearFilters}>
                Clear Filters
              </button>
            </EmptyState>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-sm text-ink-soft font-medium">{initialJobs.length} {initialJobs.length === 1 ? 'job' : 'jobs'} available</span>
              </div>

              {initialJobs.map((job) => (
                <article key={job.id} className="bg-surface rounded-xl border border-line hover:border-line-strong transition-all duration-200 p-6 shadow-sm hover:shadow-md">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between md:justify-start gap-3 mb-1">
                          <h2 className="text-xl font-bold text-ink leading-tight">{job.title}</h2>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
                        <Building className="w-4 h-4 text-muted" />
                        {job.company}
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-muted">
                          <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {job.location || "Location n/a"}
                          </div>
                          {job.salary && (
                              <div className="flex items-center gap-1.5 font-medium text-ink-soft">
                                  <span className="text-gold">₹</span>
                                  {job.salary}
                              </div>
                          )}
                           {job.experience_level && (
                              <div className="flex items-center gap-1.5">
                                  <Briefcase className="w-4 h-4" />
                                  {job.experience_level}
                              </div>
                          )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-line/50">
                        {job.domain && (
                            <span className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                {job.domain}
                            </span>
                        )}
                        <span className="px-2.5 py-1 rounded text-xs font-medium bg-surface-2 text-muted border border-line">
                            via {job.source}
                        </span>
                        <span className="px-2.5 py-1 rounded text-xs font-medium bg-surface-2 text-muted border border-line">
                            {new Date(job.scraped_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </span>
                      </div>

                    </div>

                    <div className="shrink-0 flex flex-row md:flex-col gap-3 items-center md:items-end mt-4 md:mt-0 w-full md:w-auto">
                      <button
                        className="btn btn-primary w-full md:w-auto px-6"
                        onClick={() => save(job.id)}
                        disabled={busy === job.id}
                      >
                        {busy === job.id ? "Saving…" : "Save to Kanban"}
                      </button>
                    </div>
                  </div>

                  {(job.skills ?? []).length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {job.skills.slice(0, 10).map((skill: string) => (
                        <span key={skill} className="text-xs bg-surface-1 px-2 py-1 rounded text-ink-soft border border-line/40">
                            {skill}
                        </span>
                      ))}
                      {(job.skills ?? []).length > 10 && (
                          <span className="text-xs text-muted self-center ml-1">+{job.skills.length - 10} more</span>
                      )}
                    </div>
                  )}

                  {job.description && (
                    <div className="mt-5">
                      <p
                        className={`whitespace-pre-line text-sm leading-relaxed text-muted bg-surface-1/50 rounded-lg p-4 border border-line/30 ${
                          expanded === job.id ? "" : "line-clamp-3"
                        }`}
                      >
                        {job.description}
                      </p>
                      <button
                        className="mt-2 text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                        onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                      >
                        {expanded === job.id ? "Show less" : "Read full description"}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
