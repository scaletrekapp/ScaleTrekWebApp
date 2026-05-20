"use client";

interface VerifiedBadgeProps {
  scale?: "none" | "basic" | "verified" | "elite";
  size?: "sm" | "md";
}

const scaleConfig = {
  basic: { color: "#94a3b8", label: "Basic" },
  verified: { color: "var(--cyan)", label: "Verified" },
  elite: { color: "#f59e0b", label: "Elite" },
};

export function VerifiedBadge({ scale, size = "sm" }: VerifiedBadgeProps) {
  if (!scale || scale === "none") return null;
  const cfg = scaleConfig[scale];
  const dim = size === "sm" ? 14 : 18;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill={cfg.color}
      style={{
        filter: `drop-shadow(0 0 4px ${cfg.color}40)`,
        flexShrink: 0,
      }}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
