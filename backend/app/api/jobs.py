from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import Job
from app.schemas.job import JobRead
from app.services.job_scraper_service import scrape_all_jobs

router = APIRouter(prefix="/jobs", tags=["jobs"])


async def persist_scraped_jobs() -> None:
    from app.db.session import AsyncSessionLocal

    jobs = await scrape_all_jobs()

    if not jobs:
        return

    scraped_urls = list({job.url for job in jobs})
    scraped_external_ids = list({job.external_id for job in jobs})

    async with AsyncSessionLocal() as db:
        existing_urls_result = await db.execute(
            select(Job.url).where(Job.url.in_(scraped_urls))
        )
        existing_urls = {row[0] for row in existing_urls_result.all()}

        existing_external_ids_result = await db.execute(
            select(Job.external_id).where(Job.external_id.in_(scraped_external_ids))
        )
        existing_external_ids = {row[0] for row in existing_external_ids_result.all()}

        for job in jobs:
            if job.url in existing_urls or job.external_id in existing_external_ids:
                continue

            db.add(
                Job(
                    external_id=job.external_id,
                    title=job.title,
                    company=job.company,
                    location=job.location,
                    url=job.url,
                    source=job.source,
                    description=job.description,
                    salary=job.salary,
                    experience_level=job.experience_level,
                    domain=job.domain,
                    skills=job.skills,
                    date_posted=job.date_posted,
                )
            )

        await db.commit()


@router.post("/scrape", status_code=202)
async def trigger_scrape(background_tasks: BackgroundTasks):
    background_tasks.add_task(persist_scraped_jobs)
    return {"status": "scrape_queued"}


@router.get("", response_model=list[JobRead])
async def list_jobs(
    db: AsyncSession = Depends(get_db),
    location: Optional[str] = Query(None),
    domain: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    query = select(Job)

    if location:
        query = query.where(Job.location.ilike(f"%{location}%"))
    if domain:
        query = query.where(Job.domain == domain)
    if experience_level:
        query = query.where(Job.experience_level == experience_level)
    if search:
        query = query.where(Job.title.ilike(f"%{search}%") | Job.company.ilike(f"%{search}%"))

    result = await db.execute(query.order_by(Job.scraped_at.desc()).limit(500))
    return result.scalars().all()
