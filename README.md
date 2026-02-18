# 🎬 RepoToViralVideo

> Turn any GitHub repository into a viral promo video in just one-click.

**RepoToViralVideo** analyzes any GitHub repository and generates a short, high-energy promo video designed to go viral on X/LinkedIn with AI voiceover, kinetic typography, animated stats, and background music.

<p align="left">
  <img src="app_demo.png" width="100%" alt="RepoToViralVideo">
</p>

No video editing skills needed. Just point it at a repo and get a ready-to-share video.

---

## ✨ Features

- 🔥 **Kinetic Typography:** Words slam in from all directions with spring physics
- 📊 **Animated Counters:** Star counts and fork counts animate from 0 to their final number
- 🎤 **AI Voiceover:** Gemini TTS generates natural, conversational narration for each scene
- 🎵 **Background Music:** 4 bundled royalty-free tracks (chill, upbeat, tech, hype) or use your own
- ⚡ **Fast Cuts:** Slide transitions between scenes, nothing stays static
- 🧠 **Smart Analysis:** Gemini 3 Pro reads the repo page directly and extracts impressive stats, features, and selling points
- 🎯 **Adaptive Scenes:** Automatically selects different video styles based on repo maturity (4–6 scenes)
- 🖥️ **Web UI:** Modern frontend to generate videos right from your browser

---

## 🎥 Demo

Here's a viral video generated for [awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) (95K+ ⭐):

https://github.com/user-attachments/assets/c33a9caa-ca88-4bc7-a8a2-44baa7e5a0c9

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **FFmpeg:** `brew install ffmpeg` on macOS or `apt install ffmpeg` on Ubuntu
- **Gemini API key:** [Get yours here](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/Shubhamsaboo/repotovideo.git
cd repotovideo

# 2. Install all dependencies (Python + Node)
npm run install:all

# 3. Set your Gemini API key
export GEMINI_API_KEY="your-key-here"
```

This installs Python dependencies, the video renderer, and the web frontend in one command.

### Generate a Video (CLI)

```bash
python generate.py https://github.com/user/cool-repo
```

This will analyze the repo, generate a voiceover, and render a 1080p video to `apps/video/out/viral-<repo-name>.mp4`.

You can customize the output with flags:

```bash
python generate.py https://github.com/user/repo --music hype --voice Puck
```

**Music moods:** `tech` (default), `hype`, `chill`, `upbeat`
**Voices:** `Puck` (default, energetic), `Kore` (confident), `Aoede` (warm), `Charon` (deep)

### Run the Web UI

```bash
# Terminal 1 — Start the API server (from project root)
cd apps/api
python3 server.py

# Terminal 2 — Start the web frontend (from project root)
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000), enter your Gemini API key and a GitHub URL, pick your music and voice, and hit Generate. The API runs on port 8000 and the frontend on port 3000.

---

## 🏗️ How It Works

The pipeline runs in **3 steps**:

1. **AI Analysis & Script:** Gemini 3 Pro reads the repo page directly (via URL context), extracts stars, forks, features, and tech stack, then writes a punchy Fireship-style voiceover script with scene selection
2. **Generate Voiceover:** Gemini 2.5 Pro TTS creates natural narration with per-scene tone guidance ("say this with building excitement")
3. **Render Video:** Remotion renders dynamic React components into a 1080p MP4 with spring animations, transitions, and background music

The AI adapts the video based on repo maturity:

| Repo Size | Stars | Scenes | Hook Style |
|-----------|-------|--------|------------|
| 🚀 Viral | 10K+ | 6 | Animated star counter |
| 📈 Growing | 100–10K | 5 | Momentum ("X K+ and climbing") |
| 💡 New | <100 | 4 | Problem-focused |

---

## 🎤 Voice Options

All voices use Gemini 2.5 Pro TTS with conversational tone prompting:

| Voice | Style |
|-------|-------|
| **Puck** ⭐ | Playful, energetic: great for hype videos |
| **Kore** | Warm, confident |
| **Aoede** | Smooth, warm |
| **Charon** | Deep, authoritative |

---

## 📁 Project Structure

```
repotovideo/
├── generate.py                  # CLI entry point
├── apps/
│   ├── api/                     # Python FastAPI backend
│   │   ├── server.py               # API server (port 8000)
│   │   ├── requirements.txt
│   │   └── pipeline/
│   │       ├── viral_analyzer.py    # Gemini 3 Pro repo analysis + URL context
│   │       ├── viral_tts.py         # Gemini 2.5 Pro TTS voiceover
│   │       └── viral_renderer.py    # Dynamic Remotion composition generator
│   ├── video/                   # Remotion video renderer
│   │   ├── src/
│   │   │   ├── TutorialVideo.tsx    # Main composition (auto-generated)
│   │   │   ├── Root.tsx             # Remotion root (auto-generated)
│   │   │   ├── types.ts             # RepoData interface
│   │   │   └── scenes/              # Scene components
│   │   │       ├── HookScene.tsx    # Star counter / momentum / problem hook
│   │   │       ├── WhatScene.tsx    # Kinetic title animation
│   │   │       ├── FeaturesScene.tsx
│   │   │       ├── TechScene.tsx
│   │   │       ├── StatsScene.tsx
│   │   │       └── CTAScene.tsx
│   │   └── public/music/           # Bundled royalty-free tracks
│   └── web/                     # Next.js frontend
│       ├── src/app/page.tsx         # Landing page + generate UI
│       └── public/assets/           # Visual assets + demo video
```

---

## 🛠️ Tech Stack

- **AI:** Gemini 3 Pro (analysis) + Gemini 2.5 Pro TTS (voiceover)
- **Video:** [Remotion](https://remotion.dev) (React → MP4)
- **Backend:** FastAPI (Python)
- **Frontend:** Next.js + Framer Motion
- **Audio:** FFmpeg (WAV → MP3 conversion)

---

## 📄 License

MIT - fork it, customize it, make it yours.
