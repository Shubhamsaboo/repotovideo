import React from "react";

export const GradientBackground: React.FC<{
  variant: "purple" | "blue" | "teal" | "pink" | "orange" | "green";
  animate?: boolean;
}> = ({ variant, animate = false }) => {
  const gradients = {
    purple: "linear-gradient(135deg, #1e1e2e 0%, #2d1e3d 40%, #1a1a2e 100%)",
    blue: "linear-gradient(135deg, #0f1419 0%, #1a2332 40%, #0d1821 100%)",
    teal: "linear-gradient(135deg, #0d1b2a 0%, #1b3a4b 40%, #0f1f2e 100%)",
    pink: "linear-gradient(135deg, #1e1729 0%, #2d1b3d 40%, #1a1524 100%)",
    orange: "linear-gradient(135deg, #1a1410 0%, #2d1f15 40%, #15110d 100%)",
    green: "linear-gradient(135deg, #0d1a15 0%, #1b2d24 40%, #0f1a16 100%)",
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: gradients[variant],
        ...(animate && {
          animation: "gradientShift 20s ease-in-out infinite",
        }),
      }}
    />
  );
};
