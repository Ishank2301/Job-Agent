from pydantic import BaseModel


class RuntimeSettingsRead(BaseModel):
    dry_run: bool
    max_emails_per_day: int


class RuntimeSettingsUpdate(BaseModel):
    dry_run: bool | None = None
    max_emails_per_day: int | None = None
