"""All calls to the Groq API are isolated in this module."""

import json
import logging

import httpx
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.recipe import RecipeContent, RecipeGenerateRequest

logger = logging.getLogger(__name__)

GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions"
REQUEST_TIMEOUT_SECONDS = 30.0
MAX_ATTEMPTS = 2

RECIPE_JSON_SHAPE = """{
  "title": string,
  "description": string,
  "ingredients_list": [ { "name": string, "quantity": string } ],
  "steps": [ string ],
  "cooking_time": string,
  "servings": integer,
  "nutrition_estimate": { "calories": string, "protein": string, "carbohydrates": string, "fat": string },
  "tips": [ string ]
}"""


class GroqServiceError(Exception):
    """Raised when Groq cannot produce a usable recipe. `status_code` hints the HTTP response to send."""

    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


def _build_prompt(request: RecipeGenerateRequest) -> str:
    restrictions = ", ".join(request.dietary_restrictions) if request.dietary_restrictions else "None"
    notes = request.additional_notes.strip() if request.additional_notes else "None"

    return f"""You are a professional chef and recipe writer. Create a single, complete recipe based on the
following requirements, and respond ONLY with a single JSON object, no markdown fences, no commentary,
matching exactly this shape:

{RECIPE_JSON_SHAPE}

Food type: {request.food_type}
Available ingredients: {", ".join(request.ingredients)}
Cuisine preference: {request.cuisine}
Cooking time available: {request.cooking_time_minutes} minutes (the recipe must fit within this)
Dietary restrictions: {restrictions}
Number of servings: {request.servings}
Difficulty level: {request.difficulty_level}
Additional notes: {notes}

Requirements:
- Prefer using the available ingredients, but you may add a small number of common pantry staples if needed.
- Respect all dietary restrictions strictly.
- "steps" must be clear, numbered cooking instructions as an array of strings (one step per string, no leading
  numbers since the UI numbers them).
- "ingredients_list" must include realistic quantities scaled to the requested servings.
- "nutrition_estimate" should be a reasonable per-serving estimate, each value a short string (e.g. "320 kcal").
- "tips" should contain 2-4 short, useful tips (e.g. substitutions, storage, plating).
- Keep the "title" short and appetizing.
- Respond with JSON only.
"""


async def generate_recipe(request: RecipeGenerateRequest) -> RecipeContent:
    prompt = _build_prompt(request)

    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"},
        "temperature": 0.9,
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
    }

    last_error: Exception | None = None

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
        for attempt in range(1, MAX_ATTEMPTS + 1):
            try:
                response = await client.post(GROQ_CHAT_COMPLETIONS_URL, json=payload, headers=headers)
            except httpx.TimeoutException as exc:
                last_error = exc
                logger.warning("Groq request timed out (attempt %s/%s)", attempt, MAX_ATTEMPTS)
                continue

            if response.status_code == 429:
                raise GroqServiceError("Recipe generation is rate-limited right now. Please try again shortly.", 429)
            if response.status_code in (401, 403):
                raise GroqServiceError("Recipe generation is not configured correctly.", 502)
            if response.status_code >= 400:
                last_error = GroqServiceError(f"Groq API error: {response.status_code} {response.text}")
                logger.warning("Groq API error %s (attempt %s/%s): %s", response.status_code, attempt, MAX_ATTEMPTS, response.text)
                continue

            try:
                data = response.json()
                text = data["choices"][0]["message"]["content"]
                parsed = json.loads(text)
                return RecipeContent.model_validate(parsed)
            except (KeyError, IndexError, json.JSONDecodeError, ValidationError) as exc:
                last_error = exc
                logger.warning("Groq returned an unparsable response (attempt %s/%s): %s", attempt, MAX_ATTEMPTS, exc)
                continue

    raise GroqServiceError(
        "Could not generate a recipe right now. Please try again.", 502
    ) from last_error
