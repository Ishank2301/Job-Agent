import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { formatDate, POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog & Resources",
  description:
    "Playbooks and deep-dives on job-search automation: ATS scoring, honest resume tailoring, human-in-the-loop design and self-hosting guides.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const [featured, ...rest] = POSTS;

  return (
    <div className="shell max-w-5xl py-10">
      <p className="eyebrow">Blog & Resources</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
        Field notes on automating a job search{" "}
        <span className="grad-text">responsibly</span>.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Architecture deep-dives, ATS tactics that survive contact with real
        screeners, and self-hosting guides. Written by the team that built the
        approval gates.
      </p>

      {/* Featured */}
      <Link
        href={`/blog/${featured.slug}`}
        className="card-grad card-hover mt-10 block p-8"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="chip border-accent-line bg-accent-soft text-accent">
            Featured
          </span>
          <span>{formatDate(featured.date)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {featured.readingMinutes} min read
          </span>
        </div>
        <h2 className="mt-4 max-w-2xl text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          {featured.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          {featured.excerpt}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
          Read the article <ArrowRight className="h-4 w-4" />
        </span>
      </Link>

      {/* Rest */}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="card-grad card-hover flex flex-col p-6"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{formatDate(post.date)}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {post.readingMinutes} min read
              </span>
            </div>
            <h2 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-ink">
              {post.title}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
              {post.excerpt}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
