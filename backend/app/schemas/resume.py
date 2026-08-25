from pydantic import BaseModel


class PersonalData(BaseModel):
    name: str
    email: str
    phone: str
    linkedin: str
    github: str


class EducationEntry(BaseModel):
    degree: str
    institution: str
    dates: str
    score: str | None = None


class ExperienceEntry(BaseModel):
    title: str
    company: str
    dates: str
    bullets: list[str]


class ProjectEntry(BaseModel):
    name: str
    description: str
    tech: list[str]
    bullets: list[str]


class MasterResume(BaseModel):
    template_id: str = "default"
    personal: PersonalData
    summary: str
    skills: list[str]
    education: list[EducationEntry]
    experience_entries: list[ExperienceEntry]
    projects: list[ProjectEntry]
    achievements: list[str]


class TailorRequest(BaseModel):
    application_id: str
