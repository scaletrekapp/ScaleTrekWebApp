"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";

export default function EditProfilePage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user: authUser, isLoading, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    handle: "", headline: "", bio: "", location: "", website: "", companyName: "", sector: "",
  });

  useEffect(() => {
    if (isLoading) return;
    if (!authUser) { router.push(`/${lang}`); return; }
    setForm({
      handle: authUser.handle || "",
      headline: authUser.headline || "",
      bio: authUser.bio || "",
      location: authUser.location || "",
      website: authUser.website || "",
      companyName: authUser.companyName || "",
      sector: authUser.sector || "",
    });
  }, [authUser, isLoading, router, lang]);

  const handleSave = async () => {
    if (!authUser) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      handle: form.handle,
      headline: form.headline || null,
      bio: form.bio || null,
      location: form.location || null,
      website: form.website || null,
      company_name: form.companyName || null,
      sector: form.sector || null,
    }).eq("id", authUser.id);

    setUser({ ...authUser, ...form });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-midnight">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-midnight dark:text-white">{t("profile.edit.title")}</h1>
          {saved && <span className="text-xs text-green-500 font-semibold">{t("profile.edit.saved")}</span>}
        </div>

        <GlassCard variant="dark">
          <div className="space-y-5">
            {(["handle", "headline", "bio", "location", "website", "company", "sector"] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-slate-muted uppercase tracking-wider mb-1.5">
                  {t(`profile.edit.${field === "company" ? "company" : field === "handle" ? "handle" : field === "headline" ? "headline" : field === "bio" ? "bio" : field}`)}
                </label>
                {field === "bio" ? (
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-border text-midnight dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet/40 resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={(form as any)[field === "company" ? "companyName" : field]}
                    onChange={(e) => {
                      const key = field === "company" ? "companyName" : field;
                      setForm({ ...form, [key]: e.target.value });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-border text-midnight dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet/40"
                  />
                )}
              </div>
            ))}

            <button
              onClick={handleSave}
              disabled={saving || !form.handle}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet to-violet-dark text-white font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? t("profile.edit.saving") : t("profile.edit.save")}
            </button>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
