"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen bg-onyx-900">
      <main className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-heading text-white">{t("profile.edit.title")}</h1>
          {saved && <span className="text-caption text-emerald font-semibold">{t("profile.edit.saved")}</span>}
        </div>

        <div className="surface-card p-6 max-w-2xl">
          <div className="space-y-5">
            {(["handle", "headline", "bio", "location", "website", "company", "sector"] as const).map((field) => (
              <div key={field}>
                <label className="block text-caption text-muted uppercase tracking-wider mb-1.5">
                  {t(`profile.edit.${field === "company" ? "company" : field === "handle" ? "handle" : field === "headline" ? "headline" : field === "bio" ? "bio" : field}`)}
                </label>
                {field === "bio" ? (
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-onyx-800 border border-onyx-700/60 text-white text-body focus:outline-none focus:ring-2 focus:ring-violet/40 resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={(form as any)[field === "company" ? "companyName" : field]}
                    onChange={(e) => {
                      const key = field === "company" ? "companyName" : field;
                      setForm({ ...form, [key]: e.target.value });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-onyx-800 border border-onyx-700/60 text-white text-body focus:outline-none focus:ring-2 focus:ring-violet/40"
                  />
                )}
              </div>
            ))}

            <button
              onClick={handleSave}
              disabled={saving || !form.handle}
              className="btn-primary btn-md w-full"
            >
              {saving ? t("profile.edit.saving") : t("profile.edit.save")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
