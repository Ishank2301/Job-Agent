"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Bar, EmptyState } from "@/components/ui/kit";

const COLUMNS = [
  { key: "SAVED", label: "Saved", color: "#a1a1aa", next: "APPLIED", nextLabel: "Apply" },
  { key: "APPLIED", label: "Applied", color: "#38bdf8", next: "ASSESSMENT", nextLabel: "Assessment" },
  { key: "ASSESSMENT", label: "Assessment", color: "#a78bfa", next: "INTERVIEW", nextLabel: "Interview" },
  { key: "INTERVIEW", label: "Interview", color: "#fbbf24", next: "OFFER", nextLabel: "Offer 🎉" },
  { key: "OFFER", label: "Offer", color: "#34d399", next: null, nextLabel: null },
  { key: "REJECTED", label: "Rejected", color: "#f87171", next: null, nextLabel: null },
];

export function KanbanBoard({ applications, jobs }: { applications: any[]; jobs: any[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const jobById = new Map(jobs.map((j) => [j.id, j]));

  async function move(id: string, status: string) {
    setBusy(id + status);
    try {
      await api(`/applications/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch {
      /* invalid transition rejected by backend */
    }
    setBusy(null);
  }

  async function runAgent(id: string) {
    setBusy(id + "agent");
    try {
      await api(`/applications/${id}/run-agent`, { method: "POST" });
      router.refresh();
    } catch {
      /* backend error */
    }
    setBusy(null);
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        title="The board is empty"
        desc="Save jobs from the Jobs feed and they will appear here as cards moving through your pipeline."
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {COLUMNS.map((col, ci) => {
        const cards = applications.filter((a) => a.status === col.key);
        return (
          <div key={col.key} className={`card fade-up d${ci + 1} flex min-h-[340px] flex-col p-3`}>
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="font-mono text-[11px] tracking-[0.2em]" style={{ color: col.color }}>
                {col.label.toUpperCase()}
              </span>
              <span className="font-mono text-xs text-zinc-600">{cards.length}</span>
            </div>
            <div className="h-px w-full" style={{ background: `${col.color}33` }} />

            <div className="mt-3 flex-1 space-y-3">
              {cards.map((app) => {
                const job = jobById.get(app.job_id);
                return (
                  <div
                    key={app.id}
                    className="rounded-lg border border-white/5 bg-zinc-950/80 p-3 transition hover:border-white/15"
                  >
                    <p className="text-sm font-medium leading-snug text-zinc-200">
                      {job?.title ?? "Unknown role"}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">{job?.company ?? "—"}</p>

                    {app.ats_score != null && (
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between font-mono text-[10px] text-zinc-500">
                          <span>ATS</span>
                          <span className="text-amber-300">{Math.round(app.ats_score)}%</span>
                        </div>
                        <Bar value={app.ats_score} />
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {col.next && (
                        <button
                          className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium text-zinc-300 transition hover:border-emerald-500/40 hover:text-emerald-300"
                          onClick={() => move(app.id, col.next!)}
                          disabled={busy === app.id + col.next}
                        >
                          {col.nextLabel} →
                        </button>
                      )}
                      {app.status === "SAVED" && (
                        <button
                          className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium text-emerald-300 transition hover:border-emerald-500/40"
                          onClick={() => runAgent(app.id)}
                          disabled={busy === app.id + "agent"}
                        >
                          {busy === app.id + "agent" ? "Running…" : "Run Agent"}
                        </button>
                      )}
                      {col.key !== "REJECTED" && col.key !== "OFFER" && (
                        <button
                          className="rounded-md px-2 py-1 text-[10px] text-zinc-600 transition hover:text-red-400"
                          onClick={() => move(app.id, "REJECTED")}
                          disabled={busy === app.id + "REJECTED"}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}