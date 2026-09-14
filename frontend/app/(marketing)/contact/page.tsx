import type { Metadata } from "next";
import Link from "next/link";
import { Bug, Mail, ShieldAlert, Timer } from "lucide-react";

import { ContactForm } from "@/app/(marketing)/contact/ContactForm";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Job·Agent team — product questions, bug reports, self-hosting help, partnerships and security disclosures.",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  {
    icon: Mail,
    title: "Email",
    detail: site.email,
    href: `mailto:${site.email}`,
    note: "General questions, feedback, anything human.",
  },
  {
    icon: GithubIcon,
    title: "GitHub Issues",
    detail: "Report bugs & request features",
    href: `${site.socials[0].href}issues`,
    note: "Public tracking — search existing issues first.",
  },
  {
    icon: ShieldAlert,
    title: "Security",
    detail: site.securityEmail,
    href: `mailto:${site.securityEmail}`,
    note: "Responsible disclosure. We respond within 72h.",
  },
];

export default function ContactPage() {
  return (
    <div className="shell max-w-5xl py-10">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
        Talk to a human.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Questions about the product, trouble self-hosting, or an idea that
        would make your search faster — we read everything and answer most
        messages within{" "}
        <span className="inline-flex items-center gap-1 font-medium text-accent">
          <Timer className="h-3.5 w-3.5" /> 48 hours
        </span>
        .
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Channels */}
        <div className="space-y-3">
          {CHANNELS.map((c) => (
            <a
              key={c.title}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="card-grad card-hover block p-5"
            >
              <div className="flex items-start gap-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent-line bg-accent-soft text-accent">
                  <c.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{c.title}</p>
                  <p className="mt-0.5 text-sm text-accent/90">{c.detail}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {c.note}
                  </p>
                </div>
              </div>
            </a>
          ))}

          <div className="card-grad p-5">
            <p className="text-sm font-semibold text-ink">
              Prefer self-serve?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              The{" "}
              <Link href="/docs" className="text-accent underline underline-offset-2">
                documentation
              </Link>{" "}
              covers setup, OAuth configuration, deployment with HTTPS and the
              full safety model. The{" "}
              <Link href="/blog" className="text-accent underline underline-offset-2">
                blog
              </Link>{" "}
              has playbooks and deep-dives.
            </p>
            <Bug className="mt-3 h-4 w-4 text-faint" />
          </div>
        </div>

        {/* Form */}
        <ContactForm email={site.email} />
      </div>
    </div>
  );
}
