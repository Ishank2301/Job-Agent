"""
Resume Tailor Tool
Uses Ollama LLM to tailor the base resume to match a specific job description.
Outputs plain text + a formatted version ready to send.
"""
import os
import json
import requests
from datetime import datetime
from typing import Optional

from config.settings import settings
from utils.logger import get_logger

logger = get_logger(__name__)


def load_base_resume() -> str:
    """Load the base resume from file."""
    try:
        with open(settings.BASE_RESUME_PATH) as f:
            return f.read()
    except FileNotFoundError:
        logger.warning(f"Base resume not found at {settings.BASE_RESUME_PATH}")
        return _default_resume_template()


def _default_resume_template() -> str:
    """Default resume template — user should replace with their own."""
    return """
NAME: [Your Name]
EMAIL: [your.email@gmail.com]
PHONE: [+91-XXXXXXXXXX]
LINKEDIN: [linkedin.com/in/yourprofile]
GITHUB: [github.com/yourusername]

EDUCATION:
B.Tech Computer Science | [Your University] | 2022-2026 | CGPA: 8.5

SKILLS:
Languages: Python, JavaScript
ML/AI: TensorFlow, PyTorch, scikit-learn, LangChain, LangGraph
Data: Pandas, NumPy, SQL, FAISS
Tools: Git, Docker, GitHub Actions, MLflow

EXPERIENCE:
Open Source Contributor | Aeon (Time Series Library) | 2024
- Contributed time series classification improvements
- Merged 3 PRs improving model accuracy by 12%

PROJECTS:
MediBot — Medical RAG Chatbot
- LangGraph + LangChain + FAISS + MLflow
- Full CI/CD pipeline with GitHub Actions

Hackathon Projects
- Built 3 ML projects at national-level hackathons

ACHIEVEMENTS:
- Google Summer of Code applicant 2026
- Active open source contributor
"""


def call_ollama(prompt: str, system: str = "") -> str:
    """Call local Ollama LLM."""
    try:
        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": prompt,
            "system": system,
            "stream": False,
            "options": {"temperature": 0.4, "num_predict": 2000}
        }
        resp = requests.post(
            f"{settings.OLLAMA_HOST}/api/generate",
            json=payload,
            timeout=120
        )
        resp.raise_for_status()
        return resp.json().get("response", "").strip()
    except Exception as e:
        logger.error(f"Ollama call failed: {e}")
        return ""


def tailor_resume(job_title: str, company: str, job_description: str) -> str:
    """
    Use LLM to tailor the base resume for a specific job.
    Returns the tailored resume as plain text.
    """
    base_resume = load_base_resume()

    if not job_description:
        logger.warning(f"No JD available for {company} — using base resume")
        return base_resume

    system = """You are an expert resume writer and career coach.
Your task is to tailor a resume to match a specific job description.
Rules:
- Keep ALL factual information accurate — never invent experience or skills
- Reorder and rephrase existing content to better match the JD keywords
- Mirror the language and keywords from the job description
- Highlight the most relevant skills and projects for this specific role
- Keep the resume concise and professional
- Output ONLY the tailored resume text, nothing else
"""

    prompt = f"""
Job Title: {job_title}
Company: {company}

JOB DESCRIPTION:
{job_description[:2000]}

BASE RESUME:
{base_resume}

Tailor the resume above to best match this job description.
Reorder skills, rephrase bullet points, and emphasize the most relevant experience.
Do NOT add fake experience. Output ONLY the resume text.
"""

    logger.info(f"Tailoring resume for {job_title} at {company}...")
    tailored = call_ollama(prompt, system)

    if not tailored:
        logger.warning("LLM returned empty — using base resume")
        return base_resume

    # Save tailored resume
    save_tailored_resume(tailored, job_title, company)
    return tailored


def save_tailored_resume(resume_text: str, job_title: str, company: str) -> str:
    """Save tailored resume to file and return path."""
    os.makedirs(settings.TAILORED_RESUME_DIR, exist_ok=True)
    safe_name = f"{company}_{job_title}".replace(" ", "_").replace("/", "-")[:50]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = os.path.join(settings.TAILORED_RESUME_DIR, f"{safe_name}_{timestamp}.txt")
    with open(path, "w") as f:
        f.write(resume_text)
    logger.info(f"Tailored resume saved: {path}")
    return path


def score_job_match(job_description: str) -> float:
    """
    Score how well the base resume matches a job description (0.0 - 1.0).
    Uses keyword overlap + LLM scoring.
    """
    base_resume = load_base_resume().lower()
    jd_lower = job_description.lower()

    # Extract keywords from JD
    tech_keywords = [
        "python", "machine learning", "deep learning", "pytorch", "tensorflow",
        "langchain", "langgraph", "nlp", "data science", "ml", "ai", "scikit",
        "pandas", "numpy", "sql", "docker", "git", "api", "rag", "llm",
        "transformers", "opencv", "flask", "fastapi", "streamlit", "mlflow"
    ]

    jd_keywords = [kw for kw in tech_keywords if kw in jd_lower]
    resume_matches = [kw for kw in jd_keywords if kw in base_resume]

    if not jd_keywords:
        return 0.5

    score = len(resume_matches) / len(jd_keywords)
    logger.info(f"Job match score: {score:.2f} ({len(resume_matches)}/{len(jd_keywords)} keywords)")
    return round(score, 2)
