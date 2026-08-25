from pydantic import BaseModel


class RecruiterFindRequest(BaseModel):
    company: str
    job_title: str
