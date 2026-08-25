from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import Resume, ResumeVersion
from app.schemas.resume import TailorRequest
from app.services.resume_service import (
    DEFAULT_MASTER_RESUME,
    tailor_resume,
)

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.get("/master")
async def get_master_resume():
    return DEFAULT_MASTER_RESUME


@router.get("/application/{application_id}")
async def get_resume_for_application(
    application_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Resume).where(Resume.application_id == application_id)
    )
    resume = result.scalar_one_or_none()

    if not resume:
        return {"resume": None, "versions": []}

    versions_result = await db.execute(
        select(ResumeVersion)
        .where(ResumeVersion.resume_id == resume.id)
        .order_by(ResumeVersion.version.desc())
    )
    versions = versions_result.scalars().all()

    return {
        "resume": {
            "id": resume.id,
            "template_id": resume.template_id,
            "base_resume": resume.base_resume,
            "tailored_resume": resume.tailored_resume,
        },
        "versions": [
            {
                "id": v.id,
                "version": v.version,
                "ats_score": v.ats_score,
                "created_at": v.created_at.isoformat(),
            }
            for v in versions
        ],
    }


@router.post("/tailor")
async def tailor(payload: TailorRequest, db: AsyncSession = Depends(get_db)):
    try:
        version = await tailor_resume(db, payload.application_id)
        return version
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))