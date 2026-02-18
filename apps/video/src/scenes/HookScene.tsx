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
  teal: "#2dd4bf",
  gold: "#fbbf24",
};

export const HookScene: React.FC<{ data: RepoData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numEntry = spring({ frame, fps, config: { damping: 10, mass: 0.5, stiffness: 150 } });
  const textEntry = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 12 } });
  const subEntry = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 15 } });
  const pulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.97, 1.03]);
  const starGlow = interpolate(Math.sin(frame * 0.08), [-1, 1], [30, 60]);

  if (data.hookStyle === "counter" && data.stars >= 10000) {
    // Big animated star counter
    const count = Math.floor(
      interpolate(frame, [0, fps * 2], [0, data.stars], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    );
    return (
      <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "40%", left: "50%", width: 1000, height: 1000, borderRadius: "50%", background: `radial-gradient(${C.gold}10, transparent 50%)`, transform: "translate(-50%, -50%)", filter: "blur(30px)" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", zIndex: 1 }}>
          <div style={{ fontSize: 80, marginBottom: 10, opacity: numEntry, transform: `scale(${numEntry * pulse})`, filter: `drop-shadow(0 0 ${starGlow}px ${C.gold}80)` }}>⭐</div>
          <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 180, fontWeight: 900, letterSpacing: -8, opacity: numEntry, transform: `scale(${numEntry})`, background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: `drop-shadow(0 0 40px ${C.gold}40)`, lineHeight: 1 }}>
            {count.toLocaleString()}+
          </div>
          <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 48, fontWeight: 700, color: C.text, letterSpacing: 8, textTransform: "uppercase" as const, marginTop: 8, opacity: textEntry, transform: `translateY(${interpolate(textEntry, [0, 1], [30, 0])}px)` }}>GITHUB STARS</div>
          <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 28, color: C.purple, marginTop: 20, opacity: subEntry, transform: `translateY(${interpolate(subEntry, [0, 1], [20, 0])}px)` }}>
            {data.hookText || "One repo. Here's why everyone's using it."}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  if (data.hookStyle === "momentum") {
    // Growing stars
    return (
      <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "40%", left: "50%", width: 1000, height: 1000, borderRadius: "50%", background: `radial-gradient(${C.teal}10, transparent 50%)`, transform: "translate(-50%, -50%)", filter: "blur(30px)" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", zIndex: 1 }}>
          <div style={{ fontSize: 72, marginBottom: 10, opacity: numEntry, transform: `scale(${numEntry * pulse})` }}>🚀</div>
          <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 120, fontWeight: 900, letterSpacing: -5, opacity: numEntry, transform: `scale(${numEntry})`, background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
            {Math.floor(data.stars / 1000)}K+ Stars
          </div>
          <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 36, color: C.teal, marginTop: 20, opacity: subEntry, transform: `translateY(${interpolate(subEntry, [0, 1], [20, 0])}px)`, fontWeight: 700 }}>
            and climbing fast
          </div>
          <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 28, color: "#9ca0b8", marginTop: 16, opacity: subEntry }}>
            {data.hookText}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // Problem-focused hook (for new repos)
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "40%", left: "50%", width: 1000, height: 1000, borderRadius: "50%", background: `radial-gradient(${C.purple}10, transparent 50%)`, transform: "translate(-50%, -50%)", filter: "blur(30px)" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", zIndex: 1, padding: "0 120px" }}>
        <div style={{ fontSize: 72, marginBottom: 20, opacity: numEntry, transform: `scale(${numEntry * pulse})` }}>💡</div>
        <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 72, fontWeight: 900, letterSpacing: -3, color: C.text, textAlign: "center", lineHeight: 1.15, opacity: textEntry, transform: `translateY(${interpolate(textEntry, [0, 1], [40, 0])}px)` }}>
          {data.hookText || data.description}
        </div>
      </div>
    </AbsoluteFill>
  );
};
