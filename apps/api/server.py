"""
🎬 RepoToViralVideo API Server

FastAPI server that handles the full pipeline:
POST /api/generate → analyze repo → TTS → render → return video
"""

import asyncio
import os
import uuid
from dataclasses import asdict
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from pipeline.viral_analyzer import analyze_repo_for_viral
from pipeline.viral_tts import generate_voiceover
from pipeline.viral_renderer import generate_composition, render_video, VIDEO_DIR

app = FastAPI(title="RepoToViralVideo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Track active jobs
jobs: dict[str, dict] = {}


class GenerateRequest(BaseModel):
    repo_url: str
    api_key: str
    music: str = "tech"
    voice: str = "Puck"
    music_volume: float = 0.22


class JobStatus(BaseModel):
    job_id: str
    status: str  # "pending" | "analyzing" | "voiceover" | "rendering" | "done" | "error"
    step: int  # 1-3
    message: str
    video_path: str | None = None


@app.post("/api/generate")
async def generate_video(req: GenerateRequest) -> dict:
    """Start a video generation job. Returns job_id to poll for status."""
    job_id = str(uuid.uuid4())[:8]
    jobs[job_id] = {"status": "pending", "step": 0, "message": "Starting...", "video_path": None}
    
    # Run pipeline in background
    asyncio.create_task(_run_pipeline(job_id, req))
    
    return {"job_id": job_id}


@app.get("/api/status/{job_id}")
async def get_status(job_id: str) -> JobStatus:
    """Poll job status."""
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    return JobStatus(job_id=job_id, **jobs[job_id])


@app.get("/api/download/{job_id}")
async def download_video(job_id: str):
    """Download the rendered video."""
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    
    job = jobs[job_id]
    if job["status"] != "done" or not job["video_path"]:
        raise HTTPException(400, "Video not ready")
    
    path = job["video_path"]
    if not os.path.exists(path):
        raise HTTPException(404, "Video file not found")
    
    return FileResponse(
        path,
        media_type="video/mp4",
        filename=os.path.basename(path),
    )


MUSIC_MAP = {
    "chill": "music/chill.mp3",
    "upbeat": "music/upbeat.mp3",
    "tech": "music/tech.mp3",
    "hype": "music/hype.mp3",
}


async def _run_pipeline(job_id: str, req: GenerateRequest):
    """Run the full video generation pipeline."""
    try:
        # Set API key for this request
        os.environ["GEMINI_API_KEY"] = req.api_key
        
        # Step 1: AI Analysis (Gemini reads the repo page directly)
        jobs[job_id] = {"status": "analyzing", "step": 1, "message": "Analyzing repo with Gemini...", "video_path": None}
        analysis = await analyze_repo_for_viral(req.repo_url)
        analysis_dict = asdict(analysis)
        
        # Step 2: Generate voiceover
        jobs[job_id] = {"status": "voiceover", "step": 2, "message": "Generating voiceover...", "video_path": None}
        audio_dir = str(VIDEO_DIR / "public" / "audio_viral")
        durations = await asyncio.to_thread(
            generate_voiceover, analysis.voiceover_scripts, audio_dir, voice=req.voice
        )
        
        # Step 3: Render video
        jobs[job_id] = {"status": "rendering", "step": 3, "message": "Rendering video...", "video_path": None}
        music_track = MUSIC_MAP.get(req.music, "music/tech.mp3")
        generate_composition(analysis_dict, durations, music_track=music_track, music_volume=req.music_volume)
        
        repo_name = req.repo_url.rstrip("/").split("/")[-1]
        output_name = f"viral-{repo_name}-{job_id}.mp4"
        output_path = await asyncio.to_thread(render_video, output_name)
        
        # Done
        jobs[job_id] = {
            "status": "done",
            "step": 3,
            "message": "Video ready!",
            "video_path": output_path,
        }
        
    except Exception as e:
        jobs[job_id] = {
            "status": "error",
            "step": jobs[job_id].get("step", 0),
            "message": str(e),
            "video_path": None,
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
