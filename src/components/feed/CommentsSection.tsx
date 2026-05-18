"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  handle?: string;
}

export function CommentsSection({ postId }: { postId: string }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("post_comments")
      .select("*, profiles!inner(handle)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) {
          setComments(
            data.map((c: any) => ({ ...c, handle: c.profiles?.handle }))
          );
        }
        setLoading(false);
      });
  }, [postId]);

  const handleSubmit = async () => {
    if (!user || !text.trim()) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("post_comments")
      .insert({ post_id: postId, user_id: user.id, content: text.trim() })
      .select("*, profiles!inner(handle)")
      .single();
    if (data) {
      setComments((prev) => [...prev, { ...data, handle: data.profiles?.handle }]);
    }
    setText("");
  };

  return (
    <div className="pt-3 border-t border-slate-border mt-3">
      {user && (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={t("profile.postComment")}
            className="flex-1 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-slate-border text-xs text-midnight dark:text-white focus:outline-none focus:ring-2 focus:ring-violet/40"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="px-3 py-1.5 rounded-lg bg-violet text-white text-[10px] font-semibold hover:brightness-110 transition-all disabled:opacity-50"
          >
            {t("post.comment")}
          </button>
        </div>
      )}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {loading ? (
          <div className="text-center py-3 text-[10px] text-slate-muted">{t("common.loading")}</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-3 text-[10px] text-slate-muted">{t("feed.empty")}</div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-violet/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[7px] font-bold text-violet">{c.handle?.charAt(0).toUpperCase() || "?"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-midnight dark:text-white">@{c.handle}</span>
                  <span className="text-[8px] text-slate-muted">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-muted">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
