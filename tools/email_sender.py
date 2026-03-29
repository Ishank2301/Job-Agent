"""
Cold Email Tool
Writes personalized cold emails to recruiters using Ollama LLM,
then sends them via Gmail SMTP.
"""
import smtplib
import json
import os
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional

from config.settings import settings
from tools.resume_tailor import call_ollama
from utils.logger import get_logger

logger = get_logger(__name__)


# ─── Email Writer ─────────────────────────────────────────────────────────────

def write_cold_email(
    recruiter_name: Optional[str],
    company: str,
    job_title: str,
    job_description: str,
    tailored_resume: str,
) -> dict:
    """
    Use Ollama to write a personalized cold email / referral request.
    Returns dict with subject and body.
    """
    base_resume = tailored_resume[:1000]
    greeting = f"Hi {recruiter_name.split()[0]}," if recruiter_name else "Hi there,"

    system = """You are an expert career coach writing cold emails for internship/job referrals.
Write concise, genuine, and professional cold emails.
Rules:
- Keep email under 200 words
- Sound human, not robotic
- Show genuine interest in the company
- Mention 1-2 specific skills relevant to the role
- End with a clear, low-pressure ask for a referral or call
- Do NOT use generic phrases like "I hope this finds you well"
- Output ONLY: SUBJECT: <subject line> followed by EMAIL BODY: <email body>
"""

    prompt = f"""
Write a cold email for a referral request with these details:

Applicant's key skills (from resume):
{base_resume[:600]}

Target Role: {job_title}
Company: {company}
Key JD requirements: {job_description[:500]}

Greeting to use: {greeting}
Sender name: [Applicant Name — will be filled in]

Output format:
SUBJECT: <subject line>
EMAIL BODY:
<full email body>
"""

    logger.info(f"Writing cold email for {job_title} at {company}...")
    response = call_ollama(prompt, system)

    if not response:
        return _fallback_email(recruiter_name, company, job_title)

    # Parse subject and body
    subject = ""
    body = ""
    lines = response.strip().split("\n")
    body_start = False
    for line in lines:
        if line.upper().startswith("SUBJECT:"):
            subject = line.split(":", 1)[1].strip()
        elif "EMAIL BODY:" in line.upper():
            body_start = True
        elif body_start:
            body += line + "\n"

    if not subject:
        subject = f"Referral Request — {job_title} at {company}"
    if not body.strip():
        body = response

    return {"subject": subject.strip(), "body": body.strip()}


def _fallback_email(recruiter_name: Optional[str], company: str, job_title: str) -> dict:
    """Fallback email if LLM fails."""
    greeting = f"Hi {recruiter_name.split()[0]}," if recruiter_name else "Hi,"
    return {
        "subject": f"Referral Request – {job_title} at {company}",
        "body": f"""{greeting}

I came across the {job_title} opening at {company} and I'm genuinely excited about the role.
I'm a 3rd-year CS student with hands-on experience in Python, ML/AI, and open source development.
I've built production-grade projects using LangChain, LangGraph, and PyTorch, and contributed
to open source libraries.

I'd be incredibly grateful if you could refer me or share any advice on the application process.
I've attached my resume for your reference.

Thank you so much for your time!

Best regards,
[Your Name]
[LinkedIn] | [GitHub] | [Email]"""
    }


# ─── Email Sender ─────────────────────────────────────────────────────────────

def send_email(
    to_email: str,
    subject: str,
    body: str,
    resume_path: Optional[str] = None
) -> bool:
    """
    Send email via Gmail SMTP.
    Returns True if sent, False if failed.
    Respects DRY_RUN setting.
    """
    if settings.DRY_RUN:
        logger.info(f"[DRY RUN] Would send email to {to_email}")
        logger.info(f"[DRY RUN] Subject: {subject}")
        logger.info(f"[DRY RUN] Body preview: {body[:200]}...")
        return True  # Simulate success in dry run

    if not settings.GMAIL_ADDRESS or not settings.GMAIL_APP_PASSWORD:
        logger.error("Gmail credentials not configured in .env")
        return False

    try:
        msg = MIMEMultipart()
        msg["From"] = settings.GMAIL_ADDRESS
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        # Attach resume if available
        if resume_path and os.path.exists(resume_path):
            with open(resume_path, "rb") as f:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(f.read())
            encoders.encode_base64(part)
            filename = os.path.basename(resume_path)
            part.add_header("Content-Disposition", f"attachment; filename={filename}")
            msg.attach(part)

        # Send via Gmail SMTP
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(settings.GMAIL_ADDRESS, settings.GMAIL_APP_PASSWORD)
            server.sendmail(settings.GMAIL_ADDRESS, to_email, msg.as_string())

        logger.info(f"Email sent successfully to {to_email}")
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error("Gmail auth failed — check GMAIL_APP_PASSWORD in .env")
        return False
    except Exception as e:
        logger.error(f"Email send failed to {to_email}: {e}")
        return False


# ─── Application Logger ───────────────────────────────────────────────────────

def log_application(
    job_id: str,
    company: str,
    job_title: str,
    recruiter_email: Optional[str],
    email_subject: str,
    status: str,
    resume_path: str
):
    """Log every application attempt to JSON file."""
    os.makedirs("data/applications", exist_ok=True)
    try:
        try:
            with open(settings.APPLICATIONS_LOG) as f:
                apps = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            apps = []

        apps.append({
            "job_id": job_id,
            "company": company,
            "job_title": job_title,
            "recruiter_email": recruiter_email,
            "email_subject": email_subject,
            "status": status,   # sent | dry_run | failed | skipped
            "resume_path": resume_path,
            "applied_at": datetime.now().isoformat(),
        })

        with open(settings.APPLICATIONS_LOG, "w") as f:
            json.dump(apps, f, indent=2)

    except Exception as e:
        logger.error(f"Failed to log application: {e}")


def load_applications() -> list:
    """Load all logged applications."""
    try:
        with open(settings.APPLICATIONS_LOG) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def already_applied(job_id: str) -> bool:
    """Check if we already applied to this job."""
    apps = load_applications()
    return any(a["job_id"] == job_id for a in apps)


def emails_sent_today() -> int:
    """Count emails sent today."""
    apps = load_applications()
    today = datetime.now().strftime("%Y-%m-%d")
    return sum(
        1 for a in apps
        if a.get("status") in ("sent", "dry_run")
        and a.get("applied_at", "").startswith(today)
    )
