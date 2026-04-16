"""
Central configuration — all settings loaded from .env
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:

    # LLM: Select the llm model or any ollama local model:
    OLLAMA_HOST: str = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3")

    # Gmail
    GMAIL_ADDRESS: str = os.getenv("GMAIL_ADDRESS", "")
    GMAIL_APP_PASSWORD: str = os.getenv(
        "GMAIL_APP_PASSWORD", ""
    )  # Gmail App Password, not account password

    #  Job Search
    JOB_TITLES: list = os.getenv(
        "JOB_TITLES", "ML Engineer,Data Scientist,AI Engineer"
    ).split(",")
    JOB_LOCATIONS: list = os.getenv("JOB_LOCATIONS", "Bangalore,Remote,India").split(
        ","
    )
    EXPERIENCE_LEVEL: str = os.getenv(
        "EXPERIENCE_LEVEL", "internship"
    )  # internship | entry | mid
    MAX_JOBS_PER_RUN: int = int(os.getenv("MAX_JOBS_PER_RUN", "20"))
    APPLY_COOLDOWN_HOURS: int = int(os.getenv("APPLY_COOLDOWN_HOURS", "24"))

    #  Resume
    BASE_RESUME_PATH: str = os.getenv(
        "BASE_RESUME_PATH", "data/resumes/base_resume.txt"
    )
    TAILORED_RESUME_DIR: str = os.getenv("TAILORED_RESUME_DIR", "data/resumes/tailored")

    #  Paths
    JOBS_DB_PATH: str = os.getenv("JOBS_DB_PATH", "data/jobs/jobs.json")
    APPLICATIONS_LOG: str = os.getenv(
        "APPLICATIONS_LOG", "data/applications/applications.json"
    )

    #  Scheduler
    SCHEDULE_CRON: str = os.getenv("SCHEDULE_CRON", "0 9 * * *")  # daily at 9 AM

    #  Safety
    DRY_RUN: bool = (
        os.getenv("DRY_RUN", "true").lower() == "true"
    )  # set false to actually send emails
    MAX_EMAILS_PER_DAY: int = int(os.getenv("MAX_EMAILS_PER_DAY", "10"))
    BLACKLIST_COMPANIES: list = os.getenv("BLACKLIST_COMPANIES", "").split(",")


settings = Settings()
