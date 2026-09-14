/**
 * Single source of truth for brand, SEO and contact details.
 * Update these values before deploying — they feed metadata,
 * the footer, JSON-LD structured data, sitemap and robots.
 */
export const site = {
  name: "Job·Agent",
  /** Canonical production URL — no trailing slash. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  tagline: "The AI career agent with a human holding the keys",
  description:
    "Job·Agent discovers roles, tailors your resume per job, drafts recruiter outreach and tracks every application — with a hard human-approval gate on every outbound action. DRY_RUN by default.",
  email: "hello@jobagent.app",
  securityEmail: "security@jobagent.app",
  location: "Remote-first",
  /** Social profiles rendered in the footer. Point these at real handles. */
  socials: [
    { label: "GitHub", href: "https://github.com/", icon: "github" },
    { label: "X (Twitter)", href: "https://x.com/", icon: "twitter" },
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
  ],
  keywords: [
    "job application automation",
    "AI resume tailoring",
    "ATS score",
    "recruiter outreach",
    "job search agent",
    "human-in-the-loop AI",
    "self-hosted job tracker",
  ],
} as const;

export type SocialIcon = (typeof site.socials)[number]["icon"];
