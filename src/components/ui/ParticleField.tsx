"use client";
import { useMemo } from "react";

interface ParticleFieldProps {
  count?: number;
  className?: string;
  color?: string;
}

export function ParticleField({ count = 15, className = "", color = "#8B5CF6" }: ParticleFieldProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: 1 + Math.random() * 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: i * 0.7,
      duration: 15 + Math.random() * 15,
      opacity: 0.1 + Math.random() * 0.2,
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: color,
            opacity: p.opacity,
            animation: `drift ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
