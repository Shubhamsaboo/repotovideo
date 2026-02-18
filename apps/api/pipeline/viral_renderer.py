"""
🎬 Viral Video Renderer — Dynamic Remotion composition generator

Generates TutorialVideo.tsx and Root.tsx dynamically based on repo analysis,
then renders with Remotion CLI.
"""

import json
import os
import subprocess
from pathlib import Path
from dataclasses import asdict


FPS = 30
VIDEO_DIR = Path(__file__).resolve().parent.parent.parent / "video"


def generate_composition(
    analysis: dict,
    durations: dict[str, float],
    music_track: str = "music/tech.mp3",
    music_volume: float = 0.22,
) -> None:
    """Generate TutorialVideo.tsx with dynamic scenes based on analysis."""
    
    scenes = analysis["scenes"]
    
    # Build SCENES array
    scene_entries = []
    for i, scene_id in enumerate(scenes):
        dur = durations.get(scene_id, 5.0)
        scene_entries.append(
            f'  {{ id: "{scene_id}", dur: Math.ceil({dur:.3f} * FPS), audio: "audio_viral/scene_{i:02d}.mp3" }}'
        )
    scenes_array = ",\n".join(scene_entries)
    
    total_dur = sum(durations.get(s, 5.0) for s in scenes)
    
    # Build scene data
    scene_data = json.dumps({
        "name": analysis["name"],
        "fullName": analysis["full_name"],
        "description": analysis["description"],
        "stars": analysis["stars"],
        "forks": analysis["forks"],
        "language": analysis["language"],
        "hookStyle": analysis["hook_style"],
        "hookText": analysis["hook_text"],
        "tagline": analysis["tagline"],
        "features": analysis["features"],
        "techStack": analysis["tech_stack"],
    }, indent=2).replace('"', "'").replace("\n", "\n")
    
    # Build scene component imports & renders
    scene_imports = set()
    scene_renders = []
    
    for scene_id in scenes:
        component = get_scene_component(scene_id)
        scene_imports.add(component)
        scene_renders.append(f"""
        <TransitionSeries.Sequence durationInFrames={{getSceneDur("{scene_id}")}}>
          <{component} data={{DATA}} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={{slide({{ direction: "from-right" }})}}
          timing={{linearTiming({{ durationInFrames: 8 }})}}
        />""")
    
    # Remove trailing transition
    if scene_renders:
        scene_renders[-1] = scene_renders[-1].rsplit("<TransitionSeries.Transition", 1)[0]
    
    imports_str = "\n".join(
        f'import {{ {c} }} from "./scenes/{c}";'
        for c in sorted(scene_imports)
    )
    
    tutorial_tsx = f"""import {{ Audio, staticFile }} from "remotion";
import {{ TransitionSeries, linearTiming }} from "@remotion/transitions";
import {{ slide }} from "@remotion/transitions/slide";
import {{ fade }} from "@remotion/transitions/fade";
{imports_str}

const FPS = {FPS};

const SCENES = [
{scenes_array}
];

const DATA = {scene_data};

function getSceneDur(id: string): number {{
  return SCENES.find(s => s.id === id)?.dur ?? 150;
}}

export const TutorialVideo = () => {{
  return (
    <div style={{ {{ backgroundColor: "#0a0a0a", width: 1920, height: 1080 }} }}>
      {{/* Background music */}}
      <Audio src={{staticFile("{music_track}")}} volume={{{music_volume}}} />
      
      <TransitionSeries>
        {{/* Scene audio tracks */}}
        {{SCENES.map((s, i) => (
          <TransitionSeries.Sequence key={{s.id + "-audio"}} durationInFrames={{s.dur}}>
            <Audio src={{staticFile(s.audio)}} volume={{0.9}} />
          </TransitionSeries.Sequence>
        ))}}
      </TransitionSeries>

      <TransitionSeries>
        {"".join(scene_renders)}
      </TransitionSeries>
    </div>
  );
}};
"""
    
    root_tsx = f"""import {{ Composition }} from "remotion";
import {{ TutorialVideo }} from "./TutorialVideo";

const FPS = {FPS};
// {" + ".join(f"{durations.get(s, 5.0):.3f}" for s in scenes)} = {total_dur:.3f}s
const TOTAL = Math.ceil({total_dur:.3f} * FPS);

export const RemotionRoot = () => {{
  return (
    <Composition
      id="ViralVideo"
      component={{TutorialVideo}}
      durationInFrames={{TOTAL}}
      fps={{FPS}}
      width={{1920}}
      height={{1080}}
    />
  );
}};
"""
    
    # Write files
    src_dir = VIDEO_DIR / "src"
    (src_dir / "TutorialVideo.tsx").write_text(tutorial_tsx)
    (src_dir / "Root.tsx").write_text(root_tsx)
    
    print(f"  📝 Generated composition: {len(scenes)} scenes, {total_dur:.1f}s")


def get_scene_component(scene_id: str) -> str:
    """Map scene ID to React component name."""
    return {
        "hook": "HookScene",
        "what": "WhatScene",
        "features": "FeaturesScene",
        "tech": "TechScene",
        "stats": "StatsScene",
        "cta": "CTAScene",
    }.get(scene_id, "HookScene")


def render_video(output_name: str = "viral-output.mp4", concurrency: int = 4) -> str:
    """Render the video using Remotion CLI."""
    
    output_path = str(VIDEO_DIR / "out" / output_name)
    
    print(f"  🎬 Rendering video...")
    subprocess.run(
        ["npx", "remotion", "render", "ViralVideo", output_path,
         f"--concurrency={concurrency}"],
        cwd=str(VIDEO_DIR),
        check=True,
    )
    
    # Cleanup chrome processes
    subprocess.run(["pkill", "-f", "chrome-headless-shell"], capture_output=True)
    
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"  ✅ Output: {output_path} ({size_mb:.1f} MB)")
    
    return output_path


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python viral_renderer.py <analysis.json> <durations.json> [output.mp4]")
        sys.exit(1)
    
    with open(sys.argv[1]) as f:
        analysis = json.load(f)
    with open(sys.argv[2]) as f:
        durations = json.load(f)
    
    output = sys.argv[3] if len(sys.argv) > 3 else "viral-output.mp4"
    
    generate_composition(analysis, durations)
    render_video(output)
