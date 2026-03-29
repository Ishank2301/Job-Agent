"""
Job Scraper Tool
Scrapes job listings from LinkedIn, Naukri, Internshala, Indeed
using requests + BeautifulSoup (no Selenium required for most sources).
"""
import json
import time
import random
import hashlib
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict

from config.settings import settings
from utils.logger import get_logger

logger = get_logger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}


@dataclass
class JobListing:
    id: str
    title: str
    company: str
    location: str
    description: str
    apply_url: str
    source: str
    recruiter_email: Optional[str]
    recruiter_name: Optional[str]
    posted_date: str
    scraped_at: str
    status: str = "new"   # new | applied | rejected | interview


def make_job_id(title: str, company: str, source: str) -> str:
    raw = f"{title}{company}{source}".lower().replace(" ", "")
    return hashlib.md5(raw.encode()).hexdigest()[:12]


def random_delay(min_s: float = 1.5, max_s: float = 4.0):
    """Polite scraping — random delay between requests."""
    time.sleep(random.uniform(min_s, max_s))


# ─── Scrapers ────────────────────────────────────────────────────────────────

def scrape_linkedin(title: str, location: str) -> List[JobListing]:
    """Scrape LinkedIn job search results."""
    jobs = []
    try:
        encoded_title = title.replace(" ", "%20")
        encoded_loc = location.replace(" ", "%20")
        url = (
            f"https://www.linkedin.com/jobs/search/"
            f"?keywords={encoded_title}&location={encoded_loc}"
            f"&f_E=1,2&sortBy=DD"   # f_E=1,2 = internship + entry level
        )
        resp = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")

        cards = soup.find_all("div", class_="base-card")[:10]
        for card in cards:
            try:
                job_title = card.find("h3", class_="base-search-card__title")
                company = card.find("h4", class_="base-search-card__subtitle")
                loc = card.find("span", class_="job-search-card__location")
                link = card.find("a", class_="base-card__full-link")
                date_el = card.find("time")

                if not all([job_title, company, link]):
                    continue

                job = JobListing(
                    id=make_job_id(job_title.text.strip(), company.text.strip(), "linkedin"),
                    title=job_title.text.strip(),
                    company=company.text.strip(),
                    location=loc.text.strip() if loc else location,
                    description="",   # fetched separately
                    apply_url=link.get("href", ""),
                    source="linkedin",
                    recruiter_email=None,
                    recruiter_name=None,
                    posted_date=date_el.get("datetime", "") if date_el else "",
                    scraped_at=datetime.now().isoformat(),
                )
                jobs.append(job)
            except Exception as e:
                logger.warning(f"LinkedIn card parse error: {e}")
                continue

        logger.info(f"LinkedIn: scraped {len(jobs)} jobs for '{title}' in '{location}'")
    except Exception as e:
        logger.error(f"LinkedIn scrape failed: {e}")
    return jobs


def scrape_internshala(title: str) -> List[JobListing]:
    """Scrape Internshala for internships."""
    jobs = []
    try:
        encoded = title.lower().replace(" ", "-")
        url = f"https://internshala.com/internships/{encoded}-internship"
        resp = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")

        cards = soup.find_all("div", class_="internship_meta")[:8]
        for card in cards:
            try:
                job_title = card.find("h3", class_="job-internship-name")
                company = card.find("p", class_="company-name")
                loc = card.find("div", id=lambda x: x and "location_names" in x)
                link_tag = card.find_parent("div", class_="internship-heading-container")

                if not all([job_title, company]):
                    continue

                slug = card.get("data-internship_id", "")
                apply_url = f"https://internshala.com/internship/detail/{slug}" if slug else url

                job = JobListing(
                    id=make_job_id(job_title.text.strip(), company.text.strip(), "internshala"),
                    title=job_title.text.strip(),
                    company=company.text.strip(),
                    location=loc.text.strip() if loc else "India",
                    description="",
                    apply_url=apply_url,
                    source="internshala",
                    recruiter_email=None,
                    recruiter_name=None,
                    posted_date=datetime.now().strftime("%Y-%m-%d"),
                    scraped_at=datetime.now().isoformat(),
                )
                jobs.append(job)
            except Exception as e:
                logger.warning(f"Internshala card parse error: {e}")
                continue

        logger.info(f"Internshala: scraped {len(jobs)} internships for '{title}'")
    except Exception as e:
        logger.error(f"Internshala scrape failed: {e}")
    return jobs


def scrape_naukri(title: str, location: str) -> List[JobListing]:
    """Scrape Naukri.com for jobs."""
    jobs = []
    try:
        encoded_title = title.replace(" ", "-").lower()
        encoded_loc = location.replace(" ", "-").lower()
        url = f"https://www.naukri.com/{encoded_title}-jobs-in-{encoded_loc}"
        resp = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")

        cards = soup.find_all("article", class_="jobTuple")[:8]
        for card in cards:
            try:
                job_title = card.find("a", class_="title")
                company = card.find("a", class_="subTitle")
                loc_tags = card.find_all("li", class_="location")

                if not all([job_title, company]):
                    continue

                job = JobListing(
                    id=make_job_id(job_title.text.strip(), company.text.strip(), "naukri"),
                    title=job_title.text.strip(),
                    company=company.text.strip(),
                    location=", ".join(l.text.strip() for l in loc_tags) or location,
                    description="",
                    apply_url=job_title.get("href", url),
                    source="naukri",
                    recruiter_email=None,
                    recruiter_name=None,
                    posted_date=datetime.now().strftime("%Y-%m-%d"),
                    scraped_at=datetime.now().isoformat(),
                )
                jobs.append(job)
            except Exception as e:
                logger.warning(f"Naukri card parse error: {e}")
                continue

        logger.info(f"Naukri: scraped {len(jobs)} jobs for '{title}' in '{location}'")
    except Exception as e:
        logger.error(f"Naukri scrape failed: {e}")
    return jobs


def fetch_job_description(url: str) -> str:
    """Fetch full job description from the job page."""
    try:
        random_delay(1, 2)
        resp = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")

        # Try common JD containers
        for selector in [
            "div.show-more-less-html__markup",     # LinkedIn
            "div.job-description",
            "section.description",
            "div#job-details",
            "div.internship_details",              # Internshala
            "div.job-desc",
        ]:
            el = soup.select_one(selector)
            if el:
                return el.get_text(separator="\n", strip=True)[:3000]

        # Fallback: body text
        body = soup.find("body")
        return body.get_text(separator="\n", strip=True)[:2000] if body else ""
    except Exception as e:
        logger.warning(f"Failed to fetch JD from {url}: {e}")
        return ""


def scrape_all_jobs() -> List[JobListing]:
    """Run all scrapers and return deduplicated job list."""
    all_jobs: List[JobListing] = []
    seen_ids = set()

    for title in settings.JOB_TITLES:
        for location in settings.JOB_LOCATIONS:
            random_delay()
            jobs = scrape_linkedin(title, location)
            jobs += scrape_internshala(title)
            jobs += scrape_naukri(title, location)

            for job in jobs:
                if job.id not in seen_ids:
                    seen_ids.add(job.id)
                    all_jobs.append(job)

            if len(all_jobs) >= settings.MAX_JOBS_PER_RUN:
                break
        if len(all_jobs) >= settings.MAX_JOBS_PER_RUN:
            break

    # Fetch descriptions for top jobs
    logger.info(f"Fetching descriptions for {min(len(all_jobs), 10)} jobs...")
    for job in all_jobs[:10]:
        if job.apply_url:
            job.description = fetch_job_description(job.apply_url)
            random_delay()

    logger.info(f"Total unique jobs scraped: {len(all_jobs)}")
    return all_jobs


def save_jobs(jobs: List[JobListing]):
    """Save jobs to JSON database."""
    import os
    os.makedirs("data/jobs", exist_ok=True)
    try:
        existing = load_jobs()
        existing_ids = {j["id"] for j in existing}
        new_jobs = [asdict(j) for j in jobs if j.id not in existing_ids]
        existing.extend(new_jobs)
        with open(settings.JOBS_DB_PATH, "w") as f:
            json.dump(existing, f, indent=2)
        logger.info(f"Saved {len(new_jobs)} new jobs to database")
    except Exception as e:
        logger.error(f"Failed to save jobs: {e}")


def load_jobs() -> List[Dict]:
    """Load jobs from JSON database."""
    try:
        with open(settings.JOBS_DB_PATH) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []
