import "./globals.css";

import type { Metadata } from "next";

import { TopNav } from "@/components/layout/TopNav";
import { NodeGraph } from "@/components/three/NodeGraph";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Job Application Agent",
  description: "Enterprise-grade automated career agent",
};

export const dynamic = "force-dynamic";

async function getSystemState() {
  try {
    const [health, settings] = await Promise.all([
      api<never>("/health"),
      api<{ dry_run: boolean }>("/settings"),
    ]);

    return { online: true, dryRun: settings.dry_run };
  } catch {
    return { online: false, dryRun: true };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sys = await getSystemState();

  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-zinc-100 antialiased">
        <NodeGraph />
        <TopNav dryRun={sys.dryRun} />

        <main className="relative z-10 pb-20 pt-24">
          {children}
        </main>

        <footer className="border-t border-white/5 py-8">
          <div className="shell flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[11px] tracking-[0.2em] text-zinc-600">
              JOB·AGENT — ENTERPRISE CAREER AUTOMATION
            </p>

            <p className="font-mono text-[11px] text-zinc-600">
              DRY_RUN BY DEFAULT · ZERO AUTO-SUBMITS · HUMAN-IN-THE-LOOP
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}