"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import {
  Sparkles, Zap, Github, Star,
  Wand2, Music, Mic, Film, ArrowRight, Terminal, Volume2,
  Palette, Key, Download, CheckCircle, AlertCircle
} from "lucide-react";

// ─── ANIMATED GRID BACKGROUND ───────────────────────────────────
function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Hex grid */}
      <div className="absolute inset-0 hex-pattern animate-grid-drift opacity-60" />
      {/* Grid lines */}
      <div className="absolute inset-0 grid-bg" />
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,61,90,0.06),transparent_60%)]" />
      <div className="absolute top-1/3 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(61,139,255,0.05),transparent_60%)]" />
      <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(0,255,178,0.04),transparent_60%)]" />
    </div>
  );
}

// ─── FLOATING ORBS ──────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[
        { size: 300, x: "10%", y: "20%", color: "rgba(255,61,90,0.05)", delay: 0 },
        { size: 400, x: "70%", y: "40%", color: "rgba(61,139,255,0.04)", delay: 1 },
        { size: 250, x: "50%", y: "70%", color: "rgba(0,255,178,0.03)", delay: 2 },
        { size: 350, x: "85%", y: "10%", color: "rgba(255,214,0,0.03)", delay: 0.5 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size, height: orb.size,
            left: orb.x, top: orb.y,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
          }}
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
        />
      ))}
    </div>
  );
}

// ─── SECTION WRAPPER WITH SCROLL ANIMATIONS ─────────────────────
function AnimatedSection({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── NEON BADGE ─────────────────────────────────────────────────
function NeonBadge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest"
      style={{
        color,
        background: `${color}08`,
        border: `1px solid ${color}20`,
      }}
    >
      {children}
    </span>
  );
}

// ─── FEATURE CARD ───────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, delay }: {
  icon: React.ElementType; title: string; desc: string; color: string; delay: number;
}) {
  return (
    <AnimatedSection delay={delay}>
      <div
        className="glass rounded-2xl p-6 h-full group hover:scale-[1.02] transition-transform duration-300 cursor-default"
        style={{ borderColor: `${color}15` }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${color}40`;
          e.currentTarget.style.boxShadow = `0 0 30px ${color}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = `${color}15`;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: `${color}15` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
        <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
      </div>
    </AnimatedSection>
  );
}

// ─── STEP CARD ──────────────────────────────────────────────────
function StepCard({ step, title, desc, color, icon: Icon }: {
  step: number; title: string; desc: string; color: string; icon: React.ElementType;
}) {
  return (
    <AnimatedSection delay={step * 0.15} className="relative">
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
            style={{
              background: `linear-gradient(135deg, ${color}20, ${color}05)`,
              border: `1px solid ${color}30`,
            }}
          >
            <Icon size={24} style={{ color }} />
            <span
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: color, color: "#0A0A0F" }}
            >
              {step}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{desc}</p>
        </div>
      </div>
    </AnimatedSection>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────
export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [music, setMusic] = useState("tech");
  const [voice, setVoice] = useState("Puck");
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heroRef = useRef(null);

  const pollStatus = useCallback(async (id: string) => {
    const maxPolls = 300; // 5 min max
    for (let i = 0; i < maxPolls; i++) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const res = await fetch(`/api/status/${id}`);
        const data = await res.json();

        if (data.error) {
          setError(data.error);
          setGenerating(false);
          return;
        }

        setStep(data.step);
        setStatusMsg(data.message);

        if (data.status === "done") {
          setVideoReady(true);
          setGenerating(false);
          return;
        }
        if (data.status === "error") {
          setError(data.message);
          setGenerating(false);
          return;
        }
      } catch {
        // retry on network error
      }
    }
    setError("Timed out");
    setGenerating(false);
  }, []);

  const handleGenerate = async () => {
    if (!repoUrl || !apiKey) return;
    setGenerating(true);
    setStep(1);
    setError(null);
    setVideoReady(false);
    setJobId(null);
    setStatusMsg("Starting...");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, apiKey, music, voice }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setGenerating(false);
        return;
      }

      setJobId(data.job_id);
      pollStatus(data.job_id);
    } catch (e: any) {
      setError(e.message);
      setGenerating(false);
    }
  };

  return (
    <main className="relative min-h-screen">
      <GridBackground />
      <FloatingOrbs />

      {/* ─── NAV ──────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF3D5A] to-[#3D8BFF] flex items-center justify-center">
              <Film size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">RepoToViralVideo</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">How It Works</a>
            <a href="#generate" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Generate</a>
            <a
              href="https://github.com/Shubhamsaboo/repotovideo"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium glass hover:bg-white/5 transition-colors"
            >
              <Github size={16} /> Star on GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative z-10 pt-32 pb-12 px-6"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Sparkles size={14} className="text-[#FFD600]" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Open Source • Powered by Gemini • Fully Customizable
              </span>
            </div>
          </AnimatedSection>

          {/* Headline */}
          <AnimatedSection delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
              Turn any GitHub repo
              <br />
              into a{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#FF3D5A] via-[#3D8BFF] to-[#00FFB2] bg-clip-text text-transparent animate-gradient">
                  viral video
                </span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-[#FF3D5A] via-[#3D8BFF] to-[#00FFB2]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                />
              </span>
            </h1>
          </AnimatedSection>

          {/* Subtitle */}
          <AnimatedSection delay={0.2}>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Paste a GitHub URL. Get a share-ready promo video with AI voiceover,
              kinetic typography, and animated stats. In seconds.
            </p>
          </AnimatedSection>

          {/* CTA Buttons */}
          <AnimatedSection delay={0.3}>
            <div className="flex items-center justify-center gap-4 mb-10">
              <a
                href="#generate"
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-black bg-gradient-to-r from-[#FF3D5A] to-[#3D8BFF] hover:opacity-90 transition-opacity"
              >
                <Wand2 size={18} />
                Generate Video
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://github.com/Shubhamsaboo/repotovideo"
                target="_blank"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold glass hover:bg-white/5 transition-colors"
              >
                <Github size={18} />
                View Source
              </a>
            </div>
          </AnimatedSection>

          {/* Hero video preview */}
          <AnimatedSection delay={0.4}>
            <div className="relative max-w-4xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden border border-white/5">
                <iframe
                  className="w-full aspect-video"
                  src="https://www.youtube.com/embed/C6mMseavn8Q"
                  title="RepoToViralVideo Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {/* Glow behind video */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#FF3D5A]/5 via-[#3D8BFF]/5 to-[#00FFB2]/5 rounded-3xl blur-xl -z-10" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-5xl" />

      {/* ─── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-10">
              <NeonBadge color="#FF3D5A"><Zap size={12} /> Features</NeonBadge>
              <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4">
                Everything you need to go{" "}
                <span className="text-[#FF3D5A]">viral</span>
              </h2>
              <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
                AI-powered pipeline that handles analysis, scripting, voiceover, and rendering.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={Sparkles} title="AI Analysis" desc="Gemini 3.1 Pro extracts the most impressive stats, features, and selling points from any repo." color="#FF3D5A" delay={0} />
            <FeatureCard icon={Mic} title="Natural Voiceover" desc="Gemini TTS generates conversational, energetic narration — not robotic text-to-speech." color="#00FFB2" delay={0.1} />
            <FeatureCard icon={Film} title="Kinetic Typography" desc="Words slam in with spring physics. Numbers animate up. Nothing stays static." color="#3D8BFF" delay={0.2} />
            <FeatureCard icon={Music} title="Background Music" desc="4 bundled royalty-free tracks to match the vibe — chill, upbeat, tech, or hype." color="#FFD600" delay={0.3} />
            <FeatureCard icon={Palette} title="Smart Scenes" desc="Adapts to repo maturity — star counters for viral repos, problem hooks for new ones." color="#c084fc" delay={0.4} />
            <FeatureCard icon={Github} title="Fully Open Source" desc="Self-hosted, no vendor lock-in. Fork it, customize it, make it yours. MIT licensed." color="#00FFB2" delay={0.5} />
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-4xl" />

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-10">
              <NeonBadge color="#3D8BFF"><Terminal size={12} /> Pipeline</NeonBadge>
              <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4">
                How it{" "}
                <span className="text-[#3D8BFF]">works</span>
              </h2>
              <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
                Three steps from GitHub URL to viral video. All automated.
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-10">
            <StepCard step={1} icon={Sparkles} title="AI Analysis & Script" desc="Gemini 3.1 Pro reads the repo page directly, extracts impressive stats and features, and writes a punchy Fireship-style voiceover script." color="#FF3D5A" />
            <StepCard step={2} icon={Volume2} title="Generate Voiceover" desc="Gemini TTS creates natural, conversational narration with per-scene tone guidance." color="#00FFB2" />
            <StepCard step={3} icon={Film} title="Render Video" desc="Remotion renders React components into a 1080p video with spring animations, transitions, and background music." color="#3D8BFF" />
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-3xl" />

      {/* ─── GENERATE SECTION ─────────────────────────────── */}
      <section id="generate" className="relative z-10 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <NeonBadge color="#FFD600"><Wand2 size={12} /> Generate</NeonBadge>
              <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4">
                Create your{" "}
                <span className="text-[#FFD600]">video</span>
              </h2>
              <p className="text-[var(--text-secondary)]">
                Paste a GitHub URL, add your Gemini API key, and hit generate.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="glass-strong rounded-3xl p-8 md:p-10">
              {/* API Key */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                  <Key size={14} />
                  Gemini API Key
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    className="text-[#3D8BFF] hover:underline ml-auto text-xs"
                  >
                    Get your Gemini API Key →
                  </a>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/8 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3D8BFF]/40 focus:ring-1 focus:ring-[#3D8BFF]/20 transition-all font-mono text-sm"
                />
              </div>

              {/* Repo URL */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                  <Github size={14} />
                  GitHub Repository URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/user/awesome-repo"
                    className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/8 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF3D5A]/40 focus:ring-1 focus:ring-[#FF3D5A]/20 transition-all"
                  />
                </div>
              </div>

              {/* Options row */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                    <Music size={14} /> Music Mood
                  </label>
                  <select value={music} onChange={e => setMusic(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/8 text-white focus:outline-none focus:border-[#FFD600]/40 transition-all text-sm appearance-none cursor-pointer">
                    <option value="tech">🔊 Tech</option>
                    <option value="hype">🔥 Hype</option>
                    <option value="chill">☁️ Chill</option>
                    <option value="upbeat">⚡ Upbeat</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                    <Mic size={14} /> Voice
                  </label>
                  <select value={voice} onChange={e => setVoice(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/8 text-white focus:outline-none focus:border-[#00FFB2]/40 transition-all text-sm appearance-none cursor-pointer">
                    <option value="Puck">🎭 Puck (energetic)</option>
                    <option value="Kore">🌟 Kore (confident)</option>
                    <option value="Aoede">🎵 Aoede (warm)</option>
                    <option value="Charon">🗿 Charon (deep)</option>
                  </select>
                </div>
              </div>

              {/* Generate button */}
              <motion.button
                onClick={handleGenerate}
                disabled={!repoUrl || !apiKey || generating}
                className="w-full py-4 rounded-2xl font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, #FF3D5A, #3D8BFF)",
                  color: "white",
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {generating ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Generating... Step {step}/3
                    </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      Generate Viral Video
                    </>
                  )}
                </span>
              </motion.button>

              {/* Progress steps */}
              {generating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-3"
                >
                  {[
                    { label: "AI analysis & script", color: "#FF3D5A" },
                    { label: "Generating voiceover", color: "#00FFB2" },
                    { label: "Rendering video", color: "#3D8BFF" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: step > i + 1 ? s.color : step === i + 1 ? `${s.color}30` : "rgba(255,255,255,0.05)",
                          color: step > i + 1 ? "#0A0A0F" : step === i + 1 ? s.color : "rgba(255,255,255,0.2)",
                          border: step === i + 1 ? `1px solid ${s.color}` : "none",
                        }}
                      >
                        {step > i + 1 ? "✓" : i + 1}
                      </div>
                      <span className={step >= i + 1 ? "text-white text-sm" : "text-white/30 text-sm"}>
                        {s.label}
                      </span>
                      {step === i + 1 && (
                        <motion.div
                          className="w-2 h-2 rounded-full ml-auto"
                          style={{ background: s.color }}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </div>
                  ))}
                  {statusMsg && (
                    <div className="text-xs text-[var(--text-secondary)] mt-3 font-mono">{statusMsg}</div>
                  )}
                </motion.div>
              )}

              {/* Error state */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-[#FF3D5A]/10 border border-[#FF3D5A]/20 flex items-start gap-3"
                >
                  <AlertCircle size={18} className="text-[#FF3D5A] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-[#FF3D5A]">Generation failed</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">{error}</div>
                  </div>
                </motion.div>
              )}

              {/* Video ready — preview + download */}
              {videoReady && jobId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="p-4 rounded-xl bg-[#00FFB2]/10 border border-[#00FFB2]/20 flex items-center gap-3 mb-4">
                    <CheckCircle size={18} className="text-[#00FFB2] flex-shrink-0" />
                    <div className="text-sm font-medium text-[#00FFB2]">Your viral video is ready!</div>
                  </div>
                  {/* Video preview */}
                  <div className="rounded-xl overflow-hidden border border-white/10 mb-4">
                    <video
                      className="w-full"
                      src={`/api/download/${jobId}`}
                      controls
                      autoPlay
                      playsInline
                    />
                  </div>
                  {/* Download button */}
                  <a
                    href={`/api/download/${jobId}`}
                    download
                    className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 text-black"
                    style={{ background: "linear-gradient(135deg, #00FFB2, #3D8BFF)" }}
                  >
                    <Download size={20} />
                    Download Video
                  </a>
                </motion.div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-4xl" />

      {/* ─── CLI SECTION ──────────────────────────────────── */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <NeonBadge color="#c084fc"><Terminal size={12} /> CLI</NeonBadge>
              <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4">
                Or use the{" "}
                <span className="text-[#c084fc]">command line</span>
              </h2>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="glass rounded-2xl overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-black/30 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-[#FF3D5A]/70" />
                <div className="w-3 h-3 rounded-full bg-[#FFD600]/70" />
                <div className="w-3 h-3 rounded-full bg-[#00FFB2]/70" />
                <span className="ml-3 text-xs text-[var(--text-secondary)] font-mono">terminal</span>
              </div>
              {/* Terminal body */}
              <div className="p-6 font-mono text-sm space-y-4">
                <div>
                  <span className="text-[#00FFB2]">$</span>{" "}
                  <span className="text-white">pip install -r apps/api/requirements.txt</span>
                </div>
                <div>
                  <span className="text-[#00FFB2]">$</span>{" "}
                  <span className="text-white">export</span>{" "}
                  <span className="text-[#FFD600]">GEMINI_API_KEY</span>
                  <span className="text-white">=your-key-here</span>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[#00FFB2]">$</span>{" "}
                  <span className="text-[#3D8BFF]">python</span>{" "}
                  <span className="text-white">generate.py</span>{" "}
                  <span className="text-[#FF3D5A]">https://github.com/user/repo</span>{" "}
                  <span className="text-[var(--text-secondary)]">--music hype --voice Puck</span>
                </div>
                <div className="text-[var(--text-secondary)]">
                  <div>🎬 RepoToViralVideo</div>
                  <div>🤖 Step 1/3 — Analyzing repo...</div>
                  <div>🎤 Step 2/3 — Generating voiceover...</div>
                  <div>🎬 Step 3/3 — Rendering video...</div>
                  <div className="text-[#00FFB2] font-bold mt-2">✅ Done! viral-repo.mp4 (8.9 MB, 58s, 1080p)</div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────── */}
      <footer className="relative z-10 py-16 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF3D5A] to-[#3D8BFF] flex items-center justify-center">
              <Film size={16} className="text-white" />
            </div>
            <span className="font-bold">RepoToViralVideo</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Built by{" "}
            <a href="https://github.com/Shubhamsaboo" target="_blank" className="text-white hover:underline">
              Shubham Saboo
            </a>
            {" "}• Open source under MIT
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Shubhamsaboo/repotovideo"
              target="_blank"
              className="text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              <Github size={20} />
            </a>
            <a
              href="https://github.com/Shubhamsaboo/repotovideo"
              target="_blank"
              className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[#FFD600] transition-colors text-sm"
            >
              <Star size={14} /> Star
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
