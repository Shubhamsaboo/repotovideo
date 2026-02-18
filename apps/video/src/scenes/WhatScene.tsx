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
  sub: "#9ca0b8",
  purple: "#c084fc",
  blue: "#60a5fa",
  teal: "#2dd4bf",
};

const Word: React.FC<{
  text: string;
  delay: number;
  size?: number;
  gradient?: boolean;
  from?: "left" | "right" | "bottom";
}> = ({ text, delay, size = 100, gradient, from = "bottom" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 12, mass: 0.4, stiffness: 200 },
  });

  const offsets = { left: [-300, 0], right: [300, 0], bottom: [0, 100] };
  const [startX, startY] = from === "bottom" ? [0, 100] : offsets[from];
  const x = interpolate(entry, [0, 1], [startX, 0]);
  const y = interpolate(entry, [0, 1], [startY, 0]);
  const r = from !== "bottom" ? interpolate(entry, [0, 1], [from === "left" ? -10 : 10, 0]) : 0;
  const float = Math.sin((frame - delay) * 0.04) * 2;

  const base: React.CSSProperties = {
    fontFamily: "Inter, system-ui, sans-serif", fontSize: size, fontWeight: 900,
    letterSpacing: -3, lineHeight: 1.05, opacity: entry,
    transform: `translate(${x}px, ${y + float}px) rotate(${r}deg)`, display: "inline-block",
  };

  if (gradient) {
    return <span style={{ ...base, background: `linear-gradient(135deg, ${C.purple}, ${C.blue}, ${C.teal})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: `drop-shadow(0 0 30px ${C.purple}50)` }}>{text}</span>;
  }
  return <span style={{ ...base, color: C.text }}>{text}</span>;
};

export const WhatScene: React.FC<{ data: RepoData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const descEntry = spring({ frame: Math.max(0, frame - 50), fps, config: { damping: 20 } });

  // Split name into words for kinetic animation
  const words = data.name.replace(/[-_]/g, " ").split(/\s+/).filter(Boolean);
  const directions: Array<"left" | "right" | "bottom"> = ["left", "right", "bottom"];

  // Auto-size: fewer words = bigger text
  const wordSize = words.length <= 2 ? 130 : words.length <= 4 ? 100 : 80;

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "35%", left: "50%", width: 900, height: 900, borderRadius: "50%", background: `radial-gradient(${C.purple}0a, transparent 55%)`, transform: "translate(-50%, -50%)", filter: "blur(30px)" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", zIndex: 1 }}>
        <div style={{ fontSize: 64, marginBottom: 16, opacity: spring({ frame, fps, config: { damping: 10, mass: 0.3 } }), transform: `scale(${spring({ frame, fps, config: { damping: 10, mass: 0.3 } })})` }}>🚀</div>
        <div style={{ textAlign: "center", maxWidth: 1500, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20 }}>
          {words.map((word, i) => (
            <Word key={i} text={word} delay={3 + i * 3} size={wordSize} gradient={i % 2 === 1} from={directions[i % 3]} />
          ))}
        </div>
        <div style={{
          marginTop: 30, fontFamily: "Inter, system-ui, sans-serif", fontSize: 32,
          color: C.sub, textAlign: "center", maxWidth: 900, opacity: descEntry,
          transform: `translateY(${interpolate(descEntry, [0, 1], [20, 0])}px)`,
        }}>
          {data.tagline || data.description}
        </div>
        <div style={{
          width: interpolate(frame, [15, 40], [0, 500], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }),
          height: 4, borderRadius: 2, marginTop: 24,
          background: `linear-gradient(90deg, transparent, ${C.purple}, ${C.blue}, ${C.teal}, transparent)`,
          boxShadow: `0 0 20px ${C.purple}40`,
        }} />
      </div>
    </AbsoluteFill>
  );
};
