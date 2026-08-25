import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PlansGrid } from "@/components/plans/PlansGrid";
import { SignOutButton } from "@/components/auth/AuthButtons";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="shell space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
            Choose your plan
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Signed in as{" "}
            <span className="text-zinc-200">
              {session.user?.name ?? session.user?.email ?? "user"}
            </span>
          </p>
        </div>
        <SignOutButton />
      </div>

      <PlansGrid />
    </div>
  );
}