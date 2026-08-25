from fastapi import APIRouter

from app.schemas.ats import ATSCheckRequest
from app.services.ats_service import score_resume

router = APIRouter(prefix="/ats", tags=["ats"])


@router.post("/check")
async def check_ats(payload: ATSCheckRequest):
    return score_resume(payload.resume, payload.job_description)
