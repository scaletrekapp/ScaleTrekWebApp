"use client";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "violet" | "cyan" | "green" | "amber";
  glow?: boolean;
}

export function HolographicCard({ children, className = "", variant = "violet", glow = true }: HolographicCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);

  const colors = {
    violet: { border: "rgba(139,92,246,0.3)", glow: "rgba(139,92,246,0.15)" },
    cyan: { border: "rgba(6,182,212,0.3)", glow: "rgba(6,182,212,0.15)" },
    green: { border: "rgba(34,197,94,0.3)", glow: "rgba(34,197,94,0.15)" },
    amber: { border: "rgba(245,158,11,0.3)", glow: "rgba(245,158,11,0.15)" },
  };
  const c = colors[variant];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / 20);
    setRotateY((x - centerX) / 20);
    setGlowX((x / rect.width) * 100);
    setGlowY((y / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlowX(50);
    setGlowY(50);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 60, damping: 20, mass: 1 }}
      className={`relative rounded-xl border overflow-hidden ${className}`}
      style={{
        borderColor: c.border,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      {glow && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${glowX}% ${glowY}%, ${c.glow}, transparent 60%)`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
