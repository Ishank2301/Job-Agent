import type { Metadata } from "next";
import Link from "next/link";

import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of Job·Agent — acceptable use, automation limits, disclaimers and liability.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "September 9, 2026";

const SECTIONS: { id: string; heading: string; body: React.ReactNode }[] = [
  {
    id: "acceptance",
    heading: "1. Acceptance of terms",
    body: (
      <p>
        By accessing or using Job·Agent (“the Service”) you agree to these
        Terms of Service. If you do not agree, do not use the Service. You
        must be old enough to consent to data processing in your jurisdiction
        (typically 16+, or 13+ with guardian consent where law allows).
      </p>
    ),
  },
  {
    id: "service",
    heading: "2. What the Service is",
    body: (
      <>
        <p>
          Job·Agent is career-automation software: it discovers job listings,
          scores them against your resume, drafts tailored application
          materials and recruiter outreach, and tracks applications through a
          pipeline. It is a tool that <strong>assists you</strong> — it does
          not replace your judgment, and it is not a recruiting, employment,
          or legal service.
        </p>
        <p>
          The software may be self-hosted. When you self-host, you operate the
          Service on your own infrastructure and are responsible for its
          configuration, security and compliance.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    heading: "3. Accounts & security",
    body: (
      <ul>
        <li>
          Sign-in is available via Google or GitHub OAuth. You are responsible
          for maintaining the security of those upstream accounts.
        </li>
        <li>
          You are responsible for all actions taken through your workspace,
          including emails you approve and autofill sessions you confirm.
        </li>
        <li>
          Notify us immediately at{" "}
          <a href={`mailto:${site.securityEmail}`}>{site.securityEmail}</a> if
          you suspect unauthorized access.
        </li>
      </ul>
    ),
  },
  {
    id: "acceptable-use",
    heading: "4. Acceptable use",
    body: (
      <>
        <p>You agree NOT to:</p>
        <ul>
          <li>
            Use the agent to send unsolicited bulk messages or spam. The built
            -in daily outreach cap is a floor, not a target — respect it.
          </li>
          <li>
            Violate the terms of service of job boards, ATS platforms or
            email providers that the Service interacts with.
          </li>
          <li>
            Circumvent approval gates, rate limits or DRY_RUN safeguards, or
            attempt to automate the human-in-the-loop confirmations away.
          </li>
          <li>
            Upload content you have no right to use, or misrepresent your
            identity, work authorization or qualifications to employers.
          </li>
          <li>
            Use the Service for unlawful discrimination, harassment, or any
            purpose prohibited by applicable law.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "automation",
    heading: "5. Automation & human approval",
    body: (
      <>
        <p>
          The Service is engineered so that <strong>nothing leaves your
          control without an explicit human approval step</strong>: emails halt
          at <code>CONFIRMATION_REQUIRED</code>, autofill sessions require
          manual confirmation and never click final submit buttons, and{" "}
          <code>DRY_RUN</code> is enabled by default.
        </p>
        <p>
          Because you approve every outbound action, <strong>you are the
          sender</strong>. You are responsible for the content you approve,
          its accuracy, and its compliance with the laws and platform rules
          that apply to you (including anti-spam regulations such as CAN-SPAM
          / GDPR where relevant).
        </p>
      </>
    ),
  },
  {
    id: "ai",
    heading: "6. AI-generated content",
    body: (
      <p>
        The Service uses large language models to rephrase and reorganize
        content you provide. The system is designed to prevent fabrication —
        your skill whitelist, education and personal data are frozen
        server-side — but AI output can still be imperfect.{" "}
        <strong>Review every draft before approving it.</strong> You accept
        that generated drafts are suggestions, not guarantees.
      </p>
    ),
  },
  {
    id: "third-party",
    heading: "7. Third-party services",
    body: (
      <p>
        The Service interoperates with job boards, OAuth providers, optional
        LLM providers and email transport you configure. Those services are
        governed by their own terms, and we are not responsible for their
        availability, actions or policies. Features that depend on third
        parties may change or stop working when those parties change.
      </p>
    ),
  },
  {
    id: "ip",
    heading: "8. Intellectual property",
    body: (
      <p>
        Your content — resumes, drafts, applications — belongs to you. The
        Service’s software, design, brand and documentation belong to the
        operators and their licensors, protected by applicable IP law. Where
        the software is provided under an open-source license, that license
        governs the code.
      </p>
    ),
  },
  {
    id: "warranty",
    heading: "9. Disclaimers",
    body: (
      <p>
        THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE”, WITHOUT WARRANTIES
        OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS
        FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. We do not warrant that
        the Service will be uninterrupted, error-free, or that use of it will
        result in any job interviews or offers. Job searching has outcomes we
        cannot promise.
      </p>
    ),
  },
  {
    id: "liability",
    heading: "10. Limitation of liability",
    body: (
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE OPERATORS WILL NOT BE
        LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE
        DAMAGES, OR FOR LOST PROFITS, DATA OR OPPORTUNITIES, ARISING FROM YOUR
        USE OF THE SERVICE. AGGREGATE LIABILITY FOR DIRECT DAMAGES IS LIMITED
        TO THE GREATER OF AMOUNTS YOU PAID US IN THE PRECEDING 12 MONTHS OR
        USD 100.
      </p>
    ),
  },
  {
    id: "termination",
    heading: "11. Suspension & termination",
    body: (
      <p>
        You may stop using the Service at any time. We may suspend or
        terminate accounts that violate these terms — particularly spam,
        abuse of job boards, or attempts to defeat safety controls — with
        notice where practicable. Sections 6–10 survive termination.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "12. Changes to these terms",
    body: (
      <p>
        We may update these terms as the product evolves. Material changes
        will be announced on the blog; continued use after the effective date
        constitutes acceptance. The “last updated” date above reflects the
        current version.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="shell max-w-4xl py-10">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm text-muted">Last updated: {LAST_UPDATED}</p>

      <nav className="card-grad mt-8 p-5" aria-label="Table of contents">
        <p className="eyebrow">On this page</p>
        <ul className="mt-3 grid gap-1.5 text-sm text-muted sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="transition hover:text-accent">
                {s.heading}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="prose-site mt-10">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id}>
            <h2>{s.heading}</h2>
            {s.body}
          </section>
        ))}

        <hr />

        <p className="text-xs text-faint">
          This document is a plain-language starting point, not legal advice.
          If you operate Job·Agent as a business, have counsel review it for
          your jurisdiction.
        </p>
        <p>
          Questions? <Link href="/contact">Contact us</Link>.
        </p>
      </div>
    </div>
  );
}
