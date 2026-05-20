"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface MomentumRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const COLORS = [
  { threshold: 85, color: "#22C55E", label: "Elite" },
  { threshold: 65, color: "#06B6D4", label: "High" },
  { threshold: 40, color: "#F59E0B", label: "Rising" },
  { threshold: 0, color: "#6B7280", label: "Static" },
];

function getColor(score: number) {
  return COLORS.find((c) => score >= c.threshold) || COLORS[COLORS.length - 1];
}

export function MomentumRing({ score, size = "md", onClick }: MomentumRingProps) {
  const match = getColor(score);
  const dimensions = size === "lg" ? 96 : size === "md" ? 72 : 48;
  const strokeWidth = size === "lg" ? 5 : size === "md" ? 4 : 3;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [score, count]);

  const progress = useTransform(count, (v) => circumference - (v / 100) * circumference);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative inline-flex items-center justify-center outline-none"
      style={{ width: dimensions, height: dimensions }}
    >
      <svg width={dimensions} height={dimensions} className="transform -rotate-90">
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke={match.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: progress }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className={`font-bold font-mono tabular-nums ${size === "lg" ? "text-lg" : size === "md" ? "text-sm" : "text-[10px]"}`}
          style={{ color: match.color }}
        >
          {rounded}
        </motion.span>
      </div>

      {/* Glow ring — uses SVG filter for circular drop-shadow */}
      {score >= 65 && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width={dimensions}
          height={dimensions}
          style={{ filter: `drop-shadow(0 0 ${size === "lg" ? "12px" : "8px"} ${match.color})` }}
        >
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill={match.color}
            opacity={0.25}
            className="animate-pulse-slow"
          />
        </svg>
      )}
    </motion.button>
  );
}

export function MomentumBar({ score }: { score: number }) {
  const match = getColor(score);

  return (
    <div className="relative h-2 rounded-full bg-onyx-700/60 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(score, 100)}%` }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="h-full rounded-full"
        style={{ backgroundColor: match.color, boxShadow: score >= 65 ? `0 0 12px ${match.color}60` : undefined }}
      />
      {score >= 85 && (
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      )}
    </div>
  );
}
