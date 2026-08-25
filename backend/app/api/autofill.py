import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import AutofillSession
from app.schemas.autofill import AutofillSessionCreate, AutofillSessionRead

router = APIRouter(prefix="/autofill", tags=["autofill"])


def detect_provider(url: str) -> str | None:
    if "greenhouse.io" in url:
        return "greenhouse"

    if "lever.co" in url:
        return "lever"

    return None


@router.post("/sessions", response_model=AutofillSessionRead, status_code=202)
async def create_autofill_session(
    payload: AutofillSessionCreate, db: AsyncSession = Depends(get_db)
):
    provider = detect_provider(payload.url)

    if not provider:
        raise HTTPException(
            status_code=400, detail="Only Greenhouse and Lever are supported"
        )

    session = AutofillSession(
        id=str(uuid.uuid4()),
        application_id=payload.application_id,
        url=payload.url,
        provider=provider,
        status="PENDING",
        profile_data=payload.profile,
        resume_path=payload.resume_path,
    )

    db.add(session)
    await db.commit()
    await db.refresh(session)

    return session


@router.get("/confirmations/{session_id}", response_model=AutofillSessionRead)
async def get_confirmation(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AutofillSession).where(AutofillSession.id == session_id)
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="Autofill session not found")

    return session


@router.post("/confirmations/{session_id}/approve", response_model=AutofillSessionRead)
async def approve_confirmation(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AutofillSession).where(AutofillSession.id == session_id)
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="Autofill session not found")

    if session.status != "CONFIRMATION_REQUIRED":
        raise HTTPException(
            status_code=409, detail="Session is not awaiting confirmation"
        )

    session.status = "CONFIRMATION_APPROVED"
    await db.commit()
    await db.refresh(session)

    return session
