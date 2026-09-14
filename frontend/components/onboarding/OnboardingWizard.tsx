"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  MapPin,
  Radar,
  Rocket,
  Target,
} from "lucide-react";

import { api } from "@/lib/api";

const STAGES = [
  "Student / Fresher",
  "Early career (0–2 yrs)",
  "Mid-level (3–6 yrs)",
  "Senior (7–12 yrs)",
  "Leadership (12+ yrs)",
  "Career switcher",
];

const ROLE_PRESETS = [
  "Software Engineer",
  "ML / AI Engineer",
  "Data Scientist",
  "Data Analyst",
  "Product Manager",
  "DevOps / SRE",
  "Designer",
  "Marketing",
];

const LOCATIONS = [
  "Bangalore",
  "Hyderabad",
  "Pune",
  "Delhi NCR",
  "Mumbai",
  "Chennai",
  "Remote (India)",
  "Remote (Global)",
];

interface Props {
  email: string;
  defaultName: string;
}

export function OnboardingWizard({ email, defaultName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(defaultName);
  const [stage, setStage] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [customRole, setCustomRole] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [goal, setGoal] = useState(10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = ["Profile", "Stage", "Roles", "Location", "Goal"];
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step, steps.length]);

  function toggle(list: string[], set: (v: string[]) => void, value: string) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function finish() {
    setSaving(true);
    setError(null);
    const allRoles = customRole.trim()
      ? [...roles, customRole.trim()]
      : roles;
    try {
      await api("/profile", {
        method: "PUT",
        body: JSON.stringify({
          email,
          full_name: name,
          career_stage: stage,
          target_roles: allRoles,
          target_locations: locations.join(", "),
          remote_only: remoteOnly,
          weekly_goal: goal,
          onboarded: true,
        }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(
        "Couldn't reach the backend — is it running? You can retry, or continue to the dashboard.",
      );
      setSaving(false);
    }
  }

  const canNext =
    step === 0
      ? name.trim().length > 1
      : step === 1
        ? stage !== ""
        : step === 2
          ? roles.length > 0 || customRole.trim() !== ""
          : step === 3
            ? locations.length > 0 || remoteOnly
            : true;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-8 flex items-center justify-between">
        <span className="eyebrow">
          Step {step + 1} of {steps.length} — {steps[step]}
        </span>
        <div className="bar w-40">
          <div style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="card p-8 md:p-10">
        {/* Step 0 — welcome / name */}
        {step === 0 && (
          <div className="fade-up">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
              <Rocket className="h-5 w-5" />
            </span>
            <h1 className="display mt-5 text-3xl font-semibold tracking-tight text-ink">
              Welcome to Job·Agent
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Let’s personalize your job search — takes under a minute, and you
              can change everything later in Settings.
            </p>
            <div className="mt-8">
              <label htmlFor="ob-name" className="mb-1.5 block text-xs text-muted">
                What should we call you?
              </label>
              <input
                id="ob-name"
                className="input-dark"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 1 — career stage */}
        {step === 1 && (
          <div className="fade-up">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
              <GraduationCap className="h-5 w-5" />
            </span>
            <h1 className="display mt-5 text-2xl font-semibold tracking-tight text-ink">
              Where are you in your career?
            </h1>
            <p className="mt-2 text-sm text-muted">
              This tunes how the agent writes your resume and outreach.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="choice"
                  data-checked={stage === s}
                  onClick={() => setStage(s)}
                >
                  {stage === s && <Check className="h-3.5 w-3.5" />}
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — target roles */}
        {step === 2 && (
          <div className="fade-up">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
              <Target className="h-5 w-5" />
            </span>
            <h1 className="display mt-5 text-2xl font-semibold tracking-tight text-ink">
              What roles are you targeting?
            </h1>
            <p className="mt-2 text-sm text-muted">
              Pick one or more — discovery runs daily on these titles.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {ROLE_PRESETS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="choice"
                  data-checked={roles.includes(r)}
                  onClick={() => toggle(roles, setRoles, r)}
                >
                  {roles.includes(r) && <Check className="h-3.5 w-3.5" />}
                  {r}
                </button>
              ))}
            </div>
            <input
              className="input-dark mt-4"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Or type a custom role…"
            />
          </div>
        )}

        {/* Step 3 — location */}
        {step === 3 && (
          <div className="fade-up">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
              <MapPin className="h-5 w-5" />
            </span>
            <h1 className="display mt-5 text-2xl font-semibold tracking-tight text-ink">
              Where do you want to work?
            </h1>
            <p className="mt-2 text-sm text-muted">
              Select any that apply, or go fully remote.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {LOCATIONS.map((l) => (
                <button
                  key={l}
                  type="button"
                  className="choice"
                  data-checked={locations.includes(l)}
                  onClick={() => toggle(locations, setLocations, l)}
                >
                  {locations.includes(l) && <Check className="h-3.5 w-3.5" />}
                  {l}
                </button>
              ))}
            </div>
            <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Remote roles only
            </label>
          </div>
        )}

        {/* Step 4 — weekly goal */}
        {step === 4 && (
          <div className="fade-up">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
              <Radar className="h-5 w-5" />
            </span>
            <h1 className="display mt-5 text-2xl font-semibold tracking-tight text-ink">
              Set your weekly application goal
            </h1>
            <p className="mt-2 text-sm text-muted">
              The agent paces discovery and tailoring to keep you on track —
              you still approve every send.
            </p>
            <div className="mt-8 text-center">
              <p className="display text-5xl font-semibold text-accent">{goal}</p>
              <p className="mt-1 text-xs text-muted">quality applications / week</p>
              <input
                type="range"
                min={3}
                max={50}
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                className="mt-6 w-full accent-[var(--accent)]"
                aria-label="Weekly application goal"
              />
              <div className="mt-1 flex justify-between text-[10px] text-faint">
                <span>Chill (3)</span>
                <span>Steady (10)</span>
                <span>Sprint (50)</span>
              </div>
            </div>
            {error && (
              <p className="mt-6 rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs text-danger" role="alert">
                {error}{" "}
                <button
                  type="button"
                  className="ml-1 underline"
                  onClick={() => router.push("/dashboard")}
                >
                  Continue anyway →
                </button>
              </p>
            )}
          </div>
        )}

        {/* Nav */}
        <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              className="btn btn-accent"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-accent"
              onClick={finish}
              disabled={saving}
            >
              {saving ? "Saving…" : "Finish setup"} <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-[11px] text-faint">
        Signed in as {email} · You can redo this anytime from Settings
      </p>
    </div>
  );
}
