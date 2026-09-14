import type { Metadata } from "next";

import { PlansGrid } from "@/components/plans/PlansGrid";

export const metadata: Metadata = {
  title: "Pricing — Free, Pro & Max",
  description:
    "Start free, upgrade when your search scales. Compare Job·Agent plans: AI tailoring credits, templates, outreach limits and premium features.",
  alternates: { canonical: "/plans" },
};

export default function PlansPage() {
  return (
    <div className="shell max-w-6xl py-6">
      <div className="text-center">
        <p className="eyebrow">Pricing</p>
        <h1 className="display mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Simple plans that scale with your search.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
          Every plan keeps the safety model: DRY_RUN by default, hard outreach
          caps, and a human approval gate on every send. Upgrade for volume,
          premium templates and deeper AI.
        </p>
      </div>

      <PlansGrid />
    </div>
  );
}
