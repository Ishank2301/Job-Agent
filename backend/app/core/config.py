from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DRY_RUN: bool = True

    DATABASE_URL: str = (
        "postgresql+asyncpg://job_agent:job_agent@localhost:5432/job_agent"
    )

    CORS_ORIGINS: str = "http://localhost:3000"
    RATE_LIMIT_DEFAULT: str = "120/minute"

    JOB_TITLES: str = "ML Engineer,Data Scientist"
    JOB_LOCATIONS: str = "Bangalore,Remote"
    SCRAPER_SITES: str = "linkedin,indeed,glassdoor"
    MAX_JOBS_PER_RUN: int = 100
    SCRAPER_RESULTS_WANTED: int = 50
    SCRAPER_HOURS_OLD: int = 168
    INDEED_COUNTRY: str = "india"

    LLM_PROVIDER: str = "ollama"
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    GMAIL_ADDRESS: str = ""
    GMAIL_APP_PASSWORD: str = ""
    MAX_EMAILS_PER_DAY: int = 10

    FRONTEND_URL: str = "http://localhost:3000"
    AUTOFILL_API_BASE_URL: str = "http://localhost:8000"
    AUTOFILL_WEBHOOK_URL: str = ""
    AUTOFILL_HEADLESS: bool = False
    AUTOFILL_CONFIRM_TIMEOUT_SECONDS: int = 1800
    AUTOFILL_POLL_SECONDS: int = 5

    SENTRY_DSN: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]

    @property
    def job_titles_list(self) -> list[str]:
        return [title.strip() for title in self.JOB_TITLES.split(",") if title.strip()]

    @property
    def job_locations_list(self) -> list[str]:
        return [
            location.strip()
            for location in self.JOB_LOCATIONS.split(",")
            if location.strip()
        ]

    @property
    def scraper_sites_list(self) -> list[str]:
        return [
            site.strip().lower()
            for site in self.SCRAPER_SITES.split(",")
            if site.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
