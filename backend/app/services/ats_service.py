import re

TECH_KEYWORDS = [
    "python",
    "machine learning",
    "deep learning",
    "pytorch",
    "tensorflow",
    "langchain",
    "langgraph",
    "nlp",
    "data science",
    "ml",
    "ai",
    "scikit",
    "pandas",
    "numpy",
    "sql",
    "docker",
    "git",
    "api",
    "rag",
    "llm",
    "transformers",
    "opencv",
    "flask",
    "fastapi",
    "streamlit",
    "mlflow",
]


def extract_keywords(text: str) -> set[str]:
    lowered = text.lower()

    keywords = {keyword for keyword in TECH_KEYWORDS if keyword in lowered}

    words = set(re.findall(r"\b[a-z][a-z0-9+#.]{2,}\b", lowered))
    keywords.update(words)

    return keywords


def flatten_resume_text(resume: dict) -> dict[str, str]:
    summary = resume.get("summary", "")

    skills = " ".join(resume.get("skills", []))

    experience_parts = []

    for experience in resume.get("experience_entries", []):
        experience_parts.append(" ".join(experience.get("bullets", [])))

    project_parts = []

    for project in resume.get("projects", []):
        project_parts.append(project.get("description", ""))
        project_parts.append(" ".join(project.get("bullets", [])))

    return {
        "summary": summary.lower(),
        "skills": skills.lower(),
        "experience": " ".join(experience_parts).lower(),
        "projects": " ".join(project_parts).lower(),
    }


def score_resume(resume: dict, job_description: str) -> dict:
    jd_keywords = extract_keywords(job_description)

    if not jd_keywords:
        return {
            "score": 0.0,
            "target_band": "75-85",
            "matched_keywords": [],
            "missing_keywords": [],
            "recommendations": ["Job description contains no extractable keywords."],
            "parseability": parseability_audit(resume),
        }

    sections = flatten_resume_text(resume)

    matched = []
    missing = []
    total_weight = 0.0
    earned_weight = 0.0

    for keyword in jd_keywords:
        weight = 0.0

        if keyword in sections["summary"]:
            weight += 3.0

        if keyword in sections["skills"]:
            weight += 3.0

        if keyword in sections["experience"] or keyword in sections["projects"]:
            weight += 1.0

        total_weight += 7.0

        if weight > 0:
            matched.append(keyword)
            earned_weight += min(weight, 7.0)
        else:
            missing.append(keyword)

    raw_score = (earned_weight / total_weight) * 100 if total_weight else 0.0
    score = min(round(raw_score, 1), 95.0)

    recommendations = []

    if score < 75:
        recommendations.append(
            "Add missing but truthful keywords to summary and skills."
        )
        recommendations.append("Rewrite experience bullets to reflect JD language.")

    if score > 85:
        recommendations.append(
            "Reduce keyword density slightly to avoid stuffing signals."
        )

    if missing:
        recommendations.append("Prioritize: " + ", ".join(sorted(missing)[:10]))

    return {
        "score": score,
        "target_band": "75-85",
        "matched_keywords": sorted(matched),
        "missing_keywords": sorted(missing),
        "recommendations": recommendations,
        "parseability": parseability_audit(resume),
    }


def parseability_audit(resume: dict) -> dict:
    issues = []

    required_sections = [
        "personal",
        "summary",
        "skills",
        "experience_entries",
        "education",
    ]

    for section in required_sections:
        if section not in resume:
            issues.append(f"Missing section: {section}")

    if not resume.get("skills"):
        issues.append("Skills section is empty.")

    if not resume.get("experience_entries"):
        issues.append("Experience section is empty.")

    return {
        "parseable": len(issues) == 0,
        "issues": issues,
        "layout": "single_column_structured_json",
        "multi_column_detected": False,
        "tables_detected": False,
    }
