from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import UserProfile
from app.schemas.profile import UserProfileIn, UserProfileOut

router = APIRouter(prefix="/profile", tags=["profile"])

EMAIL_RE_STRICT = ("@", ".")


def _out(profile: UserProfile) -> UserProfileOut:
    return UserProfileOut(
        email=profile.email,
        full_name=profile.full_name,
        career_stage=profile.career_stage,
        target_roles=list(profile.target_roles or []),
        target_locations=profile.target_locations,
        remote_only=profile.remote_only,
        weekly_goal=profile.weekly_goal,
        onboarded=profile.onboarded,
    )


@router.get("", response_model=UserProfileOut)
async def get_profile(email: str, db: AsyncSession = Depends(get_db)):
    email = email.strip().lower()
    profile = await db.scalar(select(UserProfile).where(UserProfile.email == email))
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _out(profile)


@router.put("", response_model=UserProfileOut)
async def upsert_profile(payload: UserProfileIn, db: AsyncSession = Depends(get_db)):
    email = payload.email.strip().lower()
    if len(email) > 320 or not all(c in email for c in EMAIL_RE_STRICT):
        raise HTTPException(status_code=422, detail="Invalid email address")

    profile = await db.scalar(select(UserProfile).where(UserProfile.email == email))
    if not profile:
        profile = UserProfile(email=email)
        db.add(profile)

    profile.full_name = payload.full_name[:120]
    profile.career_stage = payload.career_stage[:60]
    profile.target_roles = payload.target_roles[:20]
    profile.target_locations = payload.target_locations[:255]
    profile.remote_only = payload.remote_only
    profile.weekly_goal = max(1, min(payload.weekly_goal, 200))
    profile.onboarded = payload.onboarded

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        profile = await db.scalar(select(UserProfile).where(UserProfile.email == email))
        if not profile:
            raise HTTPException(status_code=500, detail="Profile write failed")

    return _out(profile)
