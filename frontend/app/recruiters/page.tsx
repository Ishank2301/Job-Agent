import { api } from "@/lib/api";
import { Chip, SectionHeader } from "@/components/ui/kit";
import { RecruiterConsole } from "@/components/recruiters/RecruiterConsole";

export const dynamic = "force-dynamic";

export default async function RecruitersPage() {
  let recruiters: never[] = [];
  try {
    recruiters = await api("/recruiters");
  } catch {
    recruiters = [];
  }

  return (
    <div className="shell space-y-8">
      <SectionHeader
        eyebrow="Outreach Network"
        title="Recruiter Database"
        desc="Domain discovery, LinkedIn heuristics and corporate email-pattern inference — stored for repeat outreach."
      >
        <Chip>{recruiters.length} CONTACTS</Chip>
      </SectionHeader>

      <RecruiterConsole recruiters={recruiters} />
    </div>
  );
}