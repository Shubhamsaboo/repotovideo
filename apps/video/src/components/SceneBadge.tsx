import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

export const SceneBadge: React.FC<{ number: number }> = ({ number }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  
  const scale = interpolate(frame, [10, 20, 25], [0.5, 1.1, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 24,
        left: 24,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #89b4fa, #cba6f7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 24,
        fontWeight: 700,
        fontFamily,
        color: "#11111b",
        opacity,
        transform: `scale(${scale})`,
        boxShadow: "0 4px 20px rgba(137, 180, 250, 0.3)",
        zIndex: 100,
      }}
    >
      {number.toString().padStart(2, "0")}
    </div>
  );
};
