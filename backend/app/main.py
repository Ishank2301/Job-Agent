from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.api import (
    applications,
    ats,
    autofill,
    emails,
    jobs,
    recruiters,
    resumes,
    settings,
)
from app.core.config import settings as app_settings

if app_settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=app_settings.SENTRY_DSN,
        environment=app_settings.ENVIRONMENT,
        traces_sample_rate=0.1,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Job Application Agent API",
    version="2.0.0",
    lifespan=lifespan,
)

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[app_settings.RATE_LIMIT_DEFAULT],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "environment": app_settings.ENVIRONMENT,
        "dry_run": app_settings.DRY_RUN,
    }


app.include_router(jobs.router, prefix="/api/v1")
app.include_router(applications.router, prefix="/api/v1")
app.include_router(recruiters.router, prefix="/api/v1")
app.include_router(resumes.router, prefix="/api/v1")
app.include_router(ats.router, prefix="/api/v1")
app.include_router(emails.router, prefix="/api/v1")
app.include_router(settings.router, prefix="/api/v1")
app.include_router(autofill.router, prefix="/api/v1")
