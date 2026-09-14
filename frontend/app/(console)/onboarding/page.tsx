import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  return (
    <div className="py-6">
      <OnboardingWizard
        email={session.user.email}
        defaultName={session.user.name ?? ""}
      />
    </div>
  );
}
