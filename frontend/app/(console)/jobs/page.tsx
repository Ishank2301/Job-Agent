import { api } from "@/lib/api";
import { SectionHeader, Chip } from "@/components/ui/kit";
import { JobsBoard } from "@/components/jobs/JobsBoard";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function JobsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  let jobs: Job[] = [];

  // Construct URL query parameters for backend filtering
  const query = new URLSearchParams();
  if (searchParams.location) query.append("location", searchParams.location as string);
  if (searchParams.domain) query.append("domain", searchParams.domain as string);
  if (searchParams.experience_level) query.append("experience_level", searchParams.experience_level as string);
  if (searchParams.search) query.append("search", searchParams.search as string);
  if (searchParams.source) query.append("source", searchParams.source as string);

  const queryString = query.toString();
  const endpoint = queryString ? `/jobs?${queryString}` : "/jobs";

  try {
    jobs = await api(endpoint);
  } catch {
    jobs = [];
  }

  // Fetch unique filter options based on the full dataset (or you would ideally fetch this via a separate meta API)
  // For now, passing down jobs is fine, but in a real massive app, domains/levels would be statically known or fetched separately.

  return (
    <div className="shell space-y-8 max-w-[1400px]">
      <SectionHeader
        eyebrow="Discovery"
        title="Job Feed"
        desc="Browse scraped openings grouped by domain, level, and skills. Save the ones worth pursuing."
      >
        <Chip>{jobs.length} INDEXED</Chip>
      </SectionHeader>

      <JobsBoard initialJobs={jobs} />
    </div>
  );
}
