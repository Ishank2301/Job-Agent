import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Application, Job, Resume, ResumeVersion
from app.schemas.resume import MasterResume
from app.services import ats_service, llm_service

logger = logging.getLogger(__name__)

DEFAULT_MASTER_RESUME: dict[str, Any] = {
    "template_id": "default",
    "personal": {
        "name": "[Your Name]",
        "email": "[your.email@gmail.com]",
        "phone": "[+91-XXXXXXXXXX]",
        "linkedin": "[linkedin.com/in/yourprofile]",
        "github": "[github.com/yourusername]",
    },
    "summary": "Computer Science student with experience in Python, ML/AI, and open source development.",
    "skills": [
        "Python",
        "JavaScript",
        "TensorFlow",
        "PyTorch",
        "scikit-learn",
        "LangChain",
        "LangGraph",
        "Pandas",
        "NumPy",
        "SQL",
        "FAISS",
        "Git",
        "Docker",
        "GitHub Actions",
        "MLflow",
    ],
    "education": [
        {
            "degree": "B.Tech Computer Science",
            "institution": "[Your University]",
            "dates": "2022-2026",
            "score": "CGPA: 8.5",
        }
    ],
    "experience_entries": [
        {
            "title": "Open Source Contributor",
            "company": "Aeon (Time Series Library)",
            "dates": "2024",
            "bullets": [
                "Contributed time series classification improvements",
                "Merged 3 PRs improving model accuracy by 12%",
            ],
        }
    ],
    "projects": [
        {
            "name": "MediBot — Medical RAG Chatbot",
            "description": "LangGraph + LangChain + FAISS + MLflow",
            "tech": ["LangChain", "LangGraph", "FAISS", "MLflow"],
            "bullets": [
                "Built retrieval-augmented medical assistant",
                "Implemented full CI/CD pipeline with GitHub Actions",
            ],
        }
    ],
    "achievements": [
        "Google Summer of Code applicant 2026",
        "Active open source contributor",
    ],
}

TAILOR_SYSTEM_PROMPT = """
You are an enterprise resume tailoring engine.

Non-negotiable rules:
1. Never invent skills, tools, experience, metrics, companies, or education.
2. Never change personal data.
3. Never change template_id.
4. You may reorder bullets and rewrite wording to align with the job description.
5. You may only use skills already present in the base resume.
6. Return strictly valid JSON matching the input resume schema.
"""


async def get_or_create_resume_for_application(
    db: AsyncSession, application_id: str
) -> Resume:
    result = await db.execute(
        select(Resume).where(Resume.application_id == application_id)
    )
    resume = result.scalar_one_or_none()

    if resume:
        return resume

    application = await db.get(Application, application_id)

    if not application:
        raise ValueError("Application not found")

    resume = Resume(
        application_id=application_id,
        template_id="default",
        base_resume=DEFAULT_MASTER_RESUME,
        tailored_resume=DEFAULT_MASTER_RESUME,
    )

    db.add(resume)
    await db.commit()
    await db.refresh(resume)

    return resume


def enforce_guardrails(base: dict, tailored: dict) -> dict:
    safe = dict(tailored)

    safe["template_id"] = base.get("template_id", "default")
    safe["personal"] = base["personal"]

    base_skills = {skill.lower() for skill in base.get("skills", [])}
    safe["skills"] = [
        skill for skill in tailored.get("skills", []) if skill.lower() in base_skills
    ]

    base_experience = base.get("experience_entries", [])
    tailored_experience = tailored.get("experience_entries", [])

    safe_experience = []

    for index, base_exp in enumerate(base_experience):
        if index < len(tailored_experience):
            tailored_exp = tailored_experience[index]

            safe_experience.append(
                {
                    "title": base_exp["title"],
                    "company": base_exp["company"],
                    "dates": base_exp["dates"],
                    "bullets": tailored_exp.get("bullets", base_exp["bullets"]),
                }
            )
        else:
            safe_experience.append(base_exp)

    safe["experience_entries"] = safe_experience

    base_projects = base.get("projects", [])
    tailored_projects = tailored.get("projects", [])

    safe_projects = []

    for index, base_project in enumerate(base_projects):
        if index < len(tailored_projects):
            tailored_project = tailored_projects[index]

            safe_projects.append(
                {
                    "name": base_project["name"],
                    "description": base_project["description"],
                    "tech": base_project["tech"],
                    "bullets": tailored_project.get("bullets", base_project["bullets"]),
                }
            )
        else:
            safe_projects.append(base_project)

    safe["projects"] = safe_projects
    safe["education"] = base.get("education", [])
    safe["achievements"] = base.get("achievements", [])

    return safe


async def tailor_resume(db: AsyncSession, application_id: str) -> ResumeVersion:
    resume = await get_or_create_resume_for_application(db, application_id)

    application = await db.get(Application, application_id)

    if not application:
        raise ValueError("Application not found")

    job = await db.get(Job, application.job_id)

    if not job:
        raise ValueError("Job not found")

    if not job.description:
        raise ValueError("Job description is empty")

    prompt = f"""
Job Title: {job.title}
Company: {job.company}

JOB DESCRIPTION:
{job.description[:6000]}

BASE RESUME JSON:
{resume.base_resume}

Return tailored resume JSON only.
"""

    raw_response = await llm_service.generate_llm_response(
        system=TAILOR_SYSTEM_PROMPT,
        prompt=prompt,
        json_mode=True,
    )

    try:
        tailored = llm_service.extract_json(raw_response)
    except Exception:
        logger.warning("LLM returned invalid JSON. Using base resume.")
        tailored = resume.base_resume

    safe_tailored = enforce_guardrails(resume.base_resume, tailored)

    ats_result = ats_service.score_resume(safe_tailored, job.description)

    resume.tailored_resume = safe_tailored

    version_count_result = await db.execute(
        select(ResumeVersion).where(ResumeVersion.resume_id == resume.id)
    )

    version_count = len(version_count_result.scalars().all())

    version = ResumeVersion(
        resume_id=resume.id,
        version=version_count + 1,
        content=safe_tailored,
        ats_score=ats_result["score"],
    )

    application.ats_score = ats_result["score"]

    db.add(version)
    await db.commit()
    await db.refresh(version)

    return version
