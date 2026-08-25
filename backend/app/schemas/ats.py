from pydantic import BaseModel


class ATSCheckRequest(BaseModel):
    resume: dict
    job_description: str


class ATSCheckResponse(BaseModel):
    score: float
    target_band: str
    matched_keywords: list[str]
    missing_keywords: list[str]
    recommendations: list[str]
    parseability: dict
