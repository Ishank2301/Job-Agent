"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Chip, EmptyState } from "@/components/ui/kit";
import { Search, MapPin, Briefcase, GraduationCap, Building, Filter, LayoutGrid, Clock, PlayCircle, Bookmark, ChevronRight } from "lucide-react";
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
             <button className="btn btn-primary shadow-lg shadow-emerald-500/20 px-6 py-2.5" onClick={scrape} disabled={scraping}>
              {scraping ? "Queuing Scrape…" : "Discover New Roles"}
            </button>
        </div>
      </div>
      {notice && <p className="text-xs text-gold text-center">{notice}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
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
            <div className="space-y-5">
              <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-sm text-ink-soft font-medium">{initialJobs.length} {initialJobs.length === 1 ? 'job' : 'jobs'} available</span>
              </div>

              {initialJobs.map((job) => (
                <article key={job.id} className="bg-surface rounded-xl border border-line hover:border-line-strong transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden">

                  {/* "Actively hiring" Badge - Internshala Style */}
                  <div className="px-5 py-2 border-b border-line flex items-center gap-2 bg-surface-1/50">
                     <PlayCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                     <span className="text-xs font-semibold text-ink-soft uppercase tracking-wide">Actively hiring</span>
                  </div>

                  <div className="p-5 md:p-6 pb-4">
                      <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                              <h2 className="text-xl font-bold text-ink leading-tight">{job.title}</h2>
                              <p className="text-[15px] font-medium text-muted">{job.company}</p>
                          </div>

                          {/* Placeholder for Company Logo */}
                          <div className="hidden md:flex w-12 h-12 bg-surface-2 border border-line rounded flex-shrink-0 items-center justify-center">
                              <Building className="w-6 h-6 text-faint" />
                          </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 mt-4 text-sm text-ink-soft">
                          <MapPin className="w-4 h-4 text-muted" />
                          {job.location || "Location n/a"}
                      </div>

                      {/* Internshala Style Details Grid */}
                      <div className="flex flex-wrap md:flex-nowrap gap-6 md:gap-12 mt-4 text-sm">
                          {/* Start Date / Posted */}
                          <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-muted text-xs uppercase tracking-wide font-medium">
                                  <PlayCircle className="w-3.5 h-3.5" /> Start Date
                              </div>
                              <span className="text-ink-soft">Immediately</span>
                          </div>

                          {/* Salary */}
                          <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-muted text-xs uppercase tracking-wide font-medium">
                                  <Briefcase className="w-3.5 h-3.5" /> CTC
                              </div>
                              <span className="text-ink-soft">{job.salary || "Not Disclosed"}</span>
                          </div>

                          {/* Experience */}
                          <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-muted text-xs uppercase tracking-wide font-medium">
                                  <Clock className="w-3.5 h-3.5" /> Experience
                              </div>
                              <span className="text-ink-soft">{job.experience_level || "Any"}</span>
                          </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-5">
                          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                              Job
                          </span>
                          {job.domain && (
                              <span className="px-2.5 py-1 rounded bg-surface-2 text-ink-soft text-xs font-medium">
                                  {job.domain}
                              </span>
                          )}
                          <span className="px-2.5 py-1 rounded bg-surface-2 text-muted text-xs font-medium border border-line">
                              {job.source}
                          </span>
                      </div>

                      {/* Description Expansion */}
                      {job.description && expanded === job.id && (
                        <div className="mt-5 pt-5 border-t border-line border-dashed">
                          {(job.skills ?? []).length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                              {job.skills.map((skill: string) => (
                                <span key={skill} className="text-xs font-mono bg-surface-1 px-2 py-1 rounded-full text-ink-soft border border-line/40">
                                    {skill}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="whitespace-pre-line text-sm leading-relaxed text-muted bg-surface-1/30 rounded p-4">
                            {job.description}
                          </p>
                        </div>
                      )}
                  </div>

                  {/* Action Footer */}
                  <div className="px-5 py-3 border-t border-line bg-surface-1/30 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-surface-2 text-faint text-[10px] uppercase font-bold tracking-wider">
                           {new Date(job.scraped_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                          {job.description && (
                            <button
                                className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors flex items-center justify-center flex-1 sm:flex-none py-2"
                                onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                            >
                                {expanded === job.id ? "Hide details" : "View details"}
                            </button>
                          )}

                          <button
                            className="btn btn-primary px-5 flex-1 sm:flex-none"
                            onClick={() => save(job.id)}
                            disabled={busy === job.id}
                          >
                            {busy === job.id ? "Saving…" : "Save Job"}
                          </button>
                      </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
