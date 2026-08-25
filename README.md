# Job Application Agent

An enterprise-grade, safety-first automated career agent that discovers jobs, tailors resumes, finds recruiter contacts, drafts personalized outreach emails, and manages applications through a strict human-in-the-loop workflow.

This project upgrades the original prototype architecture into a modern full-stack system:

- Backend: FastAPI + SQLAlchemy 2.0 + PostgreSQL + Alembic
- Frontend: Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui
- Automation: Playwright worker for Greenhouse/Lever autofill review
- AI: Provider-agnostic LLM layer supporting Ollama, OpenAI, Anthropic, and Gemini
- Safety: DRY_RUN by default, daily email caps, duplicate prevention, no auto-submit

---

## Core Principles

### 1. Safety First

The system is designed to never take irreversible real-world actions without explicit human approval.

Default behavior:

```env
DRY_RUN=true