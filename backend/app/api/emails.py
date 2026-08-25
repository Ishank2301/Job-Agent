from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.email import EmailDraftCreate
from app.services import email_service

router = APIRouter(prefix="/emails", tags=["emails"])


@router.post("/draft", status_code=201)
async def create_draft(payload: EmailDraftCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await email_service.create_email_draft(db, payload.application_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/{draft_id}/approve")
async def approve_draft(draft_id: str, db: AsyncSession = Depends(get_db)):
    try:
        return await email_service.approve_email_draft(db, draft_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/{draft_id}/send")
async def send_draft(draft_id: str, db: AsyncSession = Depends(get_db)):
    try:
        return await email_service.send_approved_email(db, draft_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
