"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-client";

interface Activity {
  id: string;
  text: string;
  color: string;
  icon: string;
}

export function SocialTicker() {
  const [activities, setActivities] = useState<Activity[]>([
    { id: "1", text: "Network initializing...", color: "#8B5CF6", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  ]);
  const mounted = useRef(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchRecent = async () => {
      try {
        const [profiles, posts] = await Promise.all([
          supabase.from("profiles").select("id, handle, created_at").order("created_at", { ascending: false }).limit(3),
          supabase.from("posts").select("id, title, type, created_at").order("created_at", { ascending: false }).limit(3),
        ]);
        if (!mounted.current) return;
        const items: Activity[] = [];
        if (profiles.data) {
          profiles.data.forEach((p) => {
            items.push({
              id: `p-${p.id}`,
              text: `@${p.handle} joined the network`,
              color: "#8B5CF6",
              icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
            });
          });
        }
        if (posts.data) {
          posts.data.forEach((p) => {
            items.push({
              id: `post-${p.id}`,
              text: `New ${p.type} post: "${p.title?.slice(0, 40)}"`,
              color: p.type === "dreamer" ? "#8B5CF6" : "#06B6D4",
              icon: p.type === "dreamer" ? "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" : "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
            });
          });
        }
        if (items.length > 0) setActivities(items);
      } catch {}
    };
    fetchRecent();
    const interval = setInterval(fetchRecent, 30000);
    return () => { mounted.current = false; clearInterval(interval); };
  }, []);

  return (
    <div className="relative overflow-hidden h-8 bg-gradient-to-r from-violet/5 via-cyan/5 to-violet/5 dark:from-violet/[0.03] dark:via-cyan/[0.03] dark:to-violet/[0.03] border-y border-slate-border">
      <div className="flex items-center h-full animate-marquee">
        <div className="flex items-center gap-8 px-4 whitespace-nowrap">
          {[...activities, ...activities, ...activities].map((a, i) => (
            <div key={`${a.id}-${i}`} className="flex items-center gap-2 text-[11px] text-slate-muted">
              <svg className="w-3 h-3" fill="none" stroke={a.color} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
              </svg>
              <span dangerouslySetInnerHTML={{ __html: a.text }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
