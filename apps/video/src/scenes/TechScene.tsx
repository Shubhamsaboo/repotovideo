import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { RepoData } from "../types";

const C = {
  bg: "#06050f",
  text: "#ffffff",
  sub: "#9ca0b8",
  purple: "#c084fc",
  blue: "#60a5fa",
  teal: "#2dd4bf",
  green: "#4ade80",
  peach: "#fb923c",
  pink: "#f472b6",
  red: "#f87171",
  gold: "#fbbf24",
};

const PALETTE = [C.green, C.purple, C.blue, C.teal, C.peach, C.red, C.pink, C.gold];

export const TechScene: React.FC<{ data: RepoData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headEntry = spring({ frame, fps, config: { damping: 10, mass: 0.4, stiffness: 200 } });
  const techs = data.techStack.slice(0, 8);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "40%", left: "50%", width: 900, height: 900, borderRadius: "50%", background: `radial-gradient(${C.blue}08, transparent 50%)`, transform: "translate(-50%, -50%)", filter: "blur(40px)" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", zIndex: 1 }}>
        <div style={{
          fontFamily: "Inter, system-ui, sans-serif", fontSize: 64, fontWeight: 900, letterSpacing: -2, marginBottom: 16,
          opacity: headEntry, transform: `scale(${headEntry}) translateY(${interpolate(headEntry, [0, 1], [30, 0])}px)`,
        }}>
          <span style={{ color: C.text }}>Every Major </span>
          <span style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Framework</span>
        </div>
        <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 24, color: C.sub, marginBottom: 50, opacity: headEntry }}>
          All in one place. Pick your stack.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", maxWidth: 1400 }}>
          {techs.map((t, i) => {
            const color = PALETTE[i % PALETTE.length];
            const card = spring({ frame: Math.max(0, frame - 12 - i * 4), fps, config: { damping: 10, mass: 0.3, stiffness: 220 } });
            const float = Math.sin((frame - i * 6) * 0.06) * 4;
            const glow = interpolate(Math.sin((frame - i * 8) * 0.04), [-1, 1], [8, 22]);
            return (
              <div key={i} style={{
                width: 280, height: 140, borderRadius: 24,
                background: `${color}08`, border: `2px solid ${color}25`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
                opacity: card,
                transform: `translateY(${interpolate(card, [0, 1], [60, 0]) + float}px) scale(${interpolate(card, [0, 1], [0.7, 1])})`,
                boxShadow: `0 0 ${glow}px ${color}18, 0 10px 30px rgba(0,0,0,0.4)`,
              }}>
                <div style={{ fontSize: 48 }}>{t.emoji}</div>
                <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 28, fontWeight: 800, color, letterSpacing: 1 }}>{t.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
