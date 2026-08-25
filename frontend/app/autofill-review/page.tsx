import { api } from "@/lib/api";
import { Chip, SectionHeader } from "@/components/ui/kit";

export const dynamic = "force-dynamic";

async function approve(sessionId: string) {
  "use server";
  await api(`/autofill/confirmations/${sessionId}/approve`, { method: "POST" });
}

export default async function AutofillReviewPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  if (!searchParams.id) {
    return (
      <div className="shell">
        <SectionHeader eyebrow="Autofill" title="Review Session" desc="Missing session id. Open this page from a confirmation link." />
      </div>
    );
  }

  let session = null;
  try {
    session = await api(`/autofill/confirmations/${searchParams.id}`);
  } catch {
    session = null;
  }

  return (
    <div className="shell space-y-8">
      <SectionHeader
        eyebrow="Autofill"
        title="Manual Review Gate"
        desc="The engine filled the form and stopped. Submission is yours — by design."
      />

      {!session ? (
        <div className="card p-8 text-sm text-zinc-500">Session not found.</div>
      ) : (
        <div className="card max-w-2xl p-6 fade-up d1">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-zinc-500">{session.id}</p>
            <Chip className="border-amber-500/20 bg-amber-500/10 text-amber-300">
              {session.status}
            </Chip>
          </div>
          <p className="mt-4 break-all font-mono text-xs text-emerald-300">{session.url}</p>

          <form action={approve.bind(null, session.id)} className="mt-6">
            <button className="btn btn-primary">I reviewed it — mark approved</button>
          </form>

          <div className="mt-6 rounded-lg border border-amber-500/15 bg-amber-500/5 p-4 text-xs leading-relaxed text-zinc-400">
            Approval only unlocks <em>manual</em> submission. The engine never clicks the
            final submit button, in any mode, on any site.
          </div>
        </div>
      )}
    </div>
  );
}