interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  const s = (n: number) => (n / 120) * size;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>
        </defs>

        {/* Dreamer node */}
        <circle cx="30" cy="90" r="8" fill="#FF9500" opacity="0.95" />
        <circle cx="30" cy="90" r="14" fill="none" stroke="#FF9500" strokeWidth="1.8" opacity="0.25" />

        {/* Progress node */}
        <circle cx="60" cy="60" r="10" fill="url(#logoGrad)" />
        <circle cx="60" cy="60" r="18" fill="none" stroke="url(#logoGrad)" strokeWidth="1.8" opacity="0.35" />

        {/* Reality node */}
        <circle cx="90" cy="30" r="12" fill="#00C896" opacity="1" />
        <circle cx="90" cy="30" r="22" fill="none" stroke="#00C896" strokeWidth="1.8" opacity="0.45" />

        {/* Trek path */}
        <path d="M30 90 Q45 75 60 60 Q75 45 90 30" stroke="url(#logoGrad)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Milestone dots */}
        <circle cx="40" cy="80" r="2.5" fill="#00E5FF" opacity="0.6" />
        <circle cx="53" cy="67" r="2.5" fill="#00E5FF" opacity="0.75" />
        <circle cx="72" cy="48" r="2.5" fill="#00E5FF" opacity="0.75" />
        <circle cx="83" cy="37" r="2.5" fill="#00E5FF" opacity="0.6" />
      </svg>

      {showText && (
        <span className="font-logo text-sm sm:text-base text-white tracking-tight font-bold">
          ScaleTrek
        </span>
      )}
    </div>
  );
}
