import { api } from "@/lib/api";
import { Chip, SectionHeader } from "@/components/ui/kit";
import { KanbanBoard } from "@/components/applications/KanbanBoard";
import type { Application, Job } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  let applications: Application[] = [];
  let jobs: Job[] = [];

  try {
    [applications, jobs] = await Promise.all([
      api<Application[]>("/applications"),
      api<Job[]>("/jobs"),
    ]);
  } catch {
    applications = [];
    jobs = [];
  }

  return (
    <div className="shell space-y-8">
      <SectionHeader
        eyebrow="Pipeline"
        title="Applications Board"
        desc="A strict state machine: Saved → Applied → Assessment → Interview → Offer. Invalid transitions are rejected by the backend."
      >
        <Chip>{applications.length} TRACKED</Chip>
      </SectionHeader>

      <KanbanBoard applications={applications} jobs={jobs} />
    </div>
  );
}