from app.services.llm_service import generate_llm_response
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/ai", tags=["ai"])

SYSTEM_PROMPT = (
    "You are an expert resume coach. Rewrite the user's resume text so it is "
    "more concise, impact-driven and keyword-aligned with the target role. "
    "Never invent employers, dates, degrees, certifications or skills that "
    "are not present in the input. Preserve real numbers and facts. Return "
    "only the rewritten text."
)


class ImproveIn(BaseModel):
    text: str = Field(min_length=3, max_length=4000)
    context: str = Field(default="", max_length=1000)


class ImproveOut(BaseModel):
    improved: str


@router.post("/improve", response_model=ImproveOut)
async def improve_text(payload: ImproveIn):
    """Rewrite a resume snippet with the configured LLM provider."""
    prompt = payload.text
    if payload.context:
        prompt = f"Target role context: {payload.context}\n\nText to improve:\n{payload.text}"
    try:
        improved = await generate_llm_response(
            SYSTEM_PROMPT, prompt, json_mode=False
        )
    except ValueError as exc:
        raise HTTPException(status_code=501, detail=str(exc)) from exc
    except Exception as exc:  # provider/network failure
        raise HTTPException(
            status_code=502, detail="LLM provider unreachable"
        ) from exc

    improved = improved.strip().strip('"')
    if not improved:
        raise HTTPException(status_code=502, detail="Empty LLM response")
    return ImproveOut(improved=improved)
