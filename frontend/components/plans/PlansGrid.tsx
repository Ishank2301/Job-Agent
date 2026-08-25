"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const TIERS = [
  {
    name: "Free",
    price: "₹0",
    tagline: "Test the agent safely",
    features: ["5 job matches / week", "1 resume tailor / day", "Basic ATS score", "DRY_RUN emails only", "Community support"],
  },
  {
    name: "Plus",
    price: "₹299/mo",
    tagline: "For active applicants",
    features: ["25 job matches / week", "5 tailors / day", "Full ATS breakdown", "10 recruiter lookups / mo", "Send 5 emails / day"],
  },
  {
    name: "Pro",
    price: "₹799/mo",
    tagline: "Most popular",
    features: ["Unlimited job matches", "15 tailors / day", "Keyword gap analysis", "Unlimited recruiter lookups", "10 emails / day", "Version history"],
  },
  {
    name: "Max",
    price: "₹1,499/mo",
    tagline: "Full automation",
    features: ["Everything in Pro", "Autofill review sessions", "Priority scraping", "Cover letters", "25 emails / day", "Priority support"],
  },
  {
    name: "Ultra",
    price: "₹2,999/mo",
    tagline: "Maximum throughput",
    features: ["Everything in Max", "Multi-agent pipelines", "Interview prep assistant", "Dedicated scrape slots", "Unlimited outreach*", "1:1 onboarding"],
  },
];

export function PlansGrid() {
  const [plan, setPlan] = useState<string>("Free");

  useEffect(() => {
    setPlan(localStorage.getItem("ja_plan") ?? "Free");
  }, []);

  function choose(name: string) {
    localStorage.setItem("ja_plan", name);
    setPlan(name);
  }

  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
      {TIERS.map((t) => {
        const active = plan === t.name;
        return (
          <div
            key={t.name}
            className={`card-grad card-hover flex flex-col p-5 ${active ? "ring-2 ring-violet-500/60" : ""}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-100">{t.name}</h3>
              {active && (
                <span className="chip border-violet-500/30 bg-violet-500/10 text-violet-300">
                  CURRENT
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-500">{t.tagline}</p>
            <p className="mt-3 font-mono text-2xl text-zinc-50">{t.price}</p>

            <ul className="mt-4 flex-1 space-y-2">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-zinc-400">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => choose(t.name)}
              className={`btn mt-5 w-full justify-center ${active ? "btn-ghost" : "btn-glow"}`}
            >
              {active ? "Selected" : `Choose ${t.name}`}
            </button>
          </div>
        );
      })}
      <p className="text-[11px] text-zinc-600 xl:col-span-5">
        *Every outbound action still requires explicit human approval on all tiers.
      </p>
    </div>
  );
}