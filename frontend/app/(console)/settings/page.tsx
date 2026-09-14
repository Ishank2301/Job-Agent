import { api } from "@/lib/api";
import { Chip, SectionHeader } from "@/components/ui/kit";

export const dynamic = "force-dynamic";

async function updateSettings(patch: Record<string, unknown>) {
  "use server";
  await api("/settings", { method: "PATCH", body: JSON.stringify(patch) });
}

export default async function SettingsPage() {
  let settings = { dry_run: true, max_emails_per_day: 10 };
  let online = true;

  try {
    settings = await api("/settings");
  } catch {
    online = false;
  }

  const setDryRun = updateSettings.bind(null, { dry_run: !settings.dry_run });
  const capUp = updateSettings.bind(null, { max_emails_per_day: settings.max_emails_per_day + 1 });
  const capDown = updateSettings.bind(null, {
    max_emails_per_day: Math.max(0, settings.max_emails_per_day - 1),
  });

  return (
    <div className="shell space-y-8">
      <SectionHeader
        eyebrow="Control Room"
        title="Settings & Safety"
        desc="The kill-switches that keep an autonomous agent trustworthy."
      >
        <Chip>
          <span className={`pulse-dot ${online ? "" : "off"}`} />
          {online ? "CONNECTED" : "OFFLINE"}
        </Chip>
      </SectionHeader>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="card p-6 fade-up d1">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Dry Run Mode</p>
            <span
              className={`chip ${
                settings.dry_run
                  ? "border-accent-line bg-accent-soft text-accent"
                  : "border-line-strong bg-surface-2 text-gold"
              }`}
            >
              {settings.dry_run ? "SAFE" : "LIVE"}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            While enabled, emails are simulated and logged — nothing ever leaves the system.
          </p>
          <form action={setDryRun} className="mt-5">
            <button className={settings.dry_run ? "btn btn-danger" : "btn btn-primary"}>
              {settings.dry_run ? "Disable Dry Run" : "Re-enable Safe Mode"}
            </button>
          </form>
        </div>

        <div className="card p-6 fade-up d2">
          <p className="eyebrow">Daily Outreach Cap</p>
          <p className="mt-4 font-mono text-4xl text-ink">
            {settings.max_emails_per_day}
          </p>
          <p className="mt-2 text-sm text-muted">Hard ceiling on cold emails per day.</p>
          <form action={capDown} className="mt-5 inline-block">
            <button className="btn btn-ghost">−</button>
          </form>
          <form action={capUp} className="mt-5 ml-2 inline-block">
            <button className="btn btn-ghost">+</button>
          </form>
        </div>

        <div className="card p-6 fade-up d3">
          <p className="eyebrow">Integrations</p>
          <div className="mt-4 space-y-3 text-sm">
            {[
              ["LLM Runtime", "Ollama / OpenAI / Anthropic / Gemini"],
              ["Email Transport", "Gmail SMTP (App Password)"],
              ["Autofill", "Playwright · Greenhouse + Lever only"],
              ["Database", "PostgreSQL 16 · SQLAlchemy 2.0"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4">
                <span className="text-muted">{k}</span>
                <span className="text-right font-mono text-xs text-ink-soft">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-faint">
            Credentials live in <code>.env</code> only — never in code, never in git.
          </p>
        </div>
      </div>
    </div>
  );
}