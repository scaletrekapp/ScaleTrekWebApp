"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function CreatePage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [type, setType] = useState<"dreamer" | "reality">("dreamer");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [milestone, setMilestone] = useState("");
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPosting(true);
    const supabase = createClient();
    await supabase.from("posts").insert({
      user_id: user.id,
      type,
      title,
      description,
      milestone: milestone || null,
      risk_level: type === "dreamer" ? 70 : 30,
    });
    setPosting(false);
    router.push(`/${lang}/feed`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-midnight">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-midnight dark:text-white mb-8">{t("create.title")}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <GlassCard variant="dark">
            <div className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
              <button
                type="button"
                onClick={() => setType("dreamer")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  type === "dreamer" ? "bg-white dark:bg-midnight3 text-violet shadow-sm" : "text-slate-muted"
                }`}
              >
                {t("feed.dreamer")}
              </button>
              <button
                type="button"
                onClick={() => setType("reality")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  type === "reality" ? "bg-white dark:bg-midnight3 text-cyan shadow-sm" : "text-slate-muted"
                }`}
              >
                {t("feed.reality")}
              </button>
            </div>
          </GlassCard>

          <GlassCard variant="dark">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-muted uppercase tracking-wider mb-1.5">
                  {t("create.title")}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-border text-midnight dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-muted uppercase tracking-wider mb-1.5">
                  {t("create.milestone")}
                </label>
                <select
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-border text-midnight dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet/40"
                >
                  <option value="">{t("create.selectMilestone")}</option>
                  <option value="idea">Idea</option>
                  <option value="mvp">MVP</option>
                  <option value="launch">Launch</option>
                  <option value="growth">Growth</option>
                  <option value="scale">Scale</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-muted uppercase tracking-wider mb-1.5">
                  {t("create.description")}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder={t("create.descriptionPlaceholder")}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-border text-midnight dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet/40 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={posting || !title}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet to-violet-dark text-white font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {posting ? t("create.posting") : t("create.post")}
                </button>
              </div>
            </div>
          </GlassCard>
        </form>
      </main>
    </div>
  );
}
