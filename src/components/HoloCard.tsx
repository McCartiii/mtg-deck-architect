"use client";
import { useRef, useState } from "react";

const RARITY_FOIL: Record<string, string> = {
  common:   "linear-gradient(135deg, rgba(200,200,200,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(200,200,200,0.15) 100%)",
  uncommon: "linear-gradient(135deg, rgba(80,200,120,0.2) 0%, rgba(150,255,180,0.08) 50%, rgba(80,200,120,0.2) 100%)",
  rare:     "linear-gradient(135deg, rgba(0,150,255,0.25) 0%, rgba(245,158,11,0.2) 50%, rgba(0,150,255,0.25) 100%)",
  mythic:   "linear-gradient(135deg, rgba(255,80,0,0.3) 0%, rgba(255,200,0,0.2) 50%, rgba(255,80,0,0.3) 100%)",
  special:  "linear-gradient(135deg, rgba(255,0,255,0.2) 0%, rgba(0,255,255,0.2) 33%, rgba(255,255,0,0.2) 66%, rgba(255,0,255,0.2) 100%)",
};

const RARITY_GLOW: Record<string, string> = {
  common:   "0 0 16px rgba(200,200,200,0.25)",
  uncommon: "0 0 20px rgba(80,200,120,0.35)",
  rare:     "0 0 24px rgba(0,150,255,0.4)",
  mythic:   "0 0 28px rgba(255,80,0,0.45)",
  special:  "0 0 32px rgba(255,0,255,0.4), 0 0 64px rgba(0,255,255,0.2)",
};

interface Props {
  rarity?: string;
  children: React.ReactNode;
  className?: string;
}

export function HoloCard({ rarity = "common", children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [foilPos, setFoilPos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (py - 0.5) * -16, y: (px - 0.5) * 16 });
    setFoilPos({ x: px * 100, y: py * 100 });
  }

  function onMouseLeave() {
    setTilt({ x: 0, y: 0 });
    setFoilPos({ x: 50, y: 50 });
    setHovered(false);
  }

  const foilBg = RARITY_FOIL[rarity] ?? RARITY_FOIL.common;

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
    >
      <div
        style={{
          transform: hovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : "rotateX(0) rotateY(0) scale(1)",
          transition: hovered ? "transform 0.1s ease" : "transform 0.5s ease",
          boxShadow: hovered ? (RARITY_GLOW[rarity] ?? RARITY_GLOW.common) : "none",
          borderRadius: "0.75rem",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}
        {/* Foil overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: foilBg,
            backgroundSize: "200% 200%",
            backgroundPosition: `${foilPos.x}% ${foilPos.y}%`,
            mixBlendMode: "screen",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
            borderRadius: "0.75rem",
          }}
        />
      </div>
    </div>
  );
}
