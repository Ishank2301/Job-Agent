import asyncio
import logging
import os
import time
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import httpx
from playwright.async_api import Page, async_playwright
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import AutofillSession

logger = logging.getLogger(__name__)


class AutofillState(str, Enum):
    PENDING = "PENDING"
    FILLING = "FILLING"
    CONFIRMATION_REQUIRED = "CONFIRMATION_REQUIRED"
    CONFIRMATION_APPROVED = "CONFIRMATION_APPROVED"
    AWAITING_MANUAL_SUBMIT = "AWAITING_MANUAL_SUBMIT"
    MANUAL_SUBMIT_BLOCKED_HEADLESS = "MANUAL_SUBMIT_BLOCKED_HEADLESS"
    CONFIRMATION_TIMEOUT = "CONFIRMATION_TIMEOUT"
    UNSUPPORTED = "UNSUPPORTED"
    FAILED = "FAILED"


class AutofillProvider(str, Enum):
    GREENHOUSE = "greenhouse"
    LEVER = "lever"


ACTIVE_BROWSERS: dict[str, tuple[Any, Any, Any, Any]] = {}

SELECTOR_MAPPINGS: dict[str, dict[str, list[str]]] = {
    "greenhouse": {
        "first_name": [
            "input[name='first_name']",
            "#first_name",
            "input[name='first']",
        ],
        "last_name": [
            "input[name='last_name']",
            "#last_name",
            "input[name='last']",
        ],
        "email": [
            "input[name='email']",
            "#email",
            "input[type='email']",
        ],
        "phone": [
            "input[name='phone']",
            "#phone",
            "input[type='tel']",
        ],
        "location": [
            "input[name='location']",
            "#location",
        ],
        "linkedin": [
            "input[name='linkedin']",
            "input[name='linkedin_url']",
        ],
        "website": [
            "input[name='website']",
            "input[name='url']",
        ],
        "cover_letter": [
            "textarea[name='cover_letter']",
            "#cover_letter",
            "textarea",
        ],
        "resume": [
            "input[type='file']",
        ],
    },
    "lever": {
        "full_name": [
            "input[name='name']",
            "#name",
        ],
        "email": [
            "input[name='email']",
            "#email",
            "input[type='email']",
        ],
        "phone": [
            "input[name='phone']",
            "#phone",
            "input[type='tel']",
        ],
        "location": [
            "input[name='location']",
            "#location",
        ],
        "linkedin": [
            "input[name='linkedin']",
            "input[name='linkedinUrl']",
        ],
        "website": [
            "input[name='website']",
            "input[name='url']",
        ],
        "cover_letter": [
            "textarea[name='coverLetter']",
            "textarea",
        ],
        "resume": [
            "input[type='file']",
        ],
    },
}

LABEL_MAPPINGS: dict[str, list[str]] = {
    "first_name": ["first name", "given name"],
    "last_name": ["last name", "family name", "surname"],
    "full_name": ["full name", "name"],
    "email": ["email"],
    "phone": ["phone", "mobile"],
    "location": ["location", "city"],
    "linkedin": ["linkedin"],
    "website": ["website", "portfolio", "github"],
    "cover_letter": ["cover letter", "message"],
}


def detect_provider(url: str) -> AutofillProvider | None:
    host = urlparse(url).netloc.lower()

    if "greenhouse.io" in host:
        return AutofillProvider.GREENHOUSE

    if "lever.co" in host:
        return AutofillProvider.LEVER

    return None


class AutofillEngine:
    """
    Safety-critical Playwright autofill engine.

    Non-negotiable guardrail:
    - Never click submit.
    - Never interact with submit button before CONFIRMATION_REQUIRED.
    - Even after confirmation, do not auto-submit.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def _set_status(
        self,
        session: AutofillSession,
        status: AutofillState | str,
        screenshot_path: str | None = None,
        confirmation_url: str | None = None,
    ) -> None:
        session.status = status.value if isinstance(status, AutofillState) else status

        if screenshot_path:
            session.screenshot_path = screenshot_path

        if confirmation_url:
            session.confirmation_url = confirmation_url

        session.updated_at = datetime.utcnow()

        await self.db.commit()

    async def _wait_for_locator_by_selectors(self, page: Page, selectors: list[str]):
        for selector in selectors:
            locator = page.locator(selector).first

            try:
                await locator.wait_for(state="visible", timeout=750)
                return locator
            except Exception:
                continue

        return None

    async def _wait_for_locator_by_label(self, page: Page, labels: list[str]):
        for label in labels:
            locator = page.get_by_label(label, exact=False).first

            try:
                await locator.wait_for(state="visible", timeout=750)
                return locator
            except Exception:
                continue

        return None

    async def _fill_field(
        self,
        page: Page,
        provider: AutofillProvider,
        field: str,
        profile: dict[str, Any],
    ) -> bool:
        value = profile.get(field)

        if not value:
            return False

        selectors = SELECTOR_MAPPINGS.get(provider.value, {}).get(field, [])
        locator = await self._wait_for_locator_by_selectors(page, selectors)

        if locator:
            try:
                await locator.fill(str(value))
                logger.info("Filled field %s using selector", field)
                return True
            except Exception as exc:
                logger.warning("Could not fill field %s using selector: %s", field, exc)

        labels = LABEL_MAPPINGS.get(field, [])
        locator = await self._wait_for_locator_by_label(page, labels)

        if locator:
            try:
                await locator.fill(str(value))
                logger.info("Filled field %s using label", field)
                return True
            except Exception as exc:
                logger.warning("Could not fill field %s using label: %s", field, exc)

        return False

    async def _upload_resume(
        self,
        page: Page,
        provider: AutofillProvider,
        resume_path: str | None,
    ) -> bool:
        if not resume_path:
            return False

        path = Path(resume_path)

        if not path.exists():
            logger.warning("Resume path does not exist: %s", resume_path)
            return False

        selectors = SELECTOR_MAPPINGS.get(provider.value, {}).get("resume", [])
        locator = await self._wait_for_locator_by_selectors(page, selectors)

        if not locator:
            return False

        try:
            await locator.set_input_files(str(path))
            logger.info("Uploaded resume: %s", resume_path)
            return True
        except Exception as exc:
            logger.warning("Resume upload failed: %s", exc)
            return False

    async def _fill_form(
        self,
        page: Page,
        provider: AutofillProvider,
        profile: dict[str, Any],
        resume_path: str | None,
    ) -> None:
        fields = [
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone",
            "location",
            "linkedin",
            "website",
            "cover_letter",
        ]

        for field in fields:
            await self._fill_field(page, provider, field, profile)

        await self._upload_resume(page, provider, resume_path)

    async def _take_screenshot(self, page: Page, session_id: str) -> str:
        directory = Path("data/autofill")
        directory.mkdir(parents=True, exist_ok=True)

        path = directory / f"{session_id}.png"

        await page.screenshot(path=str(path), full_page=True)

        return str(path)

    async def _send_webhook(self, session: AutofillSession) -> None:
        if not settings.AUTOFILL_WEBHOOK_URL:
            logger.info("No AUTOFILL_WEBHOOK_URL configured. Skipping webhook.")
            return

        payload = {
            "session_id": session.id,
            "application_id": session.application_id,
            "provider": session.provider,
            "status": session.status,
            "url": session.url,
            "screenshot_path": session.screenshot_path,
            "confirmation_url": f"{settings.FRONTEND_URL}/autofill-review?id={session.id}",
            "approve_url": f"{settings.AUTOFILL_API_BASE_URL.rstrip('/')}/api/v1/autofill/confirmations/{session.id}/approve",
        }

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.post(settings.AUTOFILL_WEBHOOK_URL, json=payload)
        except Exception as exc:
            logger.error("Autofill webhook failed: %s", exc)

    async def _wait_for_confirmation(self, session_id: str) -> bool:
        url = f"{settings.AUTOFILL_API_BASE_URL.rstrip('/')}/api/v1/autofill/confirmations/{session_id}"
        deadline = time.monotonic() + settings.AUTOFILL_CONFIRM_TIMEOUT_SECONDS

        async with httpx.AsyncClient(timeout=10) as client:
            while time.monotonic() < deadline:
                try:
                    response = await client.get(url)

                    if response.status_code == 200:
                        data = response.json()

                        if (
                            data.get("status")
                            == AutofillState.CONFIRMATION_APPROVED.value
                        ):
                            return True
                except Exception as exc:
                    logger.warning("Confirmation polling failed: %s", exc)

                await asyncio.sleep(settings.AUTOFILL_POLL_SECONDS)

        return False

    async def run(self, session: AutofillSession) -> AutofillSession:
        provider = detect_provider(session.url)

        if provider is None:
            await self._set_status(session, AutofillState.UNSUPPORTED)
            return session

        session.provider = provider.value
        await self._set_status(session, AutofillState.FILLING)

        playwright = await async_playwright().start()

        browser = await playwright.chromium.launch(
            headless=settings.AUTOFILL_HEADLESS,
            args=["--disable-blink-features=AutomationControlled"],
        )

        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
        )

        page = await context.new_page()

        try:
            await page.goto(session.url, timeout=60000, wait_until="domcontentloaded")

            await self._fill_form(
                page=page,
                provider=provider,
                profile=session.profile_data or {},
                resume_path=session.resume_path,
            )

            screenshot_path = await self._take_screenshot(page, session.id)

            await self._set_status(
                session,
                AutofillState.CONFIRMATION_REQUIRED,
                screenshot_path=screenshot_path,
                confirmation_url=f"{settings.FRONTEND_URL}/autofill-review?id={session.id}",
            )

            await self._send_webhook(session)

            approved = await self._wait_for_confirmation(session.id)

            if not approved:
                await self._set_status(session, AutofillState.CONFIRMATION_TIMEOUT)
                await context.close()
                await browser.close()
                await playwright.stop()
                return session

            await self._set_status(session, AutofillState.CONFIRMATION_APPROVED)

            if settings.AUTOFILL_HEADLESS:
                await self._set_status(
                    session, AutofillState.MANUAL_SUBMIT_BLOCKED_HEADLESS
                )
                await context.close()
                await browser.close()
                await playwright.stop()
                return session

            # Keep browser open for manual human submission.
            # Do not close playwright/browser here.
            ACTIVE_BROWSERS[session.id] = (playwright, browser, context, page)

            await page.bring_to_front()
            await self._set_status(session, AutofillState.AWAITING_MANUAL_SUBMIT)

            return session

        except Exception as exc:
            logger.exception("Autofill engine failed: %s", exc)

            try:
                await self._set_status(session, AutofillState.FAILED)
            except Exception:
                pass

            await context.close()
            await browser.close()
            await playwright.stop()

            raise


async def close_active_browser(session_id: str) -> bool:
    """
    Optional cleanup endpoint helper.
    """
    if session_id not in ACTIVE_BROWSERS:
        return False

    playwright, browser, context, page = ACTIVE_BROWSERS.pop(session_id)

    try:
        await context.close()
        await browser.close()
        await playwright.stop()
        return True
    except Exception:
        return False
