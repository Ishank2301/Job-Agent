import Link from "next/link";
import { api } from "@/lib/api";
import { Bar, Chip, SectionHeader, StatCard } from "@/components/ui/kit";
import { Job, Application } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  SAVED: "#a1a1aa",
  APPLIED: "#38bdf8",
  ASSESSMENT: "#a78bfa",
  INTERVIEW: "#fbbf24",
  OFFER: "#34d399",
  REJECTED: "#f87171",
};

export default async function DashboardPage() {
  let jobs: Job[] = [];
  let apps: Application[] = [];
  let online = true;

  try {
    [jobs, apps] = await Promise.all([
      api<Job[]>("/jobs"),
      api<Application[]>("/applications"),
    ]);
  } catch {
    online = false;
  }

  const inPipeline = apps.filter((a) =>
    ["APPLIED", "ASSESSMENT", "INTERVIEW"].includes(a.status)
  ).length;
  const offers = apps.filter((a) => a.status === "OFFER").length;
  const scored = apps.filter((a) => a.ats_score != null);
  const avgAts = scored.length
    ? Math.round(scored.reduce((sum, a) => sum + (a.ats_score ?? 0), 0) / scored.length)
    : 0;

  const distribution = Object.keys(STATUS_TONE).map((status) => ({
    status,
    count: apps.filter((a) => a.status === status).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  const recent = [...apps]
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""))
    .slice(0, 6);

  return (
    <div className="shell space-y-10">
      <SectionHeader
        eyebrow="Command Center"
        title="Operations Dashboard"
        desc="Live telemetry across discovery, applications and outreach. All numbers come straight from the database."
      >
        <Chip>
          <span className={`pulse-dot ${online ? "" : "off"}`} />
          {online ? "LIVE" : "OFFLINE"}
        </Chip>
      </SectionHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Jobs Indexed" value={jobs.length} tone="sky" delay="d1" />
        <StatCard label="Applications" value={apps.length} delay="d2" />
        <StatCard label="In Pipeline" value={inPipeline} tone="violet" delay="d3" />
        <StatCard label="Offers" value={offers} tone="emerald" delay="d4" />
        <StatCard
          label="Avg ATS"
          value={avgAts ? `${avgAts}%` : "—"}
          tone="amber"
          delay="d5"
        />
        <StatCard
          label="Auto-Submits"
          value={0}
          tone="red"
          sub="must stay zero"
          delay="d6"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <div className="card p-6 fade-up lg:col-span-2">
          <p className="eyebrow">Pipeline Distribution</p>
          <div className="mt-6 space-y-4">
            {distribution.map((d) => (
              <div key={d.status}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className="font-mono text-[11px] tracking-[0.18em]"
                    style={{ color: STATUS_TONE[d.status] }}
                  >
                    {d.status}
                  </span>
                  <span className="font-mono text-xs text-zinc-500">{d.count}</span>
                </div>
                <div className="bar">
                  <div
                    style={{
                      width: `${(d.count / maxCount) * 100}%`,
                      background: STATUS_TONE[d.status],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 fade-up d2 lg:col-span-3">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Recent Activity</p>
            <Link
              href="/applications"
              className="btn btn-ghost !py-1.5 text-xs"
            >
              Open Kanban
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {recent.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm text-zinc-500">No applications yet.</p>
                <Link href="/jobs" className="btn btn-glow">
                  Scrape & Save Your First Job
                </Link>
              </div>
            )}
            {recent.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="text-sm text-zinc-200">
                    Application {a.id.slice(0, 8)}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                    {new Date(a.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {a.ats_score != null && (
                    <span className="font-mono text-xs text-amber-300">
                      {Math.round(a.ats_score)}% ATS
                    </span>
                  )}
                  <Chip className="border-white/10">
                    <span style={{ color: STATUS_TONE[a.status] }}>
                      {a.status}
                    </span>
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-4 p-6 fade-up d3">
        <div>
          <p className="text-sm font-medium text-zinc-200">Quick Actions</p>
          <p className="mt-1 text-xs text-zinc-500">
            Feed the pipeline, review the board, or read the operating manual.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/jobs" className="btn btn-primary">Scrape Jobs</Link>
          <Link href="/resume-studio" className="btn btn-ghost">
            Resume Studio
          </Link>
          <Link href="/docs" className="btn btn-ghost">Docs</Link>
        </div>
      </div>
    </div>
  );
}