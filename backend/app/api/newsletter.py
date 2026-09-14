import re

from app.db.session import get_db
from app.models import NewsletterSubscriber
from app.schemas.newsletter import NewsletterSubscribeIn, NewsletterSubscribeOut
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")


@router.post("/subscribe", response_model=NewsletterSubscribeOut)
async def subscribe(
    payload: NewsletterSubscribeIn, db: AsyncSession = Depends(get_db)
):
    """Store a newsletter opt-in. Idempotent — re-subscribing is a no-op."""
    email = payload.email.strip().lower()

    if len(email) > 320 or not EMAIL_RE.fullmatch(email):
        raise HTTPException(status_code=422, detail="Invalid email address")

    existing = await db.scalar(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)
    )
    if existing:
        return NewsletterSubscribeOut(email=email, status="already_subscribed")

    db.add(NewsletterSubscriber(email=email))
    try:
        await db.commit()
    except IntegrityError:
        # Raced with a concurrent subscribe for the same address.
        await db.rollback()
        return NewsletterSubscribeOut(email=email, status="already_subscribed")

    return NewsletterSubscribeOut(email=email, status="subscribed")
