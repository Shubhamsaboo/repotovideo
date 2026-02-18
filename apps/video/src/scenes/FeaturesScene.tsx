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
  purple: "#c084fc",
  blue: "#60a5fa",
  teal: "#2dd4bf",
  green: "#4ade80",
};

const COLORS = [C.purple, C.blue, C.teal, C.green];

export const FeaturesScene: React.FC<{ data: RepoData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const badgeEntry = spring({ frame, fps, config: { damping: 12 } });
  const features = data.features.slice(0, 4);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", width: 800, height: 800, borderRadius: "50%", background: `radial-gradient(${C.purple}08, transparent 50%)`, transform: "translate(-50%, -50%)", filter: "blur(40px)" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", zIndex: 1, gap: 36 }}>
        <div style={{
          padding: "10px 28px", borderRadius: 16,
          background: `${C.purple}10`, border: `1px solid ${C.purple}25`,
          color: C.purple, fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 18, fontWeight: 700, letterSpacing: 3,
          opacity: badgeEntry, transform: `scale(${badgeEntry})`,
        }}>
          🔥 WHAT YOU CAN BUILD
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center", maxWidth: 1300 }}>
          {features.map((f, i) => {
            const color = COLORS[i % COLORS.length];
            const card = spring({ frame: Math.max(0, frame - 8 - i * 6), fps, config: { damping: 10, mass: 0.35, stiffness: 200 } });
            const float = Math.sin((frame - i * 8) * 0.05) * 5;
            const glow = interpolate(Math.sin((frame - i * 10) * 0.04), [-1, 1], [10, 30]);
            return (
              <div key={i} style={{
                width: 580, height: 180, borderRadius: 28,
                background: `linear-gradient(160deg, ${color}14, ${color}04)`,
                border: `2px solid ${color}30`,
                display: "flex", alignItems: "center", gap: 28, padding: "0 40px",
                opacity: card,
                transform: `translateY(${interpolate(card, [0, 1], [80, 0]) + float}px) scale(${interpolate(card, [0, 1], [0.7, 1])})`,
                boxShadow: `0 0 ${glow}px ${color}20, 0 12px 40px rgba(0,0,0,0.5)`,
              }}>
                <div style={{ fontSize: 64, flexShrink: 0 }}>{f.emoji}</div>
                <div>
                  <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 36, fontWeight: 900, color, letterSpacing: 2 }}>{f.title}</div>
                  <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 20, color: "#9ca0b8", marginTop: 4 }}>{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
