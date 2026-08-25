from datetime import datetime

from pydantic import BaseModel


class UnifiedJob(BaseModel):
    external_id: str
    title: str
    company: str
    location: str
    url: str
    source: str
    description: str | None = None
    salary: str | None = None
    skills: list[str] = []
    date_posted: datetime | None = None


class JobRead(BaseModel):
    id: str
    external_id: str
    title: str
    company: str
    location: str
    url: str
    source: str
    description: str | None
    salary: str | None
    skills: list[str]
    date_posted: datetime | None
    scraped_at: datetime
