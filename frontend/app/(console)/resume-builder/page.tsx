import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ResumeBuilder } from "@/components/builder/ResumeBuilder";

export const dynamic = "force-dynamic";

export default async function ResumeBuilderPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="py-2">
      <div className="mb-6 no-print">
        <p className="eyebrow">Resume Builder</p>
        <h1 className="display mt-2 text-3xl font-semibold tracking-tight text-ink">
          Build your resume from scratch.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Pick a template, fill your story, improve any line with AI, and
          export a parser-perfect PDF. Drafts save automatically.
        </p>
      </div>
      <ResumeBuilder targetRole={session.user.name ?? "your target role"} />
    </div>
  );
}
