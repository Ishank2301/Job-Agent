from pydantic import BaseModel


class EmailDraftCreate(BaseModel):
    application_id: str


class EmailDraftRead(BaseModel):
    id: str
    application_id: str
    to_email: str
    subject: str
    body: str
    status: str
    dry_run: bool
