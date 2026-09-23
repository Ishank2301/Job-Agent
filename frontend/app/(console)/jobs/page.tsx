import { api } from "@/lib/api";
import { SectionHeader, Chip } from "@/components/ui/kit";
import { JobsBoard } from "@/components/jobs/JobsBoard";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  let jobs: Job[] = [];
  try {
    jobs = await api("/jobs");
  } catch {
    jobs = [];
  }

  return (
    <div className="shell space-y-8 max-w-[1400px]">
      <SectionHeader
        eyebrow="Discovery"
        title="Job Feed"
        desc="Browse scraped openings grouped by domain, level, and skills. Save the ones worth pursuing."
      >
        <Chip>{jobs.length} INDEXED</Chip>
      </SectionHeader>

      <JobsBoard jobs={jobs} />
    </div>
  );
}
