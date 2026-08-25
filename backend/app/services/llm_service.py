import json
import logging
import re
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


async def generate_llm_response(
    system: str, prompt: str, json_mode: bool = False
) -> str:
    provider = settings.LLM_PROVIDER.lower()

    if provider == "ollama":
        return await generate_ollama(system, prompt, json_mode)

    if provider == "openai":
        return await generate_openai(system, prompt, json_mode)

    if provider == "anthropic":
        return await generate_anthropic(system, prompt)

    if provider == "gemini":
        return await generate_gemini(system, prompt)

    raise ValueError(f"Unsupported LLM provider: {provider}")


async def generate_ollama(system: str, prompt: str, json_mode: bool) -> str:
    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        "stream": False,
        "options": {
            "temperature": 0.4,
            "num_predict": 2000,
        },
    }

    if json_mode:
        payload["format"] = "json"

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(f"{settings.OLLAMA_HOST}/api/chat", json=payload)
        response.raise_for_status()

    return response.json().get("message", {}).get("content", "").strip()


async def generate_openai(system: str, prompt: str, json_mode: bool) -> str:
    payload: dict[str, Any] = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.4,
    }

    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()

    return response.json()["choices"][0]["message"]["content"].strip()


async def generate_anthropic(system: str, prompt: str) -> str:
    headers = {
        "x-api-key": settings.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    payload = {
        "model": "claude-3-haiku-20240307",
        "max_tokens": 2000,
        "system": system,
        "messages": [
            {"role": "user", "content": prompt},
        ],
    }

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()

    return response.json()["content"][0]["text"].strip()


async def generate_gemini(system: str, prompt: str) -> str:
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    )

    payload = {
        "system_instruction": {
            "parts": [{"text": system}],
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
    }

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()

    return response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()


def extract_json(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)

        if match:
            return json.loads(match.group(0))

        raise
