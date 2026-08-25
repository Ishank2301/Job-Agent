# 🚀 Job Application Agent

An enterprise-grade, safety-first automated career agent. This system discovers jobs, tailors resumes, finds recruiter contacts, drafts personalized outreach emails, and manages applications through a strict **Human-in-the-Loop (HITL)** workflow.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-Automation-2EAD33?logo=playwright&logoColor=white)

---

## 🛡️ Core Principle: Safety First

This system interacts with the real world on your behalf. Therefore, it is designed to **never take irreversible actions without explicit human approval**. 

- **Dry-Run by Default:** The environment variable `DRY_RUN=true` is strictly enforced.
- **No Auto-Submit:** The Playwright worker stages Greenhouse/Lever forms but halts for manual final review.
- **Rate Limits:** Enforced daily API caps and email drafting limits to prevent runaway loops.
- **Duplicate Prevention:** Database-level constraints ensure you never apply to the same role twice.

---

## 🏗️ Architecture & Tech Stack

This project upgrades a standard AI prototype into a robust, scalable full-stack application:

### Backend (API & Orchestration)
- **Framework:** FastAPI (Asynchronous, High-Performance)
- **Database:** PostgreSQL 
- **ORM & Migrations:** SQLAlchemy 2.0 + Alembic

### Frontend (Dashboard & Review UI)
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui

### AI & Automation
- **LLM Layer:** Provider-agnostic factory supporting **OpenAI**, **Anthropic**, **Gemini**, and local **Ollama** models.
- **Web Automation:** Playwright workers for scraping job descriptions and staging autofill forms.

---

## 📂 Project Structure

```text
├── backend/
│   ├── alembic/              # Database migration scripts
│   ├── api/                  # FastAPI routes (Jobs, Resumes, Settings)
│   ├── core/                 # Config, Security, and LLM Factory instances
│   ├── models/               # SQLAlchemy ORM models
│   ├── services/             # Business logic (Playwright automation, Resume tailoring)
│   └── main.py               # FastAPI entry point
├── frontend/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # shadcn/ui components
│   └── lib/                  # API clients and utilities
├── .env.example              # Template for environment variables
├── docker-compose.yml        # Infrastructure setup (Postgres)
└── requirements.txt          # Python dependencies
