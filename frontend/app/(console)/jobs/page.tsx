import { api } from "@/lib/api";
import { SectionHeader, Chip } from "@/components/ui/kit";
import { JobsBoard } from "@/components/jobs/JobsBoard";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  let jobs: never[] = [];
  try {
    jobs = await api("/jobs");
  } catch {
    jobs = [];
  }

  return (
    <div className="shell space-y-8">
      <SectionHeader
        eyebrow="Discovery"
        title="Job Feed"
        desc="Every opening is deduplicated, skill-tagged and stored with its full description. Save the ones worth pursuing."
      >
        <Chip>{jobs.length} INDEXED</Chip>
      </SectionHeader>

      <JobsBoard jobs={jobs} />
    </div>
  );
}