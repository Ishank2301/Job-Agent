"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Loader2,
  Lock,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

import { ResumePreview } from "@/components/builder/ResumePreview";
import { TEMPLATES, getTemplate } from "@/lib/resumeTemplates";
import type { MasterResume } from "@/lib/types";
import { api } from "@/lib/api";

const DRAFT_KEY = "ja_resume_draft";

const EMPTY: MasterResume = {
  template_id: "classic",
  personal: { name: "", email: "", phone: "", linkedin: "", github: "" },
  summary: "",
  skills: [],
  education: [{ degree: "", institution: "", dates: "", score: "" }],
  experience_entries: [{ title: "", company: "", dates: "", bullets: [""] }],
  projects: [],
  achievements: [],
};

type Tab =
  | "Design"
  | "Personal"
  | "Summary"
  | "Experience"
  | "Education"
  | "Projects"
  | "Skills";

const TABS: Tab[] = [
  "Design",
  "Personal",
  "Summary",
  "Experience",
  "Education",
  "Projects",
  "Skills",
];

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted">{label}</span>
      {textarea ? (
        <textarea
          className="input-dark resize-y"
          rows={4}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input-dark"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function ImproveButton({
  text,
  context,
  onApply,
}: {
  text: string;
  context: string;
  onApply: (improved: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  async function run() {
    setBusy(true);
    setErr(false);
    try {
      const res = await api<{ improved: string }>("/ai/improve", {
        method: "POST",
        body: JSON.stringify({ text, context }),
      });
      onApply(res.improved);
    } catch {
      setErr(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={busy || text.trim().length < 5}
      title={err ? "AI unavailable — is the backend running?" : "Improve with AI"}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition ${
        err
          ? "border-danger/40 text-danger"
          : "border-accent-line bg-accent-soft text-accent hover:border-accent"
      }`}
    >
      {busy ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      {err ? "Retry" : "Improve"}
    </button>
  );
}

export function ResumeBuilder({ targetRole }: { targetRole: string }) {
  const [data, setData] = useState<MasterResume>(EMPTY);
  const [tab, setTab] = useState<Tab>("Design");
  const [plan, setPlan] = useState("");
  const [zoom, setZoom] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          setData({ ...EMPTY, ...(JSON.parse(draft) as MasterResume) });
        } catch {
          /* corrupt draft — start fresh */
        }
      }
      setPlan(localStorage.getItem("ja_plan") ?? "");
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const persist = useCallback((next: MasterResume) => {
    setData(next);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }, []);

  const template = useMemo(() => getTemplate(data.template_id), [data.template_id]);
  const isPro = plan === "Pro" || plan === "Max";

  function patch(fn: (d: MasterResume) => MasterResume) {
    persist(fn(data));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(380px,480px)_1fr]">
      {/* -------- Editor -------- */}
      <div className="no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-3 py-1.5 text-xs transition ${
                  tab === t
                    ? "bg-accent text-accent-ink font-medium"
                    : "text-muted hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {saved && <span className="text-[10px] text-accent">Draft saved ✓</span>}
        </div>

        <div className="card mt-4 max-h-[calc(100vh-11rem)] overflow-y-auto p-6">
          {/* Design tab */}
          {tab === "Design" && (
            <div className="fade-up">
              <p className="display text-lg font-semibold text-ink">
                Choose a template
              </p>
              <p className="mt-1 text-xs text-muted">
                12 designs, all ATS-parsed.{" "}
                {!isPro && (
                  <>
                    <button
                      className="text-accent underline underline-offset-2"
                      onClick={() => window.open("/plans", "_self")}
                    >
                      Upgrade to Pro
                    </button>{" "}
                    for premium ones.
                  </>
                )}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {TEMPLATES.map((t) => {
                  const locked = t.pro && !isPro;
                  const active = data.template_id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={locked}
                      onClick={() => patch((d) => ({ ...d, template_id: t.id }))}
                      className={`relative rounded-xl border p-3 text-left transition ${
                        active
                          ? "border-accent ring-2 ring-accent/30"
                          : locked
                            ? "border-line opacity-55"
                            : "border-line hover:border-line-strong"
                      }`}
                    >
                      {/* mini thumbnail */}
                      <div className="rounded-md border border-line bg-white p-2">
                        {t.layout === "sidebar" ? (
                          <div className="flex gap-1">
                            <div className="h-12 w-1/3 rounded-sm" style={{ background: `${t.accent}33` }} />
                            <div className="flex-1 space-y-1">
                              <div className="h-1.5 w-2/3 rounded bg-neutral-300" />
                              <div className="h-1 w-full rounded bg-neutral-200" />
                              <div className="h-1 w-5/6 rounded bg-neutral-200" />
                              <div className="h-1 w-1/2 rounded bg-neutral-200" />
                            </div>
                          </div>
                        ) : t.layout === "banner" ? (
                          <div>
                            <div className="h-4 w-full rounded-sm" style={{ background: t.accent }} />
                            <div className="mt-1.5 space-y-1">
                              <div className="h-1 w-3/4 rounded bg-neutral-300" />
                              <div className="h-1 w-full rounded bg-neutral-200" />
                              <div className="h-1 w-5/6 rounded bg-neutral-200" />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="h-2 w-1/2 rounded" style={{ background: t.accent }} />
                            <div className="h-1 w-full rounded bg-neutral-300" />
                            <div className="h-1 w-5/6 rounded bg-neutral-200" />
                            <div className="h-1 w-2/3 rounded bg-neutral-200" />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-ink">
                        {t.name}
                        {locked && <Lock className="h-3 w-3 text-gold" />}
                      </p>
                      <p className="text-[10px] leading-snug text-faint">{t.blurb}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Personal */}
          {tab === "Personal" && (
            <div className="fade-up space-y-4">
              {(
                [
                  ["Name", "name", "Ada Lovelace"],
                  ["Email", "email", "ada@example.com"],
                  ["Phone", "phone", "+91 98xxx xxxxx"],
                  ["LinkedIn", "linkedin", "linkedin.com/in/ada"],
                  ["GitHub", "github", "github.com/ada"],
                ] as const
              ).map(([label, key, ph]) => (
                <Field
                  key={key}
                  label={label}
                  placeholder={ph}
                  value={data.personal[key]}
                  onChange={(v) =>
                    patch((d) => ({ ...d, personal: { ...d.personal, [key]: v } }))
                  }
                />
              ))}
            </div>
          )}

          {/* Summary */}
          {tab === "Summary" && (
            <div className="fade-up space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Professional summary</span>
                <ImproveButton
                  text={data.summary}
                  context={targetRole}
                  onApply={(improved) =>
                    patch((d) => ({ ...d, summary: improved }))
                  }
                />
              </div>
              <Field
                label=""
                textarea
                placeholder="2–4 lines: who you are, your strongest domain, and the impact you bring."
                value={data.summary}
                onChange={(v) => patch((d) => ({ ...d, summary: v }))}
              />
            </div>
          )}

          {/* Experience */}
          {tab === "Experience" && (
            <div className="fade-up space-y-5">
              {data.experience_entries.map((e, i) => (
                <div key={i} className="card space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted">
                      Position {i + 1}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() =>
                          patch((d) => ({
                            ...d,
                            experience_entries: d.experience_entries.filter((_, j) => j !== i),
                          }))
                        }
                        className="rounded-md border border-line p-1 text-faint transition hover:border-danger hover:text-danger disabled:opacity-30"
                        aria-label="Remove position"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Title"
                      value={e.title}
                      placeholder="ML Engineer"
                      onChange={(v) =>
                        patch((d) => {
                          const x = [...d.experience_entries];
                          x[i] = { ...x[i], title: v };
                          return { ...d, experience_entries: x };
                        })
                      }
                    />
                    <Field
                      label="Company"
                      value={e.company}
                      placeholder="Acme AI"
                      onChange={(v) =>
                        patch((d) => {
                          const x = [...d.experience_entries];
                          x[i] = { ...x[i], company: v };
                          return { ...d, experience_entries: x };
                        })
                      }
                    />
                  </div>
                  <Field
                    label="Dates"
                    value={e.dates}
                    placeholder="Jan 2024 — Present"
                    onChange={(v) =>
                      patch((d) => {
                        const x = [...d.experience_entries];
                        x[i] = { ...x[i], dates: v };
                        return { ...d, experience_entries: x };
                      })
                    }
                  />
                  {e.bullets.map((b, bi) => (
                    <div key={bi} className="flex items-end gap-2">
                      <div className="flex-1">
                        <Field
                          label={bi === 0 ? "Bullets" : ""}
                          value={b}
                          placeholder="Cut inference latency 38% by…"
                          onChange={(v) =>
                            patch((d) => {
                              const x = [...d.experience_entries];
                              const bullets = [...x[i].bullets];
                              bullets[bi] = v;
                              x[i] = { ...x[i], bullets };
                              return { ...d, experience_entries: x };
                            })
                          }
                        />
                      </div>
                      <ImproveButton
                        text={b}
                        context={`${e.title} at ${e.company}. Target: ${targetRole}`}
                        onApply={(improved) =>
                          patch((d) => {
                            const x = [...d.experience_entries];
                            const bullets = [...x[i].bullets];
                            bullets[bi] = improved;
                            x[i] = { ...x[i], bullets };
                            return { ...d, experience_entries: x };
                          })
                        }
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      patch((d) => {
                        const x = [...d.experience_entries];
                        x[i] = { ...x[i], bullets: [...x[i].bullets, ""] };
                        return { ...d, experience_entries: x };
                      })
                    }
                    className="btn btn-ghost w-full justify-center text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add bullet
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  patch((d) => ({
                    ...d,
                    experience_entries: [
                      ...d.experience_entries,
                      { title: "", company: "", dates: "", bullets: [""] },
                    ],
                  }))
                }
                className="btn btn-accent w-full justify-center"
              >
                <Plus className="h-4 w-4" /> Add position
              </button>
            </div>
          )}

          {/* Education */}
          {tab === "Education" && (
            <div className="fade-up space-y-4">
              {data.education.map((e, i) => (
                <div key={i} className="card space-y-3 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Degree"
                      value={e.degree}
                      placeholder="B.Tech, Computer Science"
                      onChange={(v) =>
                        patch((d) => {
                          const x = [...d.education];
                          x[i] = { ...x[i], degree: v };
                          return { ...d, education: x };
                        })
                      }
                    />
                    <Field
                      label="Institution"
                      value={e.institution}
                      placeholder="IIT Delhi"
                      onChange={(v) =>
                        patch((d) => {
                          const x = [...d.education];
                          x[i] = { ...x[i], institution: v };
                          return { ...d, education: x };
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Dates"
                      value={e.dates}
                      placeholder="2018 — 2022"
                      onChange={(v) =>
                        patch((d) => {
                          const x = [...d.education];
                          x[i] = { ...x[i], dates: v };
                          return { ...d, education: x };
                        })
                      }
                    />
                    <Field
                      label="Score (optional)"
                      value={e.score ?? ""}
                      placeholder="8.6 CGPA"
                      onChange={(v) =>
                        patch((d) => {
                          const x = [...d.education];
                          x[i] = { ...x[i], score: v };
                          return { ...d, education: x };
                        })
                      }
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  patch((d) => ({
                    ...d,
                    education: [
                      ...d.education,
                      { degree: "", institution: "", dates: "", score: "" },
                    ],
                  }))
                }
                className="btn btn-accent w-full justify-center"
              >
                <Plus className="h-4 w-4" /> Add education
              </button>
            </div>
          )}

          {/* Projects */}
          {tab === "Projects" && (
            <div className="fade-up space-y-4">
              {data.projects.map((p, i) => (
                <div key={i} className="card space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted">
                      Project {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        patch((d) => ({
                          ...d,
                          projects: d.projects.filter((_, j) => j !== i),
                        }))
                      }
                      className="rounded-md border border-line p-1 text-faint transition hover:border-danger hover:text-danger"
                      aria-label="Remove project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Field
                    label="Name"
                    value={p.name}
                    placeholder="RAG Pipeline Studio"
                    onChange={(v) =>
                      patch((d) => {
                        const x = [...d.projects];
                        x[i] = { ...x[i], name: v };
                        return { ...d, projects: x };
                      })
                    }
                  />
                  <Field
                    label="Description"
                    textarea
                    value={p.description}
                    placeholder="What it does and why it matters."
                    onChange={(v) =>
                      patch((d) => {
                        const x = [...d.projects];
                        x[i] = { ...x[i], description: v };
                        return { ...d, projects: x };
                      })
                    }
                  />
                  <Field
                    label="Tech (comma separated)"
                    value={p.tech.join(", ")}
                    placeholder="LangChain, FastAPI, pgvector"
                    onChange={(v) =>
                      patch((d) => {
                        const x = [...d.projects];
                        x[i] = { ...x[i], tech: v.split(",").map((s) => s.trim()).filter(Boolean) };
                        return { ...d, projects: x };
                      })
                    }
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  patch((d) => ({
                    ...d,
                    projects: [
                      ...d.projects,
                      { name: "", description: "", tech: [], bullets: [] },
                    ],
                  }))
                }
                className="btn btn-accent w-full justify-center"
              >
                <Plus className="h-4 w-4" /> Add project
              </button>
            </div>
          )}

          {/* Skills */}
          {tab === "Skills" && (
            <div className="fade-up space-y-5">
              <Field
                label="Skills (comma separated)"
                textarea
                value={data.skills.join(", ")}
                placeholder="Python, PyTorch, LangChain, SQL, Docker…"
                onChange={(v) =>
                  patch((d) => ({
                    ...d,
                    skills: v.split(",").map((s) => s.trim()).filter(Boolean),
                  }))
                }
              />
              <Field
                label="Achievements (one per line)"
                textarea
                value={data.achievements.join("\n")}
                placeholder={"GSoC 2025 — contributor\nWinner, Smart India Hackathon"}
                onChange={(v) =>
                  patch((d) => ({
                    ...d,
                    achievements: v.split("\n").filter((s) => s.trim()),
                  }))
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* -------- Preview -------- */}
      <div className="min-w-0">
        <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="eyebrow">Live preview — {template.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-line px-1">
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-full text-muted hover:text-ink"
                onClick={() => setZoom((z) => Math.max(0, z - 0.1))}
                aria-label="Zoom out"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <span className="w-12 text-center font-mono text-[10px] text-muted">
                {Math.round((0.72 + zoom) * 100)}%
              </span>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-full text-muted hover:text-ink"
                onClick={() => setZoom((z) => Math.min(0.4, z + 0.1))}
                aria-label="Zoom in"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              className="btn btn-accent"
              onClick={() => window.print()}
            >
              <Download className="h-4 w-4" /> Export PDF
            </button>
          </div>
        </div>

        <div className="overflow-auto pb-8">
          <div
            style={{
              transform: `scale(${0.72 + zoom})`,
              transformOrigin: "top center",
            }}
          >
            <ResumePreview data={data} template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}
