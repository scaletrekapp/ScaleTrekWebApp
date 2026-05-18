interface MomentumPillProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

const COLORS = [
  { threshold: 85, color: "#22C55E", label: "Elite" },
  { threshold: 65, color: "#06B6D4", label: "High" },
  { threshold: 40, color: "#F59E0B", label: "Rising" },
  { threshold: 0, color: "#6B7280", label: "Static" },
] as const;

export function MomentumPill({ score, size = "sm" }: MomentumPillProps) {
  const match = COLORS.find((c) => score >= c.threshold) || COLORS[COLORS.length - 1];
  const isHigh = score >= 85;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : size === "md" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      }`}
      style={{
        backgroundColor: `${match.color}15`,
        color: match.color,
        boxShadow: isHigh ? `0 0 12px ${match.color}40` : undefined,
      }}
    >
      {isHigh && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
          style={{ backgroundColor: match.color }}
        />
      )}
      {match.label} · {score}
    </div>
  );
}
