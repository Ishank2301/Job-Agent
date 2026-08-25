import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GoogleButton, GitHubButton } from "@/components/auth/AuthButtons";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/plans");

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center">
      <div className="card-grad w-full max-w-md p-8">
        <p className="eyebrow text-center">Welcome</p>
        <h1 className="mt-2 text-center text-2xl font-semibold text-zinc-50">
          Sign in to Job·Agent
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Use your Google or GitHub account to continue.
        </p>

        <div className="mt-8 space-y-3">
          <GoogleButton />
          <GitHubButton />
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-zinc-600">
          DRY_RUN is on by default. Nothing is sent anywhere without your approval.
        </p>
      </div>
    </div>
  );
}