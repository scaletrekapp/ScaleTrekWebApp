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
      ? "bg-white dark:bg-midnight2 border border-slate-border"
      : variant === "accent"
        ? "bg-glass-bg border"
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
