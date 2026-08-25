import asyncio
import hashlib
import logging
from datetime import datetime

import pandas as pd
from jobspy import scrape_jobs

from app.core.config import settings
from app.schemas.job import UnifiedJob

logger = logging.getLogger(__name__)

TECH_KEYWORDS = [
    "python",
    "machine learning",
    "deep learning",
    "pytorch",
    "tensorflow",
    "langchain",
    "langgraph",
    "nlp",
    "data science",
    "ml",
    "ai",
    "scikit",
    "pandas",
    "numpy",
    "sql",
    "docker",
    "git",
    "api",
    "rag",
    "llm",
    "transformers",
    "opencv",
    "flask",
    "fastapi",
    "streamlit",
    "mlflow",
]


def make_external_id(title: str, company: str, source: str, url: str) -> str:
    raw = f"{title}|{company}|{source}|{url}".lower().strip()
    return hashlib.sha256(raw.encode()).hexdigest()[:24]


def extract_skills(text: str | None) -> list[str]:
    if not text:
        return []

    lowered = text.lower()
    return [keyword for keyword in TECH_KEYWORDS if keyword in lowered]


def clean(value) -> str:
    if value is None:
        return ""

    text_value = str(value).strip()

    if text_value.lower() in {"nan", "none", "nat"}:
        return ""

    return text_value


def map_row_to_unified_job(row: dict) -> UnifiedJob | None:
    title = clean(row.get("title"))
    company = clean(row.get("company"))
    source = clean(row.get("site"))
    url = clean(row.get("job_url"))

    if not title or not company or not url:
        return None

    date_posted = row.get("date_posted")

    if hasattr(date_posted, "isoformat"):
        posted = date_posted
    else:
        posted = None

    description = clean(row.get("description")) or None

    return UnifiedJob(
        external_id=make_external_id(title, company, source, url),
        title=title,
        company=company,
        location=clean(row.get("location")),
        url=url,
        source=source,
        description=description,
        salary=None,
        skills=extract_skills(description),
        date_posted=posted,
    )


async def scrape_jobspy_site(site: str, title: str, location: str) -> list[UnifiedJob]:
    def _blocking_scrape():
        glassdoor_location = location

        if site == "glassdoor":
            if "," not in location and location.lower() not in {"remote", "india"}:
                glassdoor_location = f"{location}, {settings.INDEED_COUNTRY}"

        return scrape_jobs(
            site_name=[site],
            search_term=title,
            location=glassdoor_location if site == "glassdoor" else location,
            results_wanted=settings.SCRAPER_RESULTS_WANTED,
            hours_old=settings.SCRAPER_HOURS_OLD,
            country_indeed=settings.INDEED_COUNTRY,
            linkedin_fetch_description=True,
            description_format="markdown",
            verbose=0,
        )

    df = await asyncio.to_thread(_blocking_scrape)

    if df is None or df.empty:
        return []

    jobs: list[UnifiedJob] = []

    for row in df.to_dict(orient="records"):
        job = map_row_to_unified_job(row)

        if job:
            jobs.append(job)

    return jobs


async def scrape_all_jobs() -> list[UnifiedJob]:
    all_jobs: list[UnifiedJob] = []
    seen: set[str] = set()

    for title in settings.job_titles_list:
        for location in settings.job_locations_list:
            if len(all_jobs) >= settings.MAX_JOBS_PER_RUN:
                break

            for site in settings.scraper_sites_list:
                try:
                    logger.info("Scraping %s for %s in %s", site, title, location)

                    jobs = await scrape_jobspy_site(site, title, location)

                    if not jobs:
                        logger.warning(
                            "Source %s returned zero jobs for %s in %s",
                            site,
                            title,
                            location,
                        )

                    for job in jobs:
                        if job.external_id in seen:
                            continue

                        seen.add(job.external_id)
                        all_jobs.append(job)

                        if len(all_jobs) >= settings.MAX_JOBS_PER_RUN:
                            break

                except Exception as exc:
                    logger.error(
                        "Source %s failed for %s in %s: %s",
                        site,
                        title,
                        location,
                        exc,
                    )

    return all_jobs
