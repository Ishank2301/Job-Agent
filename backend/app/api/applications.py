from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import Application, ApplicationStatus, Job
from app.schemas.application import (
    ApplicationCreate,
    ApplicationRead,
    ApplicationStatusUpdate,
)
from app.services.agent_service import run_application_pipeline
from app.services.state_machine import can_transition

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=ApplicationRead)
async def create_application(
    payload: ApplicationCreate, db: AsyncSession = Depends(get_db)
):
    job = await db.get(Job, payload.job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = await db.execute(
        select(Application).where(Application.job_id == payload.job_id)
    )

    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=409, detail="Application already exists for this job"
        )

    application = Application(job_id=payload.job_id)
    db.add(application)
    await db.commit()
    await db.refresh(application)

    return application


@router.get("", response_model=list[ApplicationRead])
async def list_applications(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Application).order_by(Application.created_at.desc())
    )
    return result.scalars().all()


@router.patch("/{application_id}/status", response_model=ApplicationRead)
async def update_application_status(
    application_id: str,
    payload: ApplicationStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    application = await db.get(Application, application_id)

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    try:
        next_status = ApplicationStatus(payload.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")

    if not can_transition(application.status, next_status):
        raise HTTPException(
            status_code=409,
            detail=f"Invalid state transition: {application.status.value} -> {next_status.value}",
        )

    application.status = next_status
    await db.commit()
    await db.refresh(application)

    return application


@router.post("/{application_id}/run-agent", status_code=202)
async def run_agent(
    application_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    application = await db.get(Application, application_id)

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    async def _run():
        from app.db.session import AsyncSessionLocal

        async with AsyncSessionLocal() as session:
            await run_application_pipeline(session, application_id)

    background_tasks.add_task(_run)

    return {"status": "agent_queued", "application_id": application_id}
