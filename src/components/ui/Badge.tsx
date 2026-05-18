interface BadgeProps {
  label: string;
  color?: string;
  variant?: "default" | "outline" | "glow";
  size?: "sm" | "md";
}

export function Badge({ label, color = "#8B5CF6", variant = "default", size = "sm" }: BadgeProps) {
  const isSm = size === "sm";
  const variantStyles = {
    default: { backgroundColor: `${color}20` },
    outline: { borderColor: color, borderWidth: 0.5, backgroundColor: "transparent" },
    glow: {
      backgroundColor: `${color}15`,
      boxShadow: `0 0 8px ${color}40`,
    },
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wide uppercase ${
        isSm ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
      style={{
        ...variantStyles[variant],
        color,
        border: variant === "outline" ? `1px solid ${color}` : undefined,
      }}
    >
      {label}
    </span>
  );
}
