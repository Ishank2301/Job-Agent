from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
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

    async with AsyncSessionLocal() as db:
        existing_urls_result = await db.execute(select(Job.url))
        existing_urls = {row[0] for row in existing_urls_result.all()}

        existing_external_ids_result = await db.execute(select(Job.external_id))
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
async def list_jobs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).order_by(Job.scraped_at.desc()).limit(200))
    return result.scalars().all()
