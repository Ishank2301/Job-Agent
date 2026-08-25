import asyncio
import logging
import random
import re
from typing import Optional

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
}

COMPANY_DOMAIN_OVERRIDES = {
    "google": "google.com",
    "microsoft": "microsoft.com",
    "amazon": "amazon.com",
    "meta": "meta.com",
    "flipkart": "flipkart.com",
    "infosys": "infosys.com",
    "tcs": "tcs.com",
    "wipro": "wipro.com",
    "zoho": "zoho.com",
    "razorpay": "razorpay.com",
    "swiggy": "swiggy.com",
    "zomato": "zomato.com",
    "cred": "cred.club",
    "atlassian": "atlassian.com",
}

HR_KEYWORDS = [
    "talent",
    "recruiter",
    "hr ",
    "human resources",
    "hiring",
    "people",
]


async def random_delay(low: float = 1.0, high: float = 2.0) -> None:
    await asyncio.sleep(random.uniform(low, high))


def parse_duckduckgo_domain(html: str) -> Optional[str]:
    soup = BeautifulSoup(html, "html.parser")
    results = soup.find_all("a", class_="result__url")

    for result in results[:3]:
        href = result.get_text(strip=True)

        if href and "." in href:
            domain = href.split("/")[0].replace("www.", "").strip()

            if domain and len(domain) > 3:
                return domain

    return None


def parse_duckduckgo_linkedin_result(html: str) -> tuple[Optional[str], Optional[str]]:
    soup = BeautifulSoup(html, "html.parser")
    results = soup.find_all("div", class_="result__body")

    for result in results[:5]:
        title_el = result.find("a", class_="result__a")
        snippet_el = result.find("a", class_="result__snippet")

        if not title_el:
            continue

        title_text = title_el.get_text(strip=True)
        snippet = snippet_el.get_text(strip=True) if snippet_el else ""

        if any(
            keyword in title_text.lower() or keyword in snippet.lower()
            for keyword in HR_KEYWORDS
        ):
            name = extract_name_from_linkedin_title(title_text)
            profile_url = title_el.get("href", "")

            if name:
                return name, profile_url

    return None, None


def extract_name_from_linkedin_title(title: str) -> Optional[str]:
    parts = title.split(" - ")

    if not parts:
        return None

    name = parts[0].strip()
    words = name.split()

    if 2 <= len(words) <= 4 and all(word.isalpha() for word in words):
        return name

    return None


async def find_company_domain(company_name: str) -> Optional[str]:
    clean = company_name.lower().strip()

    for key, domain in COMPANY_DOMAIN_OVERRIDES.items():
        if key in clean:
            return domain

    try:
        query = f"{company_name} official website".replace(" ", "+")
        url = f"https://html.duckduckgo.com/html/?q={query}"

        async with httpx.AsyncClient(headers=HEADERS, timeout=10) as client:
            response = await client.get(url)
            response.raise_for_status()

        domain = await asyncio.to_thread(parse_duckduckgo_domain, response.text)

        if domain:
            return domain

    except Exception as exc:
        logger.warning("Domain search failed for %s: %s", company_name, exc)

    safe = re.sub(r"[^a-z0-9]", "", clean)
    return f"{safe}.com" if safe else None


async def search_recruiter_linkedin(
    company_name: str, job_title: str
) -> tuple[Optional[str], Optional[str]]:
    try:
        query = (
            f"{company_name} HR recruiter talent acquisition site:linkedin.com".replace(
                " ", "+"
            )
        )
        url = f"https://html.duckduckgo.com/html/?q={query}"

        async with httpx.AsyncClient(headers=HEADERS, timeout=10) as client:
            response = await client.get(url)
            response.raise_for_status()

        return await asyncio.to_thread(parse_duckduckgo_linkedin_result, response.text)

    except Exception as exc:
        logger.warning("LinkedIn recruiter search failed: %s", exc)
        return None, None


def infer_recruiter_email(name: Optional[str], domain: Optional[str]) -> Optional[str]:
    if not domain:
        return None

    if not name:
        return f"hr@{domain}"

    parts = name.lower().split()

    if len(parts) < 2:
        return f"hr@{domain}"

    first, last = parts[0], parts[-1]

    return f"{first}.{last}@{domain}"


async def find_recruiter(company: str, job_title: str) -> dict:
    await random_delay(1, 2)

    domain = await find_company_domain(company)
    name, linkedin_url = await search_recruiter_linkedin(company, job_title)
    email = infer_recruiter_email(name, domain)

    return {
        "company": company,
        "name": name,
        "email": email,
        "linkedin_url": linkedin_url,
        "source": "duckduckgo_heuristics",
    }
