from app.schemas.application import (
    ApplicationCreate,
    ApplicationRead,
    ApplicationStatusUpdate,
)
from app.schemas.ats import ATSCheckRequest, ATSCheckResponse
from app.schemas.autofill import AutofillSessionCreate, AutofillSessionRead
from app.schemas.email import EmailDraftCreate, EmailDraftRead
from app.schemas.job import JobRead, UnifiedJob
from app.schemas.recruiter import RecruiterFindRequest
from app.schemas.resume import MasterResume, TailorRequest
from app.schemas.settings import RuntimeSettingsRead, RuntimeSettingsUpdate
