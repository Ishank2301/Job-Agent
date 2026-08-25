from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import Recruiter
from app.schemas.recruiter import RecruiterFindRequest
from app.services.recruiter_service import find_recruiter

router = APIRouter(prefix="/recruiters", tags=["recruiters"])


@router.get("")
async def list_recruiters(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Recruiter).order_by(Recruiter.created_at.desc()))
    return result.scalars().all()


@router.post("/find")
async def find_recruiter_endpoint(
    payload: RecruiterFindRequest, db: AsyncSession = Depends(get_db)
):
    data = await find_recruiter(payload.company, payload.job_title)

    if data.get("email"):
        existing = await db.execute(
            select(Recruiter).where(Recruiter.email == data["email"])
        )
        recruiter = existing.scalar_one_or_none()

        if not recruiter:
            recruiter = Recruiter(**data)
            db.add(recruiter)
            await db.commit()
            await db.refresh(recruiter)

        return recruiter

    return data
