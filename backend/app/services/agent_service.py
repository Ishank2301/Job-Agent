import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Application, ApplicationStatus, Job, Recruiter
from app.services import email_service, recruiter_service, resume_service

logger = logging.getLogger(__name__)


async def run_application_pipeline(db: AsyncSession, application_id: str) -> dict:
    application = await db.get(Application, application_id)

    if not application:
        raise ValueError("Application not found")

    job = await db.get(Job, application.job_id)

    if not job:
        raise ValueError("Job not found")

    result = {
        "application_id": application_id,
        "job_id": job.id,
        "recruiter_found": False,
        "resume_tailored": False,
        "email_draft_created": False,
        "status": "COMPLETED_WITH_HUMAN_CONFIRMATION_REQUIRED",
    }

    recruiter_data = await recruiter_service.find_recruiter(job.company, job.title)

    recruiter_email = recruiter_data.get("email")

    if recruiter_email:
        recruiter_result = await db.execute(
            select(Recruiter).where(Recruiter.email == recruiter_email)
        )

        recruiter = recruiter_result.scalar_one_or_none()

        if not recruiter:
            recruiter = Recruiter(
                company=job.company,
                name=recruiter_data.get("name"),
                email=recruiter_email,
                linkedin_url=recruiter_data.get("linkedin_url"),
                source=recruiter_data.get("source"),
            )
            db.add(recruiter)
            await db.commit()
            await db.refresh(recruiter)

        application.recruiter_id = recruiter.id
        result["recruiter_found"] = True

    try:
        await resume_service.tailor_resume(db, application_id)
        result["resume_tailored"] = True
    except Exception as exc:
        logger.error("Resume tailoring failed: %s", exc)

    if application.status == ApplicationStatus.SAVED:
        application.status = ApplicationStatus.APPLIED

    await db.commit()

    if recruiter_email:
        try:
            await email_service.create_email_draft(db, application_id)
            result["email_draft_created"] = True
        except Exception as exc:
            logger.error("Email draft failed: %s", exc)

    return result
