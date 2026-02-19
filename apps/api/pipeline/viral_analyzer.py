"""
🔥 Viral Video Analyzer — Gemini 2.5 Pro + URL Context

Analyzes a GitHub repo using Gemini's URL context tool and produces
everything needed for a viral promo video.
"""

import json
import os
import asyncio
import re
from dataclasses import dataclass, asdict
from typing import Optional

from google import genai
from google.genai import types


def _parse_stars(value) -> int:
    """Parse star/fork count that may be a string like '17.8K', '95K+', or '1.2M'."""
    if isinstance(value, (int, float)):
        return int(value)
    if not isinstance(value, str):
        return 0
    s = value.strip().replace(",", "").replace("+", "")
    multiplier = 1
    if s.upper().endswith("K"):
        multiplier = 1000
        s = s[:-1]
    elif s.upper().endswith("M"):
        multiplier = 1_000_000
        s = s[:-1]
    try:
        return int(float(s) * multiplier)
    except ValueError:
        return 0


def _strip_json_fences(text: str) -> str:
    """Strip markdown code fences if Gemini wrapped the JSON response."""
    text = text.strip()
    if text.startswith("```"):
        # Remove opening fence (```json or ```)
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


@dataclass
class RepoAnalysis:
    name: str
    full_name: str
    description: str
    stars: int
    forks: int
    language: str
    topics: list[str]
    frameworks: list[str]
    features: list[dict]
    tech_stack: list[dict]
    hook_style: str
    hook_text: str
    tagline: str
    scenes: list[str]
    voiceover_scripts: dict[str, str]
    music_mood: str


SYSTEM_PROMPT = """You are a viral video producer analyzing GitHub repos. Your job is to extract the most impressive, shareable aspects and write punchy voiceover scripts.

I'm giving you a GitHub repo URL. Use the URL context to read the repo page, README, and any other relevant info.

Return a JSON object with:

{
  "name": "repo-name",
  "full_name": "owner/repo-name",
  "description": "One-line description of what the repo does",
  "stars": 12345,
  "forks": 678,
  "language": "Python",
  "topics": ["ai", "machine-learning"],
  "frameworks": ["list", "of", "frameworks/tools"],
  "features": [
    {"emoji": "🤖", "title": "SHORT TITLE", "desc": "One line"},
    // 3-4 features max
  ],
  "tech_stack": [
    {"emoji": "🧠", "name": "ToolName"},
    // up to 8 items
  ],
  "tagline": "Punchy tagline (8 words max)",
  "hook_text": "Opening hook — grab attention in 3 seconds",
  "voiceover_scripts": {
    "hook": "3-5 second hook. Punchy. Numbers if impressive.",
    "what": "5-8 seconds explaining what this is. Conversational.",
    "features": "8-10 seconds listing key features. Build excitement.",
    "tech": "5-8 seconds on the tech stack.",
    "stats": "5-8 seconds on impressive numbers.",
    "cta": "3-5 seconds call to action."
  },
  "music_mood": "hype" or "tech" or "chill" or "upbeat"
}

RULES:
- Write like Fireship — punchy, opinionated, no filler
- If <100 stars, focus on WHAT IT DOES, not vanity metrics
- If >10K stars, lead with impressive numbers
- Stars and forks must be actual numbers from the repo page, not made up
- Voiceover must sound conversational, not robotic
- Keep everything SHORT. 30-45 second video."""


async def analyze_repo_for_viral(repo_url: str) -> RepoAnalysis:
    """Analyze a repo using Gemini with URL context for viral video generation."""

    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

    url_context_tool = types.Tool(url_context=types.UrlContext())

    response = client.models.generate_content(
        model="gemini-3.1-pro-preview",
        contents=f"Analyze this GitHub repo for a viral promo video: {repo_url}",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=[url_context_tool],
            response_mime_type="application/json",
        ),
    )

    raw = response.text
    try:
        data = json.loads(_strip_json_fences(raw))
    except json.JSONDecodeError:
        # Try fixing invalid escape sequences
        cleaned = _strip_json_fences(raw)
        fixed = re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', cleaned)
        data = json.loads(fixed)

    stars = _parse_stars(data.get("stars", 0))
    forks = _parse_stars(data.get("forks", 0))

    if stars >= 10000:
        hook_style = "counter"
        scenes = ["hook", "what", "features", "tech", "stats", "cta"]
    elif stars >= 100:
        hook_style = "momentum"
        scenes = ["hook", "what", "features", "tech", "cta"]
    else:
        hook_style = "problem"
        scenes = ["hook", "what", "features", "cta"]

    if len(data.get("tech_stack", [])) < 3 and "tech" in scenes:
        scenes.remove("tech")

    voiceover = data.get("voiceover_scripts", {})
    voiceover = {k: v for k, v in voiceover.items() if k in scenes}
    
    # Fill missing voiceover keys with fallback scripts so no scene has silent audio
    repo_name = data.get("name", "this repo")
    fallback_scripts = {
        "hook": f"Check out {repo_name}.",
        "what": data.get("description", f"{repo_name} is an open source project."),
        "features": "It comes packed with powerful features.",
        "tech": "Built with a solid tech stack.",
        "stats": f"{repo_name} is gaining traction in the community.",
        "cta": f"Star {repo_name} on GitHub and try it today.",
    }
    for scene_id in scenes:
        if scene_id not in voiceover or not voiceover[scene_id]:
            voiceover[scene_id] = fallback_scripts.get(scene_id, f"Check out {repo_name}.")

    return RepoAnalysis(
        name=data.get("name", ""),
        full_name=data.get("full_name", ""),
        description=data.get("description", ""),
        stars=stars,
        forks=forks,
        language=data.get("language", ""),
        topics=data.get("topics", []),
        frameworks=data.get("frameworks", []),
        features=data.get("features", [])[:4],
        tech_stack=data.get("tech_stack", [])[:8],
        hook_style=hook_style,
        hook_text=data.get("hook_text", ""),
        tagline=data.get("tagline", ""),
        scenes=scenes,
        voiceover_scripts=voiceover,
        music_mood=data.get("music_mood", "tech"),
    )


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python viral_analyzer.py <github-url>")
        sys.exit(1)

    async def main():
        url = sys.argv[1]
        print(f"🔍 Analyzing {url}...")
        analysis = await analyze_repo_for_viral(url)
        print(json.dumps(asdict(analysis), indent=2))

    asyncio.run(main())
