import { api } from "@/lib/api";
import { Chip, SectionHeader } from "@/components/ui/kit";
import { ResumeStudio } from "@/components/resume/ResumeStudio";

export const dynamic = "force-dynamic";

export default async function ResumeStudioPage() {
  let master = null;
  let applications: never[] = [];
  let jobs: never[] = [];

  try {
    [master, applications, jobs] = await Promise.all([
      api("/resumes/master"),
      api("/applications"),
      api("/jobs"),
    ]);
  } catch {
    master = null;
  }

  return (
    <div className="shell space-y-8">
      <SectionHeader
        eyebrow="Resume Studio"
        title="Tailoring Dashboard"
        desc="One master resume, infinite guarded variants. Every version is scored, stored and auditable."
      >
        <Chip>{applications.length} APPLICATIONS READY</Chip>
      </SectionHeader>

      <ResumeStudio master={master} applications={applications} jobs={jobs} />
    </div>
  );
}