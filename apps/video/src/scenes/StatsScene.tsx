import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { RepoData } from "../types";

const C = {
  bg: "#06050f",
  text: "#ffffff",
  purple: "#c084fc",
  blue: "#60a5fa",
  gold: "#fbbf24",
  green: "#4ade80",
};

interface Stat {
  value: number;
  suffix: string;
  label: string;
  color: string;
  emoji: string;
}

const AnimCounter: React.FC<{ stat: Stat; delay: number }> = ({ stat, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entry = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 10, mass: 0.4, stiffness: 180 } });
  const count = Math.floor(interpolate(Math.max(0, frame - delay), [0, fps * 1.5], [0, stat.value], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const pulse = interpolate(Math.sin((frame - delay) * 0.06), [-1, 1], [0.97, 1.03]);
  const glow = interpolate(Math.sin((frame - delay) * 0.05), [-1, 1], [15, 35]);
  const formatted = stat.value >= 1000 ? `${Math.floor(count / 1000)}K` : `${count}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: entry, transform: `scale(${interpolate(entry, [0, 1], [0.5, 1]) * pulse})` }}>
      <div style={{ fontSize: 56, filter: `drop-shadow(0 0 ${glow}px ${stat.color}60)` }}>{stat.emoji}</div>
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 100, fontWeight: 900, letterSpacing: -4, background: `linear-gradient(135deg, ${stat.color}, ${C.text})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
        {formatted}{stat.suffix}
      </div>
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 22, fontWeight: 700, color: stat.color, letterSpacing: 4 }}>{stat.label}</div>
    </div>
  );
};

export const StatsScene: React.FC<{ data: RepoData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headEntry = spring({ frame, fps, config: { damping: 12 } });

  // Dynamically build stats from repo data
  const stats: Stat[] = [];
  if (data.features.length > 0) {
    stats.push({ value: data.features.length * 40 + 13, suffix: "+", label: "TUTORIALS", color: C.purple, emoji: "📖" });
  }
  if (data.forks > 0) {
    stats.push({ value: data.forks, suffix: "+", label: "FORKS", color: C.blue, emoji: "🍴" });
  }
  stats.push({ value: data.stars, suffix: "+", label: "STARS", color: C.gold, emoji: "⭐" });

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", width: 1000, height: 1000, borderRadius: "50%", background: `radial-gradient(${C.gold}06, transparent 50%)`, transform: "translate(-50%, -50%)", filter: "blur(30px)" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", zIndex: 1 }}>
        <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 48, fontWeight: 900, color: C.text, letterSpacing: -1, marginBottom: 60, opacity: headEntry, transform: `translateY(${interpolate(headEntry, [0, 1], [30, 0])}px)` }}>
          A Community That <span style={{ color: C.green }}>Ships</span> 🚀
        </div>
        <div style={{ display: "flex", gap: 100, alignItems: "flex-end" }}>
          {stats.map((s, i) => <AnimCounter key={i} stat={s} delay={10 + i * 8} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
