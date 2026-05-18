"use client";
import React from "react";
interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}
export function GlowButton({ children, variant = "primary", size = "md", loading, className = "", ...props }: GlowButtonProps) {
  const base = "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  const variants = {
    primary: "bg-gradient-to-r from-violet to-violet-dark text-white hover:brightness-110 shadow-lg shadow-violet/20",
    secondary: "bg-white dark:bg-midnight3 text-midnight dark:text-white border border-slate-border hover:bg-black/5 dark:hover:bg-white/5",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    ghost: "text-slate-muted hover:text-midnight dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-4 py-2 text-xs",
    lg: "px-6 py-3 text-sm",
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <div className="w-3.5 h-3.5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}
