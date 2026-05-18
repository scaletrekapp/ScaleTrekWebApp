"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  style?: React.CSSProperties;
}

export function AnimatedCounter({ from = 0, to, duration = 1.5, className = "", suffix = "", prefix = "", style }: AnimatedCounterProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, to, { duration, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [to, count, duration]);

  return (
    <motion.span className={`font-mono tabular-nums ${className}`} style={style}>
      {prefix}<motion.span>{rounded}</motion.span>{suffix}
    </motion.span>
  );
}
