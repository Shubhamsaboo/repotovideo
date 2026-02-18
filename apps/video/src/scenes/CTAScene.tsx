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
  purple: "#c084fc",
  blue: "#60a5fa",
  teal: "#2dd4bf",
};

export const CTAScene: React.FC<{ data: RepoData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slamEntry = spring({ frame, fps, config: { damping: 8, mass: 0.4, stiffness: 250 } });
  const urlEntry = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 15 } });
  const pulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.96, 1.04]);
  const glow = interpolate(Math.sin(frame * 0.08), [-1, 1], [20, 50]);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "45%", left: "50%", width: 1200, height: 1200, borderRadius: "50%", background: `radial-gradient(${C.purple}12, transparent 50%)`, transform: "translate(-50%, -50%)", filter: "blur(30px)" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", zIndex: 1 }}>
        <div style={{ textAlign: "center", opacity: slamEntry, transform: `scale(${slamEntry * pulse})` }}>
          <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 90, fontWeight: 900, letterSpacing: -3, lineHeight: 1.15 }}>
            <span style={{ color: C.purple }}>Star it.</span>
            <span style={{ color: C.text }}> Fork it.</span>
          </div>
          <div style={{
            fontFamily: "Inter, system-ui, sans-serif", fontSize: 90, fontWeight: 900, letterSpacing: -3,
            background: `linear-gradient(135deg, ${C.purple}, ${C.blue}, ${C.teal})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 ${glow}px ${C.purple}40)`,
          }}>
            Build something incredible.
          </div>
        </div>
        <div style={{
          marginTop: 40, padding: "16px 40px", borderRadius: 20,
          background: `linear-gradient(135deg, ${C.purple}18, ${C.blue}18)`,
          border: `2px solid ${C.purple}35`,
          fontFamily: "Inter, system-ui, sans-serif", fontSize: 28, fontWeight: 600, color: C.text,
          opacity: urlEntry, transform: `translateY(${interpolate(urlEntry, [0, 1], [20, 0])}px)`,
          boxShadow: `0 0 30px ${C.purple}15`,
        }}>
          ⭐ github.com/{data.fullName}
        </div>
      </div>
    </AbsoluteFill>
  );
};
