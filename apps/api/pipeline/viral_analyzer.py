"""
🔥 Viral Video Analyzer — Gemini + URL Context

Analyzes a GitHub repo using Gemini's URL context tool and produces
everything needed for a viral promo video.
"""

import json
import os
import asyncio
import sys
import re
from dataclasses import dataclass

from google import genai
from google.genai import types


MAX_RETRIES = 3


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
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def _clean_json_string(text: str) -> str:
    """Remove JS-style comments and fix common Gemini JSON quirks."""
    lines = text.split("\n")
    cleaned = []
    for line in lines:
        in_string = False
        escape = False
        comment_start = None
        for i, ch in enumerate(line):
            if escape:
                escape = False
                continue
            if ch == '\\':
                escape = True
                continue
            if ch == '"':
                in_string = not in_string
            elif ch == '/' and not in_string and i + 1 < len(line) and line[i + 1] == '/':
                comment_start = i
                break
        if comment_start is not None:
            line = line[:comment_start].rstrip()
        cleaned.append(line)
    text = "\n".join(cleaned)
    text = re.sub(r',\s*([}\]])', r'\1', text)
    return text


def _fix_empty_values(text: str) -> str:
    """Fix Gemini's habit of returning empty values like  \"key\":,  instead of  \"key\": null,"""
    # Match  ": ," or ":," (value missing between colon and comma/newline)
    # Replace with ": null,"
    text = re.sub(r':\s*,', ': null,', text)
    # Also handle empty value at end before closing brace:  "key":}  or  "key":\n}
    text = re.sub(r':\s*}', ': null}', text)
    return text


def _robust_parse_json(raw: str) -> dict:
    """Parse JSON from Gemini with multiple fallback strategies."""
    if not raw or not raw.strip():
        raise ValueError("Gemini returned an empty response.")

    text = _strip_json_fences(raw)

    # Pre-process: fix empty values ("key":, -> "key": null,)
    text = _fix_empty_values(text)

    # Attempt 1: direct parse
    try:
        data = json.loads(text)
        return _sanitize_nulls(data)
    except json.JSONDecodeError:
        pass

    # Attempt 2: clean comments + trailing commas
    cleaned = _clean_json_string(text)
    cleaned = _fix_empty_values(cleaned)
    try:
        data = json.loads(cleaned)
        return _sanitize_nulls(data)
    except json.JSONDecodeError:
        pass

    # Attempt 3: fix invalid escape sequences
    fixed = re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', cleaned)
    try:
        data = json.loads(fixed)
        return _sanitize_nulls(data)
    except json.JSONDecodeError as e:
        print(f"\n❌ All JSON parse attempts failed. Raw ({len(raw)} chars):\n{raw[:1500]}\n",
              file=sys.stderr, flush=True)
        raise ValueError(f"Could not parse Gemini response as JSON: {e}") from e


# Fields that must be lists vs strings
_LIST_FIELDS = {"topics", "frameworks", "features", "tech_stack", "scenes"}
_DICT_FIELDS = {"voiceover_scripts"}


def _sanitize_nulls(data: dict) -> dict:
    """Convert null values to appropriate empty defaults."""
    for key, val in data.items():
        if val is None:
            if key in _LIST_FIELDS:
                data[key] = []
            elif key in _DICT_FIELDS:
                data[key] = {}
            elif key in ("stars", "forks"):
                data[key] = 0
            else:
                data[key] = ""
    return data


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


# ── Schema that Gemini must conform to ──────────────────────────────
FEATURE_SCHEMA = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "emoji": types.Schema(type=types.Type.STRING),
        "title": types.Schema(type=types.Type.STRING),
        "desc": types.Schema(type=types.Type.STRING),
    },
    required=["emoji", "title", "desc"],
)

TECH_STACK_SCHEMA = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "emoji": types.Schema(type=types.Type.STRING),
        "name": types.Schema(type=types.Type.STRING),
    },
    required=["emoji", "name"],
)

VOICEOVER_SCHEMA = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "hook": types.Schema(type=types.Type.STRING),
        "what": types.Schema(type=types.Type.STRING),
        "features": types.Schema(type=types.Type.STRING),
        "tech": types.Schema(type=types.Type.STRING),
        "stats": types.Schema(type=types.Type.STRING),
        "cta": types.Schema(type=types.Type.STRING),
    },
    required=["hook", "what", "features", "tech", "stats", "cta"],
)

RESPONSE_SCHEMA = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "name": types.Schema(type=types.Type.STRING),
        "full_name": types.Schema(type=types.Type.STRING),
        "description": types.Schema(type=types.Type.STRING),
        "stars": types.Schema(type=types.Type.INTEGER),
        "forks": types.Schema(type=types.Type.INTEGER),
        "language": types.Schema(type=types.Type.STRING),
        "topics": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
        "frameworks": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
        "features": types.Schema(type=types.Type.ARRAY, items=FEATURE_SCHEMA),
        "tech_stack": types.Schema(type=types.Type.ARRAY, items=TECH_STACK_SCHEMA),
        "hook_style": types.Schema(
            type=types.Type.STRING,
            enum=["counter", "momentum", "problem"],
        ),
        "hook_text": types.Schema(type=types.Type.STRING),
        "tagline": types.Schema(type=types.Type.STRING),
        "scenes": types.Schema(
            type=types.Type.ARRAY,
            items=types.Schema(
                type=types.Type.STRING,
                enum=["hook", "what", "features", "tech", "stats", "cta"],
            ),
        ),
        "voiceover_scripts": VOICEOVER_SCHEMA,
        "music_mood": types.Schema(
            type=types.Type.STRING,
            enum=["hype", "tech", "chill", "upbeat"],
        ),
    },
    required=[
        "name", "full_name", "description", "stars", "forks",
        "language", "topics", "frameworks", "features", "tech_stack",
        "hook_style", "hook_text", "tagline", "scenes",
        "voiceover_scripts", "music_mood",
    ],
)


SYSTEM_PROMPT = """You are a viral video producer analyzing GitHub repos. Your job is to extract the most impressive, shareable aspects and write punchy voiceover scripts.

I'm giving you a GitHub repo URL. Use the URL context to read the repo page, README, and any other relevant info.

RULES:
- Write like Fireship — punchy, opinionated, no filler
- Stars and forks must be actual numbers from the repo page, not made up
- Voiceover must sound conversational, not robotic
- Keep everything SHORT. 30-45 second video.
- Return 3-4 features max, up to 8 tech_stack items
- tagline: 8 words max
- hook_text: opening hook to grab attention in 3 seconds
- hook_style: choose "counter" if the repo has massive stars (>10K), "momentum" if growing (>100 stars), or "problem" if newer/smaller — focus on the problem it solves
- scenes: choose which scenes to include from [hook, what, features, tech, stats, cta]. Always include hook, what, features, cta. Only include "tech" if the tech stack is interesting enough to feature. Only include "stats" if the numbers are impressive.
- voiceover_scripts: write a script for EVERY key (hook, what, features, tech, stats, cta) regardless of scenes chosen
- If <100 stars, focus voiceovers on WHAT IT DOES, not vanity metrics
- If >10K stars, lead with impressive numbers in the hook"""


async def analyze_repo_for_viral(repo_url: str) -> RepoAnalysis:
    """Analyze a repo using Gemini with URL context for viral video generation.
    
    Retries up to MAX_RETRIES times on failure.
    """

    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    url_context_tool = types.Tool(url_context=types.UrlContext())

    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"🔍 Attempt {attempt}/{MAX_RETRIES}: Analyzing {repo_url}...",
                  flush=True)

            response = client.models.generate_content(
                model="gemini-3.1-pro-preview",
                contents=f"Analyze this GitHub repo for a viral promo video: {repo_url}",
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    tools=[url_context_tool],
                    response_mime_type="application/json",
                    response_schema=RESPONSE_SCHEMA,
                ),
            )

            raw = response.text
            print(f"✅ Got response ({len(raw) if raw else 0} chars)", flush=True)

            data = _robust_parse_json(raw)
            
            # Successfully parsed — build the result
            return _build_analysis(data)

        except Exception as e:
            last_error = e
            print(f"⚠️  Attempt {attempt} failed: {e}", file=sys.stderr, flush=True)
            if attempt < MAX_RETRIES:
                wait = attempt * 2  # 2s, 4s backoff
                print(f"   Retrying in {wait}s...", flush=True)
                await asyncio.sleep(wait)

    # All retries exhausted
    raise ValueError(
        f"Failed after {MAX_RETRIES} attempts. Last error: {last_error}"
    )


def _build_analysis(data: dict) -> RepoAnalysis:
    """Build a RepoAnalysis from parsed JSON data. Model decides structure."""
    stars = _parse_stars(data.get("stars", 0))
    forks = _parse_stars(data.get("forks", 0))

    # Model chooses scenes; use 'or' so empty lists from null-fix also get defaults
    scenes = data.get("scenes") or ["hook", "what", "features", "cta"]
    features = (data.get("features") or [])[:4]
    tech_stack = (data.get("tech_stack") or [])[:8]

    # Drop scenes that have no data to display
    if not features and "features" in scenes:
        scenes = [s for s in scenes if s != "features"]
    if not tech_stack and "tech" in scenes:
        scenes = [s for s in scenes if s != "tech"]
    if stars < 100 and "stats" in scenes:
        scenes = [s for s in scenes if s != "stats"]

    voiceover = data.get("voiceover_scripts") or {}
    voiceover = {k: v for k, v in voiceover.items() if k in scenes and v}

    # Safety: ensure every chosen scene has a voiceover
    repo_name = data.get("name", "this repo")
    for scene_id in scenes:
        if scene_id not in voiceover:
            voiceover[scene_id] = f"Check out {repo_name} on GitHub."

    return RepoAnalysis(
        name=data.get("name", ""),
        full_name=data.get("full_name", ""),
        description=data.get("description", ""),
        stars=stars,
        forks=forks,
        language=data.get("language", ""),
        topics=data.get("topics") or [],
        frameworks=data.get("frameworks") or [],
        features=features,
        tech_stack=tech_stack,
        hook_style=data.get("hook_style") or "problem",
        hook_text=data.get("hook_text", ""),
        tagline=data.get("tagline", ""),
        scenes=scenes,
        voiceover_scripts=voiceover,
        music_mood=data.get("music_mood") or "tech",
    )

if __name__ == "__main__":
    from dataclasses import asdict

    if len(sys.argv) < 2:
        print("Usage: python viral_analyzer.py <github-url>")
        sys.exit(1)

    async def main():
        url = sys.argv[1]
        analysis = await analyze_repo_for_viral(url)
        print(json.dumps(asdict(analysis), indent=2))

    asyncio.run(main())
