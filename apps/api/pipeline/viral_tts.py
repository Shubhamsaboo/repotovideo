"""
🎤 Viral Video TTS — Gemini 2.5 Pro Preview TTS

Generates voiceover audio for each scene using Gemini's natural TTS.
"""

import os
import subprocess
from pathlib import Path

from google import genai
from google.genai import types


VOICE = "Puck"  # Natural, playful, energetic
MODEL = "gemini-2.5-pro-preview-tts"

TONE_HINTS = {
    "hook": "Say this with excitement and energy, like revealing something amazing. Grab attention immediately:",
    "what": "Say this with confidence and authority, introducing something impressive:",
    "features": "Say this with building excitement, each item more impressive than the last:",
    "tech": "Say this like listing an impressive roster, with emphasis on each name:",
    "stats": "Say this with pride, emphasizing the numbers like they're incredible achievements:",
    "cta": "Say this as a powerful, memorable call to action. End strong:",
}


def generate_voiceover(
    voiceover_scripts: dict[str, str],
    output_dir: str,
    voice: str = VOICE,
) -> dict[str, float]:
    """Generate TTS audio for each scene.
    
    Returns: dict of scene_id -> duration in seconds
    """
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    
    durations = {}
    scene_index = 0
    
    for scene_id, script in voiceover_scripts.items():
        fname = f"scene_{scene_index:02d}.mp3"
        raw_path = f"/tmp/viral_tts_{scene_id}_raw.wav"
        mp3_path = str(out / fname)
        
        tone = TONE_HINTS.get(scene_id, "Say this naturally and engagingly:")
        prompt = f"{tone} {script}"
        
        print(f"  🎤 Generating {scene_id} ({fname})...")
        
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name=voice
                            )
                        )
                    ),
                ),
            )
        except Exception as e:
            raise RuntimeError(f"TTS generation failed for scene '{scene_id}': {e}")
        
        # Extract audio data from response
        audio_data = None
        if response.candidates:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    audio_data = part.inline_data.data
                    break
        
        if not audio_data:
            raise RuntimeError(
                f"No audio data returned by TTS for scene '{scene_id}'. "
                f"Check your Gemini API key and quota."
            )
        
        with open(raw_path, "wb") as f:
            f.write(audio_data)
        
        # Convert to MP3 (check exit code)
        ffmpeg_result = subprocess.run(
            ["ffmpeg", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1",
             "-i", raw_path, "-b:a", "192k", mp3_path],
            capture_output=True, text=True,
        )
        if ffmpeg_result.returncode != 0:
            raise RuntimeError(
                f"ffmpeg conversion failed for scene '{scene_id}': {ffmpeg_result.stderr}"
            )
        
        # Get duration (with fallback)
        try:
            result = subprocess.run(
                ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
                 "-of", "csv=p=0", mp3_path],
                capture_output=True, text=True,
            )
            dur = float(result.stdout.strip())
        except (ValueError, AttributeError):
            print(f"    ⚠️  Could not read duration for {scene_id}, using estimate")
            dur = max(len(script.split()) * 0.35, 3.0)  # ~0.35s per word
        
        durations[scene_id] = dur
        print(f"    ✅ {dur:.2f}s")
        
        # Cleanup temp file
        try:
            os.remove(raw_path)
        except OSError:
            pass
        
        scene_index += 1
    
    return durations


if __name__ == "__main__":
    import json, sys
    
    if len(sys.argv) < 2:
        print("Usage: python viral_tts.py <analysis.json> [output_dir]")
        sys.exit(1)
    
    with open(sys.argv[1]) as f:
        analysis = json.load(f)
    
    out_dir = sys.argv[2] if len(sys.argv) > 2 else "./audio_viral"
    durations = generate_voiceover(analysis["voiceover_scripts"], out_dir)
    print(json.dumps(durations, indent=2))
