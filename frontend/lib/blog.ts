/**
 * Blog content lives here as structured data — static, fast, no MDX
 * toolchain needed. Add a post by appending to POSTS; the index page,
 * article pages, sitemap and RSS-style ordering all pick it up.
 */

export interface BlogSection {
  heading: string;
  paragraphs: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  readingMinutes: number;
  tags: string[];
  sections: BlogSection[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "why-human-in-the-loop",
    title: "Why we built a job agent that asks permission first",
    excerpt:
      "Most automation fails not because it can't act, but because it acts when it shouldn't. Here's the architecture that makes carelessness impossible in Job·Agent.",
    date: "2026-09-02",
    readingMinutes: 6,
    tags: ["Safety", "Architecture"],
    sections: [
      {
        heading: "The trust problem with automation",
        paragraphs: [
          "Every job seeker who hears the phrase “apply automatically” has the same flicker of dread: what exactly will it send, and to whom? That dread is rational. An agent that can email a recruiter at 3am can email the wrong recruiter at 3am, with the wrong tone, attached to the wrong resume.",
          "Most tools answer this with an audit log — you find out what happened after it happened. We think that's backwards. The valuable moment is before the send, when a human can still look at the draft and say “no, not like that”.",
        ],
      },
      {
        heading: "States, not flags",
        paragraphs: [
          "Job·Agent models every outbound email as a row in a strict state machine: DRAFT → CONFIRMATION_REQUIRED → APPROVED → SENT. The transition to SENT is a single endpoint that requires an explicit human click, and the DRY_RUN runtime switch turns every send into a simulated, logged no-op.",
          "Because the state machine lives in the database — not in a prompt, not in a config file — the LLM cannot talk its way past it. The model can draft, reorder and rephrase. It cannot approve.",
        ],
      },
      {
        heading: "The worst case is nothing",
        paragraphs: [
          "This design has a pleasant property: when the agent is uncertain, it stops and waits. Leave it running overnight and the worst thing it can do without you is nothing — a queue of well-scored roles and ready-to-review drafts waiting for morning coffee.",
          "That's the bar we hold every feature to: automation you can leave running, because the failure mode is a pause, never a mistake.",
        ],
      },
      {
        heading: "Try it yourself",
        paragraphs: [
          "Sign in with Google or GitHub, import a resume, and run a discovery cycle. Watch every email stop at CONFIRMATION_REQUIRED. You'll never look at “one-click apply” the same way again.",
        ],
      },
    ],
  },
  {
    slug: "ats-scoring-explained",
    title: "What an ATS actually scores — and how our meter works",
    excerpt:
      "Applicant tracking systems don't read your resume like a human. Here's what the machines reward, what they punish, and how a 75–85% match band keeps you competitive and honest.",
    date: "2026-08-24",
    readingMinutes: 7,
    tags: ["ATS", "Resumes"],
    sections: [
      {
        heading: "No human reads version one",
        paragraphs: [
          "A typical mid-size company receives hundreds of applications per opening. The first filter is software: an applicant tracking system that parses your resume into structured fields and compares them against the job description. Only after that ranking does a recruiter look at the shortlist.",
          "So the game isn't “impress a human” — not yet. The game is “be legible to a parser and cover the right vocabulary”.",
        ],
      },
      {
        heading: "What the machines reward",
        paragraphs: [
          "In practice, parsers reward: exact keyword coverage from the job description (both acronyms and spelled-out forms), clean single-column layouts that don't confuse the extractor, standard section headings, and quantified achievements adjacent to the skills they demonstrate.",
          "They punish: tables and text boxes, graphical skill bars, creative section names like “Where I've Shined”, and keyword stuffing — a wall of matching tokens with no supporting evidence reads as spam to modern rankers.",
        ],
      },
      {
        heading: "Why we target 75–85%, not 100%",
        paragraphs: [
          "Our ATS meter is a weighted keyword-and-structure score against a specific job description. Chasing 100% almost always means stuffing — and stuffing is detectable and reads badly. The 75–85% band is the sweet spot: high enough to clear most screeners, low enough that every matched keyword is backed by a real bullet point in your history.",
          "When the meter shows you jumping from 64% to 94%, the delta is spelled out as concrete additions — “+ rag pipelines”, “+ mlflow” — each one a term that genuinely exists in your experience and simply wasn't phrased the way the JD phrases it.",
        ],
      },
      {
        heading: "Honest tailoring is a feature",
        paragraphs: [
          "The meter is deliberately transparent: you see the score, the contributing keywords and the exact rewrite suggestions. If a suggestion would require inventing experience you don't have, the system refuses to include it — hallucinated skills are stripped server-side before storage.",
          "That's the difference between optimizing your resume and falsifying it. The first is a legitimate competitive advantage. The second blows up in background checks.",
        ],
      },
    ],
  },
  {
    slug: "resume-tailoring-without-fabrication",
    title: "Tailoring resumes without fabrication: the frozen-fields approach",
    excerpt:
      "LLMs are great at rephrasing and terrible at resisting the urge to help. Here's how we let the model rewrite everything except the truth.",
    date: "2026-08-15",
    readingMinutes: 5,
    tags: ["AI", "Resumes"],
    sections: [
      {
        heading: "The hallucination problem, specifically",
        paragraphs: [
          "Ask a general-purpose LLM to “improve this resume for this job” and it will happily add skills you don't have, expand a two-week course into “led enterprise initiatives”, and round your GPA up. It isn't lying — it's completing the pattern. For a job-search tool, that completion is a liability landmine.",
        ],
      },
      {
        heading: "Freeze the facts at the API boundary",
        paragraphs: [
          "Job·Agent splits a resume into two zones. The frozen zone — contact details, education, employers, dates, certifications and your skill whitelist — is stored server-side and is never included in any prompt as mutable text. The malleable zone — bullet-point phrasing, emphasis, ordering, summary tone — is what the model may touch.",
          "The tailored output is then diffed against the frozen zone before storage: any skill, employer or date in the output that doesn't exist in the source is stripped, and the rewrite is logged. The model operates on style; the database enforces the facts.",
        ],
      },
      {
        heading: "Why this is better for you anyway",
        paragraphs: [
          "Beyond ethics and background checks, there's a practical argument: interviewers probe what's on the page. A resume where every claim is genuinely yours is one where every interview answer can be a strong answer. Fabricated keywords win the screener and lose the room.",
          "Tailoring, done honestly, is just translation — saying true things in the dialect the job description speaks.",
        ],
      },
    ],
  },
  {
    slug: "self-host-job-agent-docker",
    title: "Self-host Job·Agent in 15 minutes (Docker, Postgres, HTTPS)",
    excerpt:
      "The whole stack is three containers and an env file. Here's the fast path from clone to a running agent — with real TLS, not a localhost asterisk.",
    date: "2026-08-05",
    readingMinutes: 8,
    tags: ["Self-hosting", "DevOps"],
    sections: [
      {
        heading: "Why self-host",
        paragraphs: [
          "Your resume is the most economically sensitive document you own. Self-hosting Job·Agent means the database holding it lives on hardware you control, LLM calls can go to a local Ollama instance, and no third party ever sees your pipeline. It's also free, forever, no seat limits.",
        ],
      },
      {
        heading: "The three-container path",
        paragraphs: [
          "Clone the repo, copy .env.example to .env, and fill in the blanks: DATABASE_URL, your LLM provider keys (or none, for Ollama), and Gmail app credentials if you want real sends. Then docker compose up --build — that starts PostgreSQL, runs Alembic migrations, and boots the FastAPI backend with rate limiting and the safety defaults on.",
          "The frontend is a standard Next.js app: npm ci && npm run build && npm start. Point NEXT_PUBLIC_API_URL at your backend origin and you have a working console.",
        ],
      },
      {
        heading: "TLS in one config block",
        paragraphs: [
          "Don't serve a career agent over plain HTTP. The simplest correct setup is Caddy: a five-line Caddyfile proxies job.example.com to the Next.js app and the API, and obtains plus renews Let's Encrypt certificates automatically.",
          "Prefer Nginx? certbot --nginx -d job.example.com does the same. Either way, set NEXT_PUBLIC_SITE_URL to your HTTPS origin so SEO metadata, sitemaps and OAuth callbacks all agree on one canonical URL. The full walkthrough — including security headers and firewall notes — lives in docs/DEPLOYMENT.md.",
        ],
      },
      {
        heading: "Before you flip LIVE mode",
        paragraphs: [
          "Two switches and a checklist: run a full cycle in DRY_RUN, confirm drafts land in the approval queue, set your daily outreach cap to something you'd be comfortable explaining to a recruiter, and only then turn the dry-run off. Going live should be boring.",
        ],
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getAdjacent(slug: string): {
  prev?: BlogPost;
  next?: BlogPost;
} {
  const i = POSTS.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? POSTS[i - 1] : undefined,
    next: i >= 0 && i < POSTS.length - 1 ? POSTS[i + 1] : undefined,
  };
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
