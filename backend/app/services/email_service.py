import logging
from datetime import datetime

import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import (
    Application,
    AppSetting,
    EmailDraft,
    EmailDraftStatus,
    EmailLog,
    Job,
    Recruiter,
    Resume,
    ResumeVersion,
)
from app.services import llm_service

logger = logging.getLogger(__name__)

EMAIL_SYSTEM_PROMPT = """
You are an expert career coach writing cold emails for internship/job referrals.

Rules:
- Keep email under 200 words.
- Sound human, not robotic.
- Show genuine interest in the company.
- Mention 1-2 specific skills relevant to the role.
- End with a clear, low-pressure ask for a referral or call.
- Do NOT use generic phrases like "I hope this finds you well".
- Output ONLY JSON with keys: subject, body.
"""


async def get_runtime_setting(db: AsyncSession, key: str, default):
    setting = await db.get(AppSetting, key)

    if not setting:
        return default

    return setting.value


async def set_runtime_setting(db: AsyncSession, key: str, value) -> None:
    setting = await db.get(AppSetting, key)

    if setting:
        setting.value = value
    else:
        setting = AppSetting(key=key, value=value)
        db.add(setting)

    await db.commit()


async def emails_sent_today(db: AsyncSession, dry_run: bool) -> int:
    today = datetime.utcnow().date()

    statuses = ["sent"]

    if dry_run:
        statuses.append("dry_run")

    result = await db.execute(
        select(func.count(EmailLog.id)).where(
            EmailLog.status.in_(statuses),
            func.date(EmailLog.sent_at) == today,
        )
    )

    return int(result.scalar_one() or 0)


async def create_email_draft(db: AsyncSession, application_id: str) -> EmailDraft:
    application = await db.get(Application, application_id)

    if not application:
        raise ValueError("Application not found")

    job = await db.get(Job, application.job_id)

    if not job:
        raise ValueError("Job not found")

    recruiter = None

    if application.recruiter_id:
        recruiter = await db.get(Recruiter, application.recruiter_id)

    if not recruiter or not recruiter.email:
        raise ValueError("No recruiter email available for this application")

    resume_result = await db.execute(
        select(Resume).where(Resume.application_id == application_id)
    )
    resume = resume_result.scalar_one_or_none()

    resume_version = None

    if resume:
        version_result = await db.execute(
            select(ResumeVersion)
            .where(ResumeVersion.resume_id == resume.id)
            .order_by(ResumeVersion.version.desc())
            .limit(1)
        )
        resume_version = version_result.scalar_one_or_none()

    resume_text = ""

    if resume_version:
        resume_text = str(resume_version.content)[:1000]

    prompt = f"""
Write a cold email for a referral request.

Target Role: {job.title}
Company: {job.company}

Key JD requirements:
{(job.description or "")[:800]}

Applicant resume summary:
{resume_text}

Greeting:
Hi {recruiter.name.split()[0] if recruiter.name else "there"},

Return JSON:
{{
  "subject": "...",
  "body": "..."
}}
"""

    raw = await llm_service.generate_llm_response(
        system=EMAIL_SYSTEM_PROMPT,
        prompt=prompt,
        json_mode=True,
    )

    try:
        parsed = llm_service.extract_json(raw)
        subject = parsed.get(
            "subject", f"Referral Request — {job.title} at {job.company}"
        )
        body = parsed.get("body", "")
    except Exception:
        subject = f"Referral Request — {job.title} at {job.company}"
        body = raw

    dry_run = bool(await get_runtime_setting(db, "dry_run", settings.DRY_RUN))

    draft = EmailDraft(
        application_id=application_id,
        to_email=recruiter.email,
        subject=subject,
        body=body,
        resume_version_id=resume_version.id if resume_version else None,
        status=EmailDraftStatus.CONFIRMATION_REQUIRED,
        dry_run=dry_run,
    )

    db.add(draft)
    await db.commit()
    await db.refresh(draft)

    return draft


async def approve_email_draft(db: AsyncSession, draft_id: str) -> EmailDraft:
    draft = await db.get(EmailDraft, draft_id)

    if not draft:
        raise ValueError("Email draft not found")

    if draft.status != EmailDraftStatus.CONFIRMATION_REQUIRED:
        raise ValueError("Only CONFIRMATION_REQUIRED drafts can be approved")

    draft.status = EmailDraftStatus.APPROVED
    await db.commit()
    await db.refresh(draft)

    return draft


async def send_approved_email(db: AsyncSession, draft_id: str) -> EmailDraft:
    draft = await db.get(EmailDraft, draft_id)

    if not draft:
        raise ValueError("Email draft not found")

    if draft.status != EmailDraftStatus.APPROVED:
        raise ValueError("Only APPROVED drafts can be sent")

    dry_run = bool(await get_runtime_setting(db, "dry_run", settings.DRY_RUN))
    max_emails = int(
        await get_runtime_setting(db, "max_emails_per_day", settings.MAX_EMAILS_PER_DAY)
    )

    sent_today = await emails_sent_today(db, dry_run)

    if sent_today >= max_emails:
        draft.status = EmailDraftStatus.FAILED
        await db.commit()
        raise ValueError("Daily email cap reached")

    if dry_run:
        draft.status = EmailDraftStatus.DRY_RUN
        draft.sent_at = datetime.utcnow()

        log = EmailLog(
            email_draft_id=draft.id,
            application_id=draft.application_id,
            to_email=draft.to_email,
            subject=draft.subject,
            status="dry_run",
            dry_run=True,
        )

        db.add(log)
        await db.commit()
        await db.refresh(draft)

        logger.info("[DRY RUN] Would send email to %s", draft.to_email)

        return draft

    if not settings.GMAIL_ADDRESS or not settings.GMAIL_APP_PASSWORD:
        draft.status = EmailDraftStatus.FAILED
        await db.commit()
        raise ValueError("Gmail credentials not configured")

    message = MIMEMultipart()
    message["From"] = settings.GMAIL_ADDRESS
    message["To"] = draft.to_email
    message["Subject"] = draft.subject
    message.attach(MIMEText(draft.body, "plain"))

    try:
        await aiosmtplib.send(
            message,
            hostname="smtp.gmail.com",
            port=465,
            use_tls=True,
            username=settings.GMAIL_ADDRESS,
            password=settings.GMAIL_APP_PASSWORD,
        )

        draft.status = EmailDraftStatus.SENT
        draft.sent_at = datetime.utcnow()
        draft.dry_run = False

        log = EmailLog(
            email_draft_id=draft.id,
            application_id=draft.application_id,
            to_email=draft.to_email,
            subject=draft.subject,
            status="sent",
            dry_run=False,
        )

        db.add(log)
        await db.commit()
        await db.refresh(draft)

        return draft

    except Exception as exc:
        logger.error("Email send failed: %s", exc)

        draft.status = EmailDraftStatus.FAILED
        await db.commit()

        raise
