import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";

import { NewsletterForm } from "@/components/layout/NewsletterForm";
import {
  GithubIcon,
  LinkedInIcon,
  XIcon,
} from "@/components/ui/BrandIcons";
import { site, type SocialIcon } from "@/lib/site";

const SOCIAL_ICONS: Record<
  SocialIcon,
  React.ComponentType<{ className?: string }>
> = {
  github: GithubIcon,
  twitter: XIcon,
  linkedin: LinkedInIcon,
};

const COLUMNS: { heading: string; links: [string, string][] }[] = [
  {
    heading: "Product",
    links: [
      ["Features", "/#features"],
      ["How it works", "/#how"],
      ["Templates", "/#templates"],
      ["Pricing", "/plans"],
      ["Console", "/dashboard"],
    ],
  },
  {
    heading: "Resources",
    links: [
      ["Docs", "/docs"],
      ["API Reference", "/docs/api"],
      ["Blog", "/blog"],
      ["FAQs", "/#faqs"],
    ],
  },
  {
    heading: "Company",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Reviews", "/#reviews"],
      ["Sign in", "/login"],
    ],
  },
  {
    heading: "Legal",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms of Service", "/terms"],
      ["Contact", "/contact"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line bg-bg/80">
      <div className="shell grid gap-10 py-14 md:grid-cols-6">
        {/* Brand + newsletter */}
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z"
                stroke="#34d399"
                strokeWidth="1.4"
              />
              <circle cx="12" cy="11" r="2.4" fill="#34d399" />
            </svg>
            <span className="font-mono text-sm tracking-[0.26em] text-ink">
              JOB·AGENT
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {site.tagline}. Discover roles, tailor resumes, draft outreach —
            you approve every send.
          </p>

          <div className="mt-6">
            <p className="eyebrow">Stay in the loop</p>
            <div className="mt-3 max-w-sm">
              <NewsletterForm />
            </div>
          </div>

          <a
            href={`mailto:${site.email}`}
            className="mt-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink-soft"
          >
            <Mail className="h-4 w-4" /> {site.email}
          </a>
        </div>

        {/* Link columns */}
        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <p className="eyebrow">{col.heading}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {col.links.map(([label, href]) => (
                <li key={`${col.heading}-${label}`}>
                  <Link href={href} className="transition hover:text-ink-soft">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="shell flex flex-col items-start justify-between gap-4 border-t border-line py-6 md:flex-row md:items-center">
        <p className="font-mono text-[11px] text-faint">
          © {new Date().getFullYear()} {site.name} · DRY_RUN by default · zero
          auto-submits · human-in-the-loop
        </p>

        <div className="flex items-center gap-4">
          <span className="chip">
            <ShieldCheck className="h-3 w-3 text-accent" />
            SSL / TLS in production
          </span>
          <div className="flex gap-3">
            {site.socials.map((s) => {
              const Icon = SOCIAL_ICONS[s.icon];
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-faint transition hover:text-ink-soft"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
