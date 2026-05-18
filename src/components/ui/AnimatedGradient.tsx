"use client";
export function AnimatedGradient({ className = "" }: { className?: string }) {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet/20 dark:bg-violet/10 blur-[120px] animate-pulse-slow" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-cyan/20 dark:bg-cyan/10 blur-[120px] animate-pulse-slower" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-violet/5 via-transparent to-cyan/5 dark:from-violet/[0.03] dark:to-cyan/[0.03] blur-[150px]" />
    </div>
  );
}
