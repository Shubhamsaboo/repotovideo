#!/usr/bin/env python3
"""
🎬 RepoToViralVideo — Generate a viral promo video for any GitHub repo

Usage:
    python generate.py <github-url> [--music chill|upbeat|tech|hype] [--voice Puck|Kore|Aoede|Charon]

Example:
    python generate.py https://github.com/langchain-ai/langchain
    python generate.py https://github.com/user/repo --music hype --voice Kore
"""

import argparse
import asyncio
import json
import os
import sys
import subprocess
from pathlib import Path
from dataclasses import asdict

# Add pipeline to path
sys.path.insert(0, str(Path(__file__).parent / "apps" / "api"))

from pipeline.viral_analyzer import analyze_repo_for_viral
from pipeline.viral_tts import generate_voiceover
from pipeline.viral_renderer import generate_composition, render_video

VIDEO_DIR = Path(__file__).parent / "apps" / "video"
MUSIC_MAP = {
    "chill": "music/chill.mp3",
    "upbeat": "music/upbeat.mp3",
    "tech": "music/tech.mp3",
    "hype": "music/hype.mp3",
}


def check_prerequisites():
    """Check that required tools and API keys are available."""
    errors = []

    if not os.environ.get("GEMINI_API_KEY"):
        errors.append("GEMINI_API_KEY not set. Get one at https://aistudio.google.com/apikey")

    # Check ffmpeg
    result = subprocess.run(["ffmpeg", "-version"], capture_output=True)
    if result.returncode != 0:
        errors.append("ffmpeg not found. Install: brew install ffmpeg")

    # Check node_modules
    if not (VIDEO_DIR / "node_modules").exists():
        errors.append(f"Node modules not installed. Run: cd {VIDEO_DIR} && npm install")

    if errors:
        print("❌ Missing prerequisites:")
        for e in errors:
            print(f"   • {e}")
        sys.exit(1)


async def main():
    parser = argparse.ArgumentParser(description="Generate a viral promo video for any GitHub repo")
    parser.add_argument("url", help="GitHub repo URL (e.g. https://github.com/user/repo)")
    parser.add_argument("--music", choices=["chill", "upbeat", "tech", "hype"], default="tech",
                        help="Background music mood (default: tech)")
    parser.add_argument("--voice", default="Puck",
                        help="Gemini TTS voice (Puck, Kore, Aoede, Charon, Fenrir)")
    parser.add_argument("--music-volume", type=float, default=0.22,
                        help="Background music volume 0.0-1.0 (default: 0.22)")
    parser.add_argument("--output", help="Output filename (default: viral-<repo>.mp4)")
    parser.add_argument("--skip-render", action="store_true", help="Generate composition but skip rendering")
    args = parser.parse_args()

    check_prerequisites()

    # Extract repo name for output
    parts = args.url.rstrip("/").split("/")
    repo_name = parts[-1]
    output_name = args.output or f"viral-{repo_name}.mp4"

    print(f"\n🎬 RepoToViralVideo")
    print(f"   Repo: {args.url}")
    print(f"   Music: {args.music} | Voice: {args.voice}")
    print()

    # Step 1: AI Analysis (Gemini reads the repo page directly)
    print("🤖 Step 1/3 — Analyzing repo with Gemini...")
    analysis = await analyze_repo_for_viral(args.url)
    analysis_dict = asdict(analysis)
    print(f"   ⭐ {analysis.stars:,} stars | 🍴 {analysis.forks:,} forks | 📝 {analysis.language}")
    print(f"   Hook: \"{analysis.hook_text}\"")
    print(f"   Scenes: {' → '.join(analysis.scenes)}")
    print(f"   Style: {analysis.hook_style} ({len(analysis.features)} features, {len(analysis.tech_stack)} tech)")

    # Save analysis
    analysis_path = VIDEO_DIR / "public" / "analysis.json"
    analysis_path.write_text(json.dumps(analysis_dict, indent=2))

    # Step 2: Generate voiceover
    print(f"\n🎤 Step 2/3 — Generating voiceover (Gemini TTS — {args.voice})...")
    audio_dir = str(VIDEO_DIR / "public" / "audio_viral")
    durations = generate_voiceover(analysis.voiceover_scripts, audio_dir, voice=args.voice)
    total_dur = sum(durations.values())
    print(f"   Total duration: {total_dur:.1f}s")

    # Step 3: Generate composition & render
    print(f"\n🎬 Step 3/3 — Rendering video...")
    music_track = MUSIC_MAP.get(args.music, "music/tech.mp3")
    generate_composition(analysis_dict, durations, music_track=music_track, music_volume=args.music_volume)

    if args.skip_render:
        print("\n⏭️  Skipped rendering (--skip-render). Composition generated at apps/video/src/")
        return

    output_path = render_video(output_name)

    print(f"\n✅ Done! Your viral video is at:")
    print(f"   {output_path}")
    print(f"   Duration: {total_dur:.1f}s | 1080p | Ready for X/LinkedIn 🚀")


if __name__ == "__main__":
    asyncio.run(main())
