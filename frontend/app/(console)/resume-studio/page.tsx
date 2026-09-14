import { api } from "@/lib/api";
import { Chip, SectionHeader } from "@/components/ui/kit";
import { ResumeStudio } from "@/components/resume/ResumeStudio";
import type { Application, Job, MasterResume } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ResumeStudioPage() {
  let master: MasterResume | null = null;
  let applications: Application[] = [];
  let jobs: Job[] = [];

  try {
    [master, applications, jobs] = await Promise.all([
      api<MasterResume>("/resumes/master"),
      api<Application[]>("/applications"),
      api<Job[]>("/jobs"),
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