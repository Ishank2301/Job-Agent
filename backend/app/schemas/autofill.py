from pydantic import BaseModel


class AutofillSessionCreate(BaseModel):
    application_id: str | None = None
    url: str
    profile: dict
    resume_path: str | None = None


class AutofillSessionRead(BaseModel):
    id: str
    application_id: str | None
    url: str
    provider: str
    status: str
    screenshot_path: str | None
    confirmation_url: str | None

    class Config:
        from_attributes = True
