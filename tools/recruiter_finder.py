"""
Recruiter Finder Tool
Finds recruiter contact info for a given company using:
1. LinkedIn search (public profiles)
2. Company website / careers page
3. Hunter.io pattern guessing
4. Email pattern inference (firstname@company.com etc.)
"""
import re
import requests
from bs4 import BeautifulSoup
from typing import Optional, Tuple
from utils.logger import get_logger
from tools.scraper import HEADERS, random_delay

logger = get_logger(__name__)

COMMON_EMAIL_PATTERNS = [
    "{first}@{domain}",
    "{first}.{last}@{domain}",
    "{f}{last}@{domain}",
    "hr@{domain}",
    "careers@{domain}",
    "recruit@{domain}",
    "talent@{domain}",
    "hiring@{domain}",
]

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


def find_company_domain(company_name: str) -> Optional[str]:
    """Find the main domain for a company."""
    clean = company_name.lower().strip()

    # Check overrides first
    for key, domain in COMPANY_DOMAIN_OVERRIDES.items():
        if key in clean:
            return domain

    # Try to find via DuckDuckGo
    try:
        query = f"{company_name} official website"
        url = f"https://html.duckduckgo.com/html/?q={query.replace(' ', '+')}"
        resp = requests.get(url, headers=HEADERS, timeout=8)
        soup = BeautifulSoup(resp.text, "html.parser")
        results = soup.find_all("a", class_="result__url")
        for r in results[:3]:
            href = r.get_text(strip=True)
            if href and "." in href:
                domain = href.split("/")[0].replace("www.", "")
                if domain and len(domain) > 3:
                    logger.info(f"Found domain for {company_name}: {domain}")
                    return domain
    except Exception as e:
        logger.warning(f"Domain search failed for {company_name}: {e}")

    # Fallback: guess from company name
    safe = re.sub(r"[^a-z0-9]", "", clean)
    return f"{safe}.com" if safe else None


def search_recruiter_linkedin(company_name: str, job_title: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Search LinkedIn for HR/recruiter at a company.
    Returns (name, profile_url) — email must be inferred separately.
    """
    try:
        query = f"{company_name} HR recruiter talent acquisition site:linkedin.com"
        url = f"https://html.duckduckgo.com/html/?q={query.replace(' ', '+')}"
        resp = requests.get(url, headers=HEADERS, timeout=8)
        soup = BeautifulSoup(resp.text, "html.parser")

        results = soup.find_all("div", class_="result__body")
        for result in results[:5]:
            title_el = result.find("a", class_="result__a")
            snippet_el = result.find("a", class_="result__snippet")
            if not title_el:
                continue

            title_text = title_el.get_text(strip=True)
            snippet = snippet_el.get_text(strip=True) if snippet_el else ""

            # Look for HR/recruiter profiles
            hr_keywords = ["talent", "recruiter", "hr ", "human resources", "hiring", "people"]
            if any(kw in title_text.lower() or kw in snippet.lower() for kw in hr_keywords):
                # Extract name from LinkedIn URL/title
                name = extract_name_from_linkedin_title(title_text)
                profile_url = title_el.get("href", "")
                if name:
                    logger.info(f"Found recruiter: {name} at {company_name}")
                    return name, profile_url

    except Exception as e:
        logger.warning(f"LinkedIn recruiter search failed: {e}")

    return None, None


def extract_name_from_linkedin_title(title: str) -> Optional[str]:
    """Extract person's name from LinkedIn search result title."""
    # LinkedIn titles: "John Doe - HR Manager at Company | LinkedIn"
    parts = title.split(" - ")
    if parts:
        name = parts[0].strip()
        # Validate it looks like a name (2 words, no special chars)
        words = name.split()
        if 2 <= len(words) <= 4 and all(w.isalpha() for w in words):
            return name
    return None


def infer_recruiter_email(
    name: Optional[str],
    company_name: str,
    domain: Optional[str]
) -> Optional[str]:
    """
    Infer recruiter email from name + domain using common patterns.
    If no name, tries generic HR emails.
    """
    if not domain:
        domain = find_company_domain(company_name)

    if not domain:
        return None

    if not name:
        # Return generic HR email
        return f"hr@{domain}"

    name_parts = name.lower().split()
    if len(name_parts) < 2:
        return f"hr@{domain}"

    first, last = name_parts[0], name_parts[-1]
    f = first[0]

    # Most common pattern
    email = f"{first}.{last}@{domain}"
    logger.info(f"Inferred recruiter email: {email}")
    return email


def find_recruiter(company: str, job_title: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Main entry point — find recruiter name and email for a company.
    Returns (name, email).
    """
    random_delay(1, 2)

    # Step 1: Find domain
    domain = find_company_domain(company)

    # Step 2: Search LinkedIn for recruiter
    name, _ = search_recruiter_linkedin(company, job_title)

    # Step 3: Infer email
    email = infer_recruiter_email(name, company, domain)

    if name or email:
        logger.info(f"Recruiter found — Name: {name}, Email: {email}")
    else:
        logger.warning(f"Could not find recruiter for {company}")

    return name, email
