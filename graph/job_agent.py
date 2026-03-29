"""
Job Agent — LangGraph Orchestration
Nodes:
  1. scrape_jobs       — find new jobs from all boards
  2. filter_jobs       — score & filter by relevance
  3. find_recruiters   — find recruiter contact for each job
  4. tailor_resume     — tailor resume to each JD
  5. write_email       — write personalized cold email
  6. send_application  — send email + log result
  7. report            — generate daily summary
"""
from typing import Annotated, TypedDict, List, Dict, Optional
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

from tools.scraper import scrape_all_jobs, save_jobs, load_jobs, JobListing
from tools.resume_tailor import tailor_resume, score_job_match
from tools.recruiter_finder import find_recruiter
from tools.email_sender import (
    write_cold_email, send_email, log_application,
    already_applied, emails_sent_today, load_applications
)
from config.settings import settings
from utils.logger import get_logger

logger = get_logger(__name__)


# ─── State ────────────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    jobs: List[Dict]
    filtered_jobs: List[Dict]
    current_job: Optional[Dict]
    processed_jobs: List[Dict]
    errors: List[str]
    summary: Dict
    run_id: str


# ─── Node 1: Scrape Jobs ──────────────────────────────────────────────────────

def scrape_jobs_node(state: AgentState) -> AgentState:
    """Scrape all job boards and save new listings."""
    logger.info("=" * 50)
    logger.info("NODE 1: Scraping jobs from all boards...")

    try:
        new_jobs = scrape_all_jobs()
        save_jobs(new_jobs)
        all_jobs = load_jobs()

        # Only process jobs not yet applied to
        unprocessed = [
            j for j in all_jobs
            if not already_applied(j["id"])
            and j.get("company", "").lower() not in
            [b.lower() for b in settings.BLACKLIST_COMPANIES if b]
        ]

        logger.info(f"Found {len(unprocessed)} unprocessed jobs")
        return {**state, "jobs": unprocessed}
    except Exception as e:
        logger.error(f"Scrape node failed: {e}")
        return {**state, "jobs": [], "errors": state["errors"] + [str(e)]}


# ─── Node 2: Filter & Score Jobs ─────────────────────────────────────────────

def filter_jobs_node(state: AgentState) -> AgentState:
    """Score each job for match quality and filter top candidates."""
    logger.info("NODE 2: Scoring and filtering jobs...")

    scored = []
    for job in state["jobs"]:
        jd = job.get("description", "")
        score = score_job_match(jd) if jd else 0.3
        job["match_score"] = score
        scored.append(job)

    # Sort by score, take top N
    scored.sort(key=lambda x: x["match_score"], reverse=True)
    top_jobs = scored[:settings.MAX_JOBS_PER_RUN]

    # Filter out low-quality matches
    filtered = [j for j in top_jobs if j["match_score"] >= 0.3]

    logger.info(f"Filtered to {len(filtered)} quality jobs (score >= 0.3)")
    return {**state, "filtered_jobs": filtered}


# ─── Node 3–6: Process Each Job ───────────────────────────────────────────────

def process_jobs_node(state: AgentState) -> AgentState:
    """
    For each filtered job:
    1. Find recruiter
    2. Tailor resume
    3. Write cold email
    4. Send email
    5. Log result
    """
    logger.info("NODE 3-6: Processing each job (find recruiter → tailor → email → send)...")

    processed = []
    daily_limit = settings.MAX_EMAILS_PER_DAY
    sent_today = emails_sent_today()

    for job in state["filtered_jobs"]:
        job_id = job["id"]
        company = job.get("company", "Unknown")
        title = job.get("title", "")
        jd = job.get("description", "")
        apply_url = job.get("apply_url", "")

        logger.info(f"\nProcessing: {title} at {company} (score: {job.get('match_score', 0):.2f})")

        # Check daily email limit
        if sent_today >= daily_limit:
            logger.warning(f"Daily email limit ({daily_limit}) reached. Stopping.")
            job["processing_status"] = "skipped_limit"
            processed.append(job)
            continue

        try:
            # Step 1: Find recruiter
            recruiter_name, recruiter_email = find_recruiter(company, title)
            job["recruiter_name"] = recruiter_name
            job["recruiter_email"] = recruiter_email

            if not recruiter_email:
                logger.warning(f"No recruiter email found for {company} — skipping")
                job["processing_status"] = "skipped_no_recruiter"
                processed.append(job)
                continue

            # Step 2: Tailor resume
            tailored_resume = tailor_resume(title, company, jd)
            resume_path = f"data/resumes/tailored/{company}_{title}.txt".replace(" ", "_")

            # Step 3: Write cold email
            email_data = write_cold_email(
                recruiter_name=recruiter_name,
                company=company,
                job_title=title,
                job_description=jd,
                tailored_resume=tailored_resume
            )

            # Step 4: Send email
            success = send_email(
                to_email=recruiter_email,
                subject=email_data["subject"],
                body=email_data["body"],
                resume_path=resume_path if not settings.DRY_RUN else None
            )

            status = "sent" if (success and not settings.DRY_RUN) else "dry_run" if settings.DRY_RUN else "failed"

            # Step 5: Log application
            log_application(
                job_id=job_id,
                company=company,
                job_title=title,
                recruiter_email=recruiter_email,
                email_subject=email_data["subject"],
                status=status,
                resume_path=resume_path
            )

            job["processing_status"] = status
            job["email_subject"] = email_data["subject"]
            sent_today += 1
            logger.info(f"Application {status}: {title} at {company} → {recruiter_email}")

        except Exception as e:
            logger.error(f"Error processing {title} at {company}: {e}")
            job["processing_status"] = "error"
            job["error"] = str(e)
            log_application(
                job_id=job_id, company=company, job_title=title,
                recruiter_email=None, email_subject="",
                status="failed", resume_path=""
            )

        processed.append(job)

    return {**state, "processed_jobs": processed}


# ─── Node 7: Report ───────────────────────────────────────────────────────────

def report_node(state: AgentState) -> AgentState:
    """Generate and print a summary of today's run."""
    logger.info("\nNODE 7: Generating run summary...")

    processed = state["processed_jobs"]
    total = len(processed)
    sent = sum(1 for j in processed if j.get("processing_status") in ("sent", "dry_run"))
    skipped = sum(1 for j in processed if "skip" in j.get("processing_status", ""))
    failed = sum(1 for j in processed if j.get("processing_status") in ("failed", "error"))

    all_apps = load_applications()

    summary = {
        "run_jobs_found": len(state["jobs"]),
        "run_jobs_filtered": len(state["filtered_jobs"]),
        "run_applications_sent": sent,
        "run_applications_skipped": skipped,
        "run_applications_failed": failed,
        "total_applications_all_time": len(all_apps),
        "dry_run": settings.DRY_RUN,
        "jobs_processed": [
            {
                "company": j.get("company"),
                "title": j.get("title"),
                "score": j.get("match_score", 0),
                "status": j.get("processing_status"),
                "recruiter_email": j.get("recruiter_email"),
            }
            for j in processed
        ]
    }

    logger.info("\n" + "=" * 50)
    logger.info("📊 JOB AGENT RUN SUMMARY")
    logger.info("=" * 50)
    logger.info(f"Jobs scraped:       {summary['run_jobs_found']}")
    logger.info(f"Jobs filtered:      {summary['run_jobs_filtered']}")
    logger.info(f"Applications sent:  {summary['run_applications_sent']}")
    logger.info(f"Skipped:            {summary['run_applications_skipped']}")
    logger.info(f"Failed:             {summary['run_applications_failed']}")
    logger.info(f"Total all-time:     {summary['total_applications_all_time']}")
    logger.info(f"Dry run mode:       {summary['dry_run']}")
    logger.info("=" * 50)

    return {**state, "summary": summary}


# ─── Graph Builder ────────────────────────────────────────────────────────────

def build_agent() -> any:
    """Build and compile the LangGraph job agent."""
    graph = StateGraph(AgentState)

    graph.add_node("scrape_jobs", scrape_jobs_node)
    graph.add_node("filter_jobs", filter_jobs_node)
    graph.add_node("process_jobs", process_jobs_node)
    graph.add_node("report", report_node)

    graph.set_entry_point("scrape_jobs")
    graph.add_edge("scrape_jobs", "filter_jobs")
    graph.add_edge("filter_jobs", "process_jobs")
    graph.add_edge("process_jobs", "report")
    graph.add_edge("report", END)

    return graph.compile()


def run_agent():
    """Run the full job agent pipeline."""
    import uuid
    from datetime import datetime

    agent = build_agent()
    initial_state: AgentState = {
        "jobs": [],
        "filtered_jobs": [],
        "current_job": None,
        "processed_jobs": [],
        "errors": [],
        "summary": {},
        "run_id": str(uuid.uuid4())[:8],
    }

    logger.info(f"\n🤖 Job Agent starting — Run ID: {initial_state['run_id']}")
    logger.info(f"Targets: {settings.JOB_TITLES}")
    logger.info(f"Locations: {settings.JOB_LOCATIONS}")
    logger.info(f"Dry run: {settings.DRY_RUN}\n")

    result = agent.invoke(initial_state)
    return result["summary"]
