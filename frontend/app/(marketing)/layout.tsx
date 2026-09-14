import type { ReactNode } from "react";

import { PillNav } from "@/components/layout/PillNav";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PillNav />
      <main id="main" className="relative z-10 pb-10 pt-28">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
