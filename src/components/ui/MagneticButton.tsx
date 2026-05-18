"use client";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function MagneticButton({ children, variant = "primary", size = "md", loading, className = "", ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width / 2;
    const dy = e.clientY - rect.top - rect.height / 2;
    setX(dx * 0.2);
    setY(dy * 0.2);
  };

  const handleMouseLeave = () => {
    setX(0);
    setY(0);
  };

  const base = "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  const variants = {
    primary: "bg-gradient-to-r from-violet to-violet-dark text-white shadow-lg shadow-violet/20",
    secondary: "bg-white dark:bg-midnight3 text-midnight dark:text-white border border-slate-border",
    ghost: "text-slate-muted hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-4 py-2 text-xs",
    lg: "px-6 py-3 text-sm",
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.5 }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...(props as any)}
    >
      {loading && <motion.div className="w-3.5 h-3.5 mr-2 border-2 border-current border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />}
      {children}
    </motion.button>
  );
}
