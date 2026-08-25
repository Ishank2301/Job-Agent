"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileText,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { AtsDial, Chip, EmptyState } from "@/components/ui/kit";

type Props = {
  master: any;
  applications: any[];
  jobs: any[];
};

export function ResumeStudio({ master, applications, jobs }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const jobById = new Map(jobs.map((j) => [j.id, j]));

  const load = useCallback(async (appId: string) => {
    if (!appId) return;
    try {
      const res = await api(`/resumes/application/${appId}`);
      setData(res);
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    load(selected);
  }, [selected, load]);

  async function tailor() {
    if (!selected) return;
    setBusy(true);
    setNotice(null);
    try {
      await api("/resumes/tailor", {
        method: "POST",
        body: JSON.stringify({ application_id: selected }),
      });
      setNotice("Tailored. A new guarded version was created.");
      await load(selected);
      router.refresh();
    } catch (e: any) {
      setNotice(
        e.detail ?? "Tailoring failed — is Ollama running and does the job have a description?"
      );
    }
    setBusy(false);
  }

  const versions = data?.versions ?? [];

  const steps = [
    {
      done: jobs.length > 0,
      label: "Scrape the job feed",
      href: "/jobs" as string | null,
      cta: "Open Jobs",
    },
    {
      done: applications.length > 0,
      label: "Save a role to your pipeline",
      href: "/jobs" as string | null,
      cta: "Save a Job",
    },
    {
      done: versions.length > 0,
      label: "Run your first tailoring pass",
      href: null as string | null,
      cta: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ===== Self-completing onboarding checklist ===== */}
      <div className="card-grad p-6 fade-up">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-300" />
          <p className="eyebrow">Setup Checklist</p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.label}
              className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-4"
            >
              {s.done ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
              )}
              <div>
                <p className={`text-sm ${s.done ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                  {i + 1}. {s.label}
                </p>
                {!s.done && s.href && (
                  <Link href={s.href} className="btn btn-glow mt-3 !px-3 !py-1.5 text-xs">
                    {s.cta} <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* ===== Master resume (locked) ===== */}
        <div className="card p-6 fade-up d1">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Master Resume · Locked Template</p>
            <Chip className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
              {master?.template_id ?? "default"}
            </Chip>
          </div>

          {!master ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Lock className="h-6 w-6 text-zinc-600" />
              <p className="text-sm text-zinc-400">Master resume unavailable — backend offline.</p>
              <p className="max-w-xs text-xs text-zinc-600">
                Start the FastAPI backend to load your locked template and skill whitelist.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-zinc-500">
                  PERSONAL · FROZEN
                </p>
                <p className="mt-2 text-sm text-zinc-300">{master?.personal?.name}</p>
                <p className="text-xs text-zinc-600">
                  {master?.personal?.email} · {master?.personal?.phone}
                </p>
              </div>

              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-zinc-500">SUMMARY</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{master?.summary}</p>
              </div>

              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-zinc-500">
                  SKILLS · WHITELIST
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(master?.skills ?? []).map((s: string) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-zinc-500">EXPERIENCE</p>
                <div className="mt-2 space-y-3">
                  {(master?.experience_entries ?? []).map((exp: any) => (
                    <div key={exp.company}>
                      <p className="text-sm text-zinc-300">
                        {exp.title} · {exp.company}
                      </p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-zinc-500">
                        {exp.bullets.map((b: string) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== Tailoring console ===== */}
        <div className="card p-6 fade-up d2">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Tailoring Console</p>
            {selected && (
              <button
                className="btn btn-ghost !px-2.5 !py-1 text-[11px]"
                onClick={() => load(selected)}
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            )}
          </div>

          {applications.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No applications to tailor for"
                desc="Tailoring runs per-application against that job's description. Save a role first — the console unlocks automatically."
              >
                <Link href="/jobs" className="btn btn-glow">
                  Browse Job Feed <ArrowRight className="h-4 w-4" />
                </Link>
              </EmptyState>
            </div>
          ) : (
            <>
              <select
                className="input-dark mt-5"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">Select an application…</option>
                {applications.map((a) => {
                  const job = jobById.get(a.job_id);
                  return (
                    <option key={a.id} value={a.id}>
                      {job?.company ?? "Unknown"} — {job?.title ?? a.id.slice(0, 8)}
                    </option>
                  );
                })}
              </select>

              <div className="mt-6 flex items-center gap-6">
                <AtsDial score={versions[0]?.ats_score ?? null} />
                <div>
                  <p className="text-sm font-medium text-zinc-200">Latest ATS Score</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    Target band 75–85%. Summary & skills keywords weigh 3×, bullets 1×.
                  </p>
                </div>
              </div>

              <button
                className="btn btn-glow mt-6"
                onClick={tailor}
                disabled={busy || !selected}
              >
                {busy ? "Tailoring…" : "Tailor Resume for this JD"}
              </button>
              {notice && <p className="mt-3 text-xs text-amber-300">{notice}</p>}

              <div className="mt-8">
                <p className="font-mono text-[11px] tracking-[0.2em] text-zinc-500">
                  VERSION HISTORY
                </p>
                <div className="mt-3 space-y-2">
                  {versions.length === 0 && (
                    <p className="text-xs text-zinc-600">
                      No versions yet — run a tailoring pass to create v1.
                    </p>
                  )}
                  {versions.map((v: any) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5"
                    >
                      <span className="font-mono text-xs text-zinc-300">v{v.version}</span>
                      <span className="font-mono text-xs text-amber-300">
                        {v.ats_score != null ? `${Math.round(v.ats_score)}%` : "—"}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-600">
                        {new Date(v.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-300">
                    GUARDRAILS ACTIVE
                  </p>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                  <li>· Personal data frozen — never rewritten</li>
                  <li>· Template locked — same layout every version</li>
                  <li>· Skill whitelist — LLM cannot invent tools</li>
                  <li>· Experience facts immutable — only phrasing changes</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}