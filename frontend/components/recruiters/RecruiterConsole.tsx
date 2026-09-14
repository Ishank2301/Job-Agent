"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { CopyButton, EmptyState } from "@/components/ui/kit";

export function RecruiterConsole({ recruiters }: { recruiters: any[] }) {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function find() {
    if (!company.trim()) return;
    setBusy(true);
    setNotice(null);
    try {
      const res: any = await api("/recruiters/find", {
        method: "POST",
        body: JSON.stringify({ company, job_title: role }),
      });
      setNotice(
        res?.email
          ? `Contact stored: ${res.name ?? "HR"} · ${res.email}`
          : "No recruiter contact found for this company."
      );
      router.refresh();
    } catch (e: any) {
      setNotice(e.detail ?? "Lookup failed");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-end gap-3 p-5 fade-up d1">
        <div className="min-w-[200px] flex-1">
          <label className="eyebrow">Company</label>
          <input
            className="input-dark mt-2"
            placeholder="e.g. Razorpay"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="eyebrow">Role (context)</label>
          <input
            className="input-dark mt-2"
            placeholder="e.g. ML Engineer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <button className="btn btn-glow" onClick={find} disabled={busy}>
          {busy ? "Searching…" : "Find Recruiter"}
        </button>
        {notice && <p className="w-full text-xs text-gold">{notice}</p>}
      </div>

      {recruiters.length === 0 ? (
        <EmptyState
          title="No recruiter contacts yet"
          desc="Run a lookup above and discovered contacts will be stored here with copy-ready emails."
        />
      ) : (
        <div className="card overflow-hidden fade-up d2">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {["COMPANY", "CONTACT", "EMAIL", "SOURCE", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 font-mono text-[10px] tracking-[0.2em] text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recruiters.map((r: any) => (
                <tr key={r.id} className="border-b border-line transition hover:bg-surface-2">
                  <td className="px-5 py-3.5 text-ink-soft">{r.company}</td>
                  <td className="px-5 py-3.5 text-muted">{r.name ?? "—"}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-accent">{r.email ?? "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-faint">{r.source ?? "heuristics"}</td>
                  <td className="px-5 py-3.5 text-right">
                    {r.email && <CopyButton text={r.email} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}