from pydantic import BaseModel, Field


class UserProfileIn(BaseModel):
    email: str
    full_name: str = ""
    career_stage: str = ""
    target_roles: list[str] = Field(default_factory=list)
    target_locations: str = ""
    remote_only: bool = False
    weekly_goal: int = 10
    onboarded: bool = True


class UserProfileOut(BaseModel):
    email: str
    full_name: str
    career_stage: str
    target_roles: list[str]
    target_locations: str
    remote_only: bool
    weekly_goal: int
    onboarded: bool
