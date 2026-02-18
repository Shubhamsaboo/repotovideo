import React from "react";
import { useCurrentFrame } from "remotion";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

const generateParticles = (count: number, colors: string[]): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    x: (i * 73 + 17) % 100,
    y: (i * 47 + 31) % 100,
    size: 2 + (i % 4),
    speed: 0.3 + (i % 7) * 0.15,
    opacity: 0.1 + (i % 5) * 0.05,
    color: colors[i % colors.length],
  }));
};

export const FloatingParticles: React.FC<{
  count?: number;
  colors?: string[];
  direction?: "up" | "down" | "drift";
}> = ({ count = 30, colors = ["#89b4fa", "#cba6f7", "#f5c2e7"], direction = "up" }) => {
  const frame = useCurrentFrame();
  const particles = React.useMemo(() => generateParticles(count, colors), [count, colors]);

  return (
    <>
      {particles.map((p, i) => {
        let yOffset, xOffset;
        if (direction === "up") {
          yOffset = (frame * p.speed) % 120;
          xOffset = Math.sin(frame * 0.02 + i) * 2;
        } else if (direction === "down") {
          yOffset = -(frame * p.speed) % 120;
          xOffset = Math.sin(frame * 0.02 + i) * 2;
        } else {
          // drift
          yOffset = Math.sin(frame * 0.01 + i) * 3;
          xOffset = Math.cos(frame * 0.015 + i * 0.5) * 4;
        }
        
        const py = p.y + yOffset;
        const px = p.x + xOffset;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${((px % 110) + 110) % 110}%`,
              top: `${((py % 110) + 110) % 110}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: p.color,
              opacity: p.opacity,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        );
      })}
    </>
  );
};
