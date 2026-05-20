import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "dark" | "glass" | "accent";
  accentColor?: string;
  style?: React.CSSProperties;
}

export function GlassCard({
  children,
  className = "",
  variant = "glass",
  accentColor,
  style,
}: GlassCardProps) {
  const base =
    variant === "dark"
      ? "bg-graphite-900/60 border border-graphite-800/60"
      : variant === "accent"
        ? "bg-graphite-900/40 border border-violet/20"
        : "bg-glass-bg border border-glass-border";

  const accentStyle = variant === "accent" && accentColor
    ? { borderColor: accentColor }
    : {};

  return (
    <div
      className={`rounded-xl p-4 ${base} ${className}`}
      style={{ ...accentStyle, ...style }}
    >
      {children}
    </div>
  );
}
