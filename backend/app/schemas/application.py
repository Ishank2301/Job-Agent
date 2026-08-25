from datetime import datetime

from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    job_id: str


class ApplicationStatusUpdate(BaseModel):
    status: str


class ApplicationRead(BaseModel):
    id: str
    job_id: str
    recruiter_id: str | None
    status: str
    ats_score: float | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
