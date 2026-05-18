"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase-client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useRealtime<T extends Record<string, any>>(
  table: string,
  event: "INSERT" | "UPDATE" | "DELETE" | "*" = "*",
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  filter?: { column: string; value: string }
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          ...(filter ? { filter: `${filter.column}=eq.${filter.value}` } : {}),
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          cbRef.current(payload);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table, event, filter?.column, filter?.value]);
}
