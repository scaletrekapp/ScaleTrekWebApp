"use client";

import { useEffect, useRef, useState } from "react";

interface MetricTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  verified?: boolean;
  delta?: number;
  formatter?: (v: number) => string;
}

export function MetricTicker({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 900,
  verified,
  delta,
  formatter,
}: MetricTickerProps) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    startTime.current = null;
    const from = 0;
    const diff = value - from;

    function tick(now: number) {
      if (!startTime.current) startTime.current = now;
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + diff * eased);
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  const formatted = formatter
    ? formatter(display)
    : display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return (
    <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums animate-count-up">
      {prefix && <span className="text-slate-muted dark:text-slate-muted text-xs">{prefix}</span>}
      <span>{formatted}</span>
      {suffix && <span className="text-slate-muted dark:text-slate-muted text-xs">{suffix}</span>}
      {verified && (
        <svg className="w-3.5 h-3.5 text-cyan dark:text-cyan" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      {delta !== undefined && (
        <span className={`text-[10px] ${delta >= 0 ? "text-green-500" : "text-red-500"}`}>
          {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}%
        </span>
      )}
    </span>
  );
}
