"use client";
interface NeonGlowProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  as?: "span" | "div";
}

export function NeonGlow({ children, color = "#8B5CF6", className = "", as: Tag = "span" }: NeonGlowProps) {
  return (
    <Tag className={`relative ${className}`} style={{ textShadow: `0 0 20px ${color}40, 0 0 40px ${color}20` }}>
      {children}
    </Tag>
  );
}
