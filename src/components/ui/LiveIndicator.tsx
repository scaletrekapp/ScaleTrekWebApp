"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-client";

interface LiveIndicatorProps {
  className?: string;
  compact?: boolean;
}

export function LiveIndicator({ className = "", compact = false }: LiveIndicatorProps) {
  const [count, setCount] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    const supabase = createClient();
    const updateCount = async () => {
      try {
        const { count: total } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
        if (mounted.current && total !== null) {
          setCount(total || 0);
          setInitialized(true);
        }
      } catch {}
    };
    updateCount();
    const interval = setInterval(updateCount, 60000);
    return () => { mounted.current = false; clearInterval(interval); };
  }, []);

  if (!initialized) return null;

  const displayCount = count > 0 ? count : undefined;

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 text-[10px] text-slate-muted ${className}`}>
        <span className="relative flex w-1.5 h-1.5">
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
          <span className="relative rounded-full w-1.5 h-1.5 bg-green-500" />
        </span>
        {displayCount ? `${displayCount} members` : "Live"}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 ${className}`}>
      <span className="relative flex w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
        <span className="relative rounded-full w-2 h-2 bg-green-500" />
      </span>
      <span className="text-[10px] font-semibold text-green-500">
        {displayCount ? `${displayCount} users in network` : "Connected"}
      </span>
    </div>
  );
}
