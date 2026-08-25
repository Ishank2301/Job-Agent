from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.settings import RuntimeSettingsRead, RuntimeSettingsUpdate
from app.services.email_service import get_runtime_setting, set_runtime_setting

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=RuntimeSettingsRead)
async def get_settings(db: AsyncSession = Depends(get_db)):
    dry_run = await get_runtime_setting(db, "dry_run", True)
    max_emails = await get_runtime_setting(db, "max_emails_per_day", 10)

    return RuntimeSettingsRead(
        dry_run=bool(dry_run), max_emails_per_day=int(max_emails)
    )


@router.patch("", response_model=RuntimeSettingsRead)
async def update_settings(
    payload: RuntimeSettingsUpdate, db: AsyncSession = Depends(get_db)
):
    if payload.dry_run is not None:
        await set_runtime_setting(db, "dry_run", payload.dry_run)

    if payload.max_emails_per_day is not None:
        await set_runtime_setting(db, "max_emails_per_day", payload.max_emails_per_day)

    dry_run = await get_runtime_setting(db, "dry_run", True)
    max_emails = await get_runtime_setting(db, "max_emails_per_day", 10)

    return RuntimeSettingsRead(
        dry_run=bool(dry_run), max_emails_per_day=int(max_emails)
    )
