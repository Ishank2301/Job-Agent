import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

import { formatDate, getAdjacent, getPost, POSTS } from "@/lib/blog";
import { site } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article not found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      url: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacent(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: site.name, url: site.url },
    url: `${site.url}/blog/${post.slug}`,
  };

  return (
    <article className="shell max-w-3xl py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink-soft"
      >
        <ArrowLeft className="h-4 w-4" /> All articles
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {post.readingMinutes} min read
          </span>
          {post.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {post.excerpt}
        </p>
      </header>

      <hr className="my-10 border-line" />

      <div className="prose-site">
        {post.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="card-grad mt-14 p-8 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Put the playbook to work.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Sign in free and watch the agent score your first job description —
          nothing sends without your approval.
        </p>
        <Link href="/login" className="btn btn-glow mt-5">
          Get Started Free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Prev / next */}
      <nav
        className="mt-10 grid gap-3 border-t border-line pt-8 sm:grid-cols-2"
        aria-label="More articles"
      >
        {prev ? (
          <Link href={`/blog/${prev.slug}`} className="card-grad card-hover p-5">
            <p className="eyebrow">Newer</p>
            <p className="mt-2 text-sm font-medium text-ink">{prev.title}</p>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/blog/${next.slug}`}
            className="card-grad card-hover p-5 sm:text-right"
          >
            <p className="eyebrow">Older</p>
            <p className="mt-2 text-sm font-medium text-ink">{next.title}</p>
          </Link>
        )}
      </nav>
    </article>
  );
}
