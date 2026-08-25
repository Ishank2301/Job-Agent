import { api } from "@/lib/api";
import { Chip, SectionHeader } from "@/components/ui/kit";
import { KanbanBoard } from "@/components/applications/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  let applications: never[] = [];
  let jobs: never[] = [];

  try {
    [applications, jobs] = await Promise.all([
      api("/applications"),
      api("/jobs"),
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